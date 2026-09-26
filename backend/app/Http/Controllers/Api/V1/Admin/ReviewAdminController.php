<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReviewAdminController extends Controller
{
    /**
     * GET /api/v1/admin/reviews
     * Admin review listing with filters & pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Review::with(['product:id,name,slug', 'user:id,name,email', 'images']);

        if ($request->filled('status')) {
            $query->where('status', strtoupper($request->input('status')));
        }

        if ($request->filled('product_id')) {
            $query->where('product_id', (int) $request->input('product_id'));
        }

        if ($request->filled('search')) {
            $search = trim($request->input('search'));
            $query->where(function ($q) use ($search) {
                $q->where('comment', 'LIKE', "%{$search}%")
                  ->orWhere('title', 'LIKE', "%{$search}%")
                  ->orWhere('reviewer_name', 'LIKE', "%{$search}%")
                  ->orWhereHas('product', function ($pq) use ($search) {
                      $pq->where('name', 'LIKE', "%{$search}%");
                  });
            });
        }

        $reviews = $query->orderBy('id', 'desc')->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $reviews->items(),
            'meta' => [
                'pagination' => [
                    'total' => $reviews->total(),
                    'per_page' => $reviews->perPage(),
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * POST /api/v1/admin/reviews
     * Admin create custom review for any product.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'reviewer_name' => 'required|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|max:2000',
            'status' => 'nullable|in:PENDING,APPROVED,REJECTED',
            'is_verified_purchase' => 'nullable|boolean',
            'image_urls' => 'nullable|array',
            'image_urls.*' => 'nullable|string|url',
            'images.*' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,avif,gif|max:5120',
        ]);

        $productId = (int) $request->input('product_id');

        $review = Review::create([
            'product_id' => $productId,
            'user_id' => null,
            'reviewer_name' => $request->input('reviewer_name'),
            'rating' => (int) $request->input('rating'),
            'title' => $request->input('title') ?: 'Verified Customer Review',
            'comment' => $request->input('comment'),
            'is_verified_purchase' => $request->boolean('is_verified_purchase', true),
            'status' => $request->input('status', 'APPROVED'),
        ]);

        // Upload files if provided
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                if ($file->isValid()) {
                    $path = $file->store('reviews', 'public');
                    ReviewImage::create([
                        'review_id' => $review->id,
                        'image_url' => asset('storage/' . $path),
                        'created_at' => now(),
                    ]);
                }
            }
        }

        // Image URLs if provided as strings
        if ($request->filled('image_urls') && is_array($request->input('image_urls'))) {
            foreach ($request->input('image_urls') as $url) {
                if (filter_var($url, FILTER_VALIDATE_URL)) {
                    ReviewImage::create([
                        'review_id' => $review->id,
                        'image_url' => $url,
                        'created_at' => now(),
                    ]);
                }
            }
        }

        Review::recalculateProductRating($productId);

        return response()->json([
            'success' => true,
            'message' => 'Admin review created successfully.',
            'data' => $review->load('images', 'product'),
        ], 201);
    }

    /**
     * GET /api/v1/admin/reviews/{id}
     * Get single review details.
     */
    public function show(int $id): JsonResponse
    {
        $review = Review::with(['product:id,name,slug', 'user:id,name,email', 'images'])->find($id);
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $review,
        ], 200);
    }

    /**
     * PUT /api/v1/admin/reviews/{id}
     * Update review details.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $review = Review::find($id);
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found.'], 404);
        }

        $request->validate([
            'reviewer_name' => 'nullable|string|max:255',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|max:2000',
            'status' => 'required|in:APPROVED,REJECTED,PENDING',
            'is_verified_purchase' => 'nullable|boolean',
        ]);

        $review->update([
            'reviewer_name' => $request->input('reviewer_name', $review->reviewer_name),
            'rating' => (int) $request->input('rating'),
            'title' => $request->input('title'),
            'comment' => $request->input('comment'),
            'status' => $request->input('status'),
            'is_verified_purchase' => $request->boolean('is_verified_purchase', $review->is_verified_purchase),
            'updated_at' => now(),
        ]);

        Review::recalculateProductRating($review->product_id);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully.',
            'data' => $review->load('images', 'product'),
        ], 200);
    }

    /**
     * PUT /api/v1/admin/reviews/{id}/status
     * Quick status update (APPROVED, REJECTED, PENDING).
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:APPROVED,REJECTED,PENDING',
        ]);

        $review = Review::find($id);
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found.'], 404);
        }

        $review->update([
            'status' => $request->input('status'),
            'updated_at' => now(),
        ]);

        Review::recalculateProductRating($review->product_id);

        return response()->json([
            'success' => true,
            'message' => "Review status updated to {$request->input('status')}.",
        ], 200);
    }

    /**
     * DELETE /api/v1/admin/reviews/{id}
     * Delete review and associated image files.
     */
    public function destroy(int $id): JsonResponse
    {
        $review = Review::with('images')->find($id);
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found.'], 404);
        }

        $productId = $review->product_id;

        // Delete physical files if stored locally
        foreach ($review->images as $img) {
            if (str_contains($img->image_url, '/storage/reviews/')) {
                $fileName = basename($img->image_url);
                Storage::disk('public')->delete('reviews/' . $fileName);
            }
        }

        $review->delete();

        Review::recalculateProductRating($productId);

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully.',
        ], 200);
    }
}
