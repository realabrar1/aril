<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CustomerReviewController extends Controller
{
    /**
     * Submit a product review from verified customer.
     * POST /api/v1/customer/reviews
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|min:3|max:2000',
            'images.*' => 'nullable|file|image|mimes:jpeg,png,jpg,webp,avif,gif|max:5120',
        ]);

        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $productId = (int) $request->input('product_id');

        // 1. SERVER-SIDE VERIFICATION: Verify that logged-in user actually purchased this product
        $eligibleOrder = Order::where('user_id', $user->id)
            ->whereNotIn('status', ['CANCELLED', 'FAILED'])
            ->whereHas('items', function ($q) use ($productId) {
                $q->where('product_id', $productId);
            })
            ->with(['items' => function ($q) use ($productId) {
                $q->where('product_id', $productId);
            }])
            ->orderBy('id', 'desc')
            ->first();

        if (!$eligibleOrder) {
            return response()->json([
                'success' => false,
                'message' => 'You can only review products you have actually purchased.',
            ], 403);
        }

        // 2. DUPLICATE CHECK: Check if customer has already reviewed this product
        $existingReview = Review::where('product_id', $productId)
            ->where('user_id', $user->id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already submitted a review for this product.',
                'data' => $existingReview,
            ], 422);
        }

        $orderItem = $eligibleOrder->items->firstWhere('product_id', $productId);

        // 3. CREATE REVIEW: Verified purchase set server-side
        $review = Review::create([
            'product_id' => $productId,
            'user_id' => $user->id,
            'order_id' => $eligibleOrder->id,
            'order_item_id' => $orderItem?->id,
            'reviewer_name' => $user->name,
            'rating' => (int) $request->input('rating'),
            'title' => $request->input('title') ?: 'Customer Review',
            'comment' => $request->input('comment'),
            'is_verified_purchase' => true,
            'status' => 'APPROVED', // Customer reviews for verified purchases are approved
        ]);

        // 4. HANDLE REVIEW PHOTO UPLOADS
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                if ($file->isValid()) {
                    $path = $file->store('reviews', 'public');
                    $imageUrl = asset('storage/' . $path);
                    ReviewImage::create([
                        'review_id' => $review->id,
                        'image_url' => $imageUrl,
                        'created_at' => now(),
                    ]);
                }
            }
        }

        // Recalculate average rating for product
        Review::recalculateProductRating($productId);

        Log::info("CustomerReviewController: Verified review #{$review->id} created by user #{$user->id} for product #{$productId}");

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your verified review has been submitted successfully.',
            'data' => $review->load('images'),
        ], 201);
    }

    /**
     * Get reviews submitted by current customer
     * GET /api/v1/customer/reviews
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $reviews = Review::with(['product:id,name,slug', 'images'])
            ->where('user_id', $user->id)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * Update existing review submitted by customer
     * PUT /api/v1/customer/reviews/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Unauthenticated.'], 401);
        }

        $review = Review::where('id', $id)->where('user_id', $user->id)->first();
        if (!$review) {
            return response()->json(['success' => false, 'message' => 'Review not found or unauthorized.'], 404);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'comment' => 'required|string|min:3|max:2000',
        ]);

        $review->update([
            'rating' => (int) $request->input('rating'),
            'title' => $request->input('title'),
            'comment' => $request->input('comment'),
            'updated_at' => now(),
        ]);

        Review::recalculateProductRating($review->product_id);

        return response()->json([
            'success' => true,
            'message' => 'Your review has been updated successfully.',
            'data' => $review->load('images'),
        ]);
    }
}
