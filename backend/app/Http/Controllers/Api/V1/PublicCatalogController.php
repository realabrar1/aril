<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicCatalogController extends Controller
{
    /**
     * GET /api/v1/categories
     * Public active categories for customer storefront.
     */
    public function categories(): JsonResponse
    {
        $categories = Category::where('status', 'ACTIVE')
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Active categories retrieved.',
            'data' => $categories,
        ], 200);
    }

    /**
     * GET /api/v1/collections
     * Public active collections for customer storefront.
     */
    public function collections(): JsonResponse
    {
        $collections = \App\Models\Collection::where('status', 'ACTIVE')
            ->withCount(['products' => function ($q) {
                $q->where('status', 'ACTIVE');
            }])
            ->orderBy('sort_order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Active collections retrieved.',
            'data' => $collections,
        ], 200);
    }

    /**
     * GET /api/v1/collections/{slug}
     * Public active single collection with its assigned products for customer storefront.
     */
    public function collectionBySlug(string $slug, Request $request): JsonResponse
    {
        $collection = \App\Models\Collection::where('slug', $slug)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$collection) {
            return response()->json([
                'success' => false,
                'message' => 'Collection not found.',
            ], 404);
        }

        $query = $collection->products()
            ->with(['category', 'collections', 'variants.inventory', 'images'])
            ->where('products.status', 'ACTIVE');

        // Search Filter
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('products.name', 'LIKE', "%{$search}%")
                  ->orWhere('products.description', 'LIKE', "%{$search}%")
                  ->orWhere('products.brand', 'LIKE', "%{$search}%")
                  ->orWhere('products.sku', 'LIKE', "%{$search}%");
            });
        }

        // Gender Filter
        if ($request->filled('gender')) {
            $query->where('products.gender', strtoupper($request->input('gender')));
        }

        // Price Filter
        if ($request->filled('min_price')) {
            $query->where('products.price', '>=', (float)$request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('products.price', '<=', (float)$request->input('max_price'));
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
            case 'price-low':
                $query->orderBy('products.price', 'asc');
                break;
            case 'price_desc':
            case 'price-high':
                $query->orderBy('products.price', 'desc');
                break;
            case 'best_seller':
                $query->orderBy('products.is_best_seller', 'desc')->orderBy('products.id', 'desc');
                break;
            case 'featured':
                $query->orderBy('products.is_featured', 'desc')->orderBy('products.id', 'desc');
                break;
            case 'newest':
            case 'latest':
            default:
                $query->orderBy('products.id', 'desc');
                break;
        }

        $perPage = (int)$request->input('per_page', 12);
        $products = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Collection retrieved successfully.',
            'data' => [
                'collection' => [
                    'id' => $collection->id,
                    'name' => $collection->name,
                    'slug' => $collection->slug,
                    'description' => $collection->description,
                    'image_url' => $collection->image_url,
                    'banner_url' => $collection->banner_url,
                    'seo_title' => $collection->seo_title,
                    'seo_description' => $collection->seo_description,
                    'status' => $collection->status,
                    'sort_order' => $collection->sort_order,
                    'product_count' => $collection->products()->where('products.status', 'ACTIVE')->count(),
                ],
                'products' => $products->items(),
            ],
            'meta' => [
                'pagination' => [
                    'total' => $products->total(),
                    'per_page' => $products->perPage(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * GET /api/v1/products
     * Public active products with search, category filtering, and variants for customer storefront.
     */
    public function products(Request $request): JsonResponse
    {
        $query = Product::with(['category', 'variants.inventory', 'images'])
            ->where('status', 'ACTIVE');

        // Category Filter
        if ($request->filled('category_slug')) {
          $catSlug = $request->input('category_slug');
          $category = Category::where('slug', $catSlug)->first();

          if ($category) {
              $childIds = Category::where('parent_id', $category->id)->pluck('id')->toArray();
              $catIds = array_merge([$category->id], $childIds);
              $query->whereIn('category_id', $catIds);
          }
        }

        // Gender Filter
        if ($request->filled('gender')) {
            $query->where('gender', strtoupper($request->input('gender')));
        }

        // Search Filter
        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        // Price Filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', (float)$request->input('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', (float)$request->input('max_price'));
        }

        // Sorting
        $sort = $request->input('sort', 'newest');
        switch ($sort) {
            case 'price_asc':
                $query->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price', 'desc');
                break;
            case 'best_seller':
                $query->orderBy('is_best_seller', 'desc')->orderBy('id', 'desc');
                break;
            case 'featured':
                $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('id', 'desc');
                break;
        }

        $perPage = (int)$request->input('per_page', 12);
        $products = $query->paginate($perPage);

        // Related / Recommendation Products fallback if search/filter returns 0 results
        $relatedProducts = [];
        if ($products->total() === 0) {
            $relatedProducts = Product::with(['category', 'variants.inventory', 'images'])
                ->where('status', 'ACTIVE')
                ->where('is_featured', true)
                ->orderBy('id', 'desc')
                ->limit(8)
                ->get();

            if ($relatedProducts->isEmpty()) {
                $relatedProducts = Product::with(['category', 'variants.inventory', 'images'])
                    ->where('status', 'ACTIVE')
                    ->orderBy('id', 'desc')
                    ->limit(8)
                    ->get();
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Active products retrieved.',
            'data' => $products->items(),
            'related_products' => $relatedProducts,
            'meta' => [
                'pagination' => [
                    'total' => $products->total(),
                    'per_page' => $products->perPage(),
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * GET /api/v1/products/suggestions?q=...
     * Live search autocomplete suggestions API endpoint.
     */
    public function searchSuggestions(Request $request): JsonResponse
    {
        $search = trim($request->input('q', ''));
        if (strlen($search) < 1) {
            return response()->json(['success' => true, 'data' => []], 200);
        }

        $products = Product::with(['category', 'images', 'variants'])
            ->where('status', 'ACTIVE')
            ->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('brand', 'LIKE', "%{$search}%")
                  ->orWhere('sku', 'LIKE', "%{$search}%")
                  ->orWhereHas('category', function ($catQuery) use ($search) {
                      $catQuery->where('name', 'LIKE', "%{$search}%");
                  });
            })
            ->limit(6)
            ->get();

        $suggestions = $products->map(function ($p) {
            $firstImage = $p->images->first()?->image_url ?? null;
            $firstVariant = $p->variants->first();
            $price = $p->price ?: ($firstVariant?->price ?? 0);
            $mrp = $p->mrp ?: ($firstVariant?->mrp ?? $price);

            return [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'price' => (float)$price,
                'mrp' => (float)$mrp,
                'category_name' => $p->category?->name ?? 'Women',
                'image_url' => $firstImage,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $suggestions,
        ], 200);
    }

    /**
     * GET /api/v1/products/{slug}
     * Public active single product details for customer storefront.
     */
    public function productBySlug(string $slug): JsonResponse
    {
        $product = Product::with(['category', 'variants.inventory', 'images'])
            ->where('slug', $slug)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product retrieved successfully.',
            'data' => $product,
        ], 200);
    }

    /**
     * GET /api/v1/products/{id}/reviews
     * Get approved reviews for a specific product.
     */
    public function productReviews(int $id, Request $request): JsonResponse
    {
        $product = Product::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found.'], 404);
        }

        $perPage = (int) $request->input('per_page', 10);

        // Fetch APPROVED reviews for THIS product only
        $reviewsQuery = \App\Models\Review::with(['images', 'user:id,name'])
            ->where('product_id', $id)
            ->where('status', 'APPROVED')
            ->orderBy('id', 'desc');

        $paginated = $reviewsQuery->paginate($perPage);

        // Calculate Star Breakdown Stats
        $allApproved = \App\Models\Review::where('product_id', $id)
            ->where('status', 'APPROVED')
            ->get();

        $totalCount = $allApproved->count();
        $avgRating = $totalCount > 0 ? round($allApproved->avg('rating'), 1) : 0;

        $breakdown = [
            '5' => $allApproved->where('rating', 5)->count(),
            '4' => $allApproved->where('rating', 4)->count(),
            '3' => $allApproved->where('rating', 3)->count(),
            '2' => $allApproved->where('rating', 2)->count(),
            '1' => $allApproved->where('rating', 1)->count(),
        ];

        $items = collect($paginated->items())->map(function ($rev) {
            return [
                'id' => $rev->id,
                'product_id' => $rev->product_id,
                'reviewer_name' => $rev->reviewer_name ?: ($rev->user?->name ?? 'Verified Customer'),
                'rating' => $rev->rating,
                'title' => $rev->title,
                'comment' => $rev->comment,
                'is_verified_purchase' => (bool) $rev->is_verified_purchase,
                'created_at' => $rev->created_at ? $rev->created_at->toIso8601String() : now()->toIso8601String(),
                'images' => $rev->images->pluck('image_url')->toArray(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'average_rating' => $avgRating,
                'total_reviews' => $totalCount,
                'rating_breakdown' => $breakdown,
                'reviews' => $items,
            ],
            'meta' => [
                'pagination' => [
                    'total' => $paginated->total(),
                    'per_page' => $paginated->perPage(),
                    'current_page' => $paginated->currentPage(),
                    'last_page' => $paginated->lastPage(),
                ],
            ],
        ], 200);
    }

    /**
     * GET /api/v1/products/{id}/review-eligibility
     * Check if currently logged in customer is eligible to submit a review for this product.
     */
    public function reviewEligibility(int $id, Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => true,
                'can_review' => false,
                'reason' => 'UNAUTHENTICATED',
                'message' => 'Please log in to review your purchased item.',
            ], 200);
        }

        // Check if user has purchased this product
        $eligibleOrder = \App\Models\Order::where('user_id', $user->id)
            ->whereNotIn('status', ['CANCELLED', 'FAILED'])
            ->whereHas('items', function ($q) use ($id) {
                $q->where('product_id', $id);
            })
            ->first();

        if (!$eligibleOrder) {
            return response()->json([
                'success' => true,
                'can_review' => false,
                'reason' => 'NOT_PURCHASED',
                'message' => 'You can review this product after purchasing it.',
            ], 200);
        }

        // Check if user has already submitted a review
        $existingReview = \App\Models\Review::where('product_id', $id)
            ->where('user_id', $user->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => true,
                'can_review' => false,
                'already_reviewed' => true,
                'reason' => 'ALREADY_REVIEWED',
                'message' => 'You have already submitted a review for this product.',
                'review' => $existingReview,
            ], 200);
        }

        return response()->json([
            'success' => true,
            'can_review' => true,
            'order_id' => $eligibleOrder->id,
            'message' => 'You are eligible to review this product.',
        ], 200);
    }
}
