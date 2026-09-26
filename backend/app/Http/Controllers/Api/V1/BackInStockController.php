<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BackInStockSubscription;
use App\Models\Product;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BackInStockController extends Controller
{
    /**
     * POST /api/v1/back-in-stock/subscribe
     * Subscribe customer email for stock alerts on an out-of-stock product.
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'nullable|exists:product_variants,id',
        ]);

        $email = strtolower(trim($request->input('email')));
        $productId = (int) $request->input('product_id');
        $variantId = $request->input('variant_id') ? (int) $request->input('variant_id') : null;

        $product = Product::find($productId);
        if (!$product || $product->status !== 'ACTIVE') {
            return response()->json([
                'success' => false,
                'message' => 'Product is not available for notifications.',
            ], 422);
        }

        $subscription = BackInStockSubscription::updateOrCreate(
            [
                'email' => $email,
                'product_id' => $productId,
                'status' => 'PENDING',
            ],
            [
                'variant_id' => $variantId,
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => "We'll notify you at {$email} as soon as this product is back in stock!",
            'data' => $subscription,
        ], 200);
    }

    /**
     * GET /api/v1/admin/back-in-stock
     * List all back-in-stock subscriptions for Admin Dashboard.
     */
    public function adminIndex(): JsonResponse
    {
        $subs = BackInStockSubscription::with(['product', 'variant'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subs,
        ], 200);
    }
}
