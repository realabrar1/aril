<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\FreeGiftCampaign;
use App\Models\FreeGiftItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FreeGiftAdminController extends Controller
{
    /**
     * Get Free Gift Campaign Settings & Analytics Summary
     */
    public function getCampaign(): JsonResponse
    {
        $campaign = FreeGiftCampaign::firstOrCreate(
            ['status' => 'ACTIVE'],
            [
                'name' => 'Free Gift Offer',
                'description' => 'Get a free gift on orders ₹899 or above',
                'min_order_amount' => 899.00,
                'online_payment_eligible' => true,
                'cod_eligible_above_threshold' => true,
                'max_gifts_per_order' => 1,
                'status' => 'ACTIVE',
            ]
        );

        $totalClaimed = FreeGiftItem::sum('claimed_count');
        $totalStock = FreeGiftItem::sum('gift_stock');

        return response()->json([
            'success' => true,
            'data' => [
                'campaign' => $campaign,
                'analytics' => [
                    'total_gifts_claimed' => (int) $totalClaimed,
                    'remaining_stock' => (int) $totalStock,
                    'total_configured_gifts' => FreeGiftItem::count(),
                ],
            ],
        ], 200);
    }

    /**
     * Update Free Gift Campaign Rules & Status
     */
    public function updateCampaign(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'min_order_amount' => 'required|numeric|min:0',
            'online_payment_eligible' => 'boolean',
            'cod_eligible_above_threshold' => 'boolean',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
        ]);

        $campaign = FreeGiftCampaign::first();
        if (!$campaign) {
            $campaign = new FreeGiftCampaign();
        }

        $campaign->fill([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'min_order_amount' => (float) $request->input('min_order_amount', 500.00),
            'online_payment_eligible' => $request->boolean('online_payment_eligible', true),
            'cod_eligible_above_threshold' => $request->boolean('cod_eligible_above_threshold', true),
            'start_at' => $request->input('start_at'),
            'end_at' => $request->input('end_at'),
            'status' => $request->input('status', 'ACTIVE'),
        ]);

        $campaign->save();

        return response()->json([
            'success' => true,
            'message' => 'Free Gift campaign rules updated successfully.',
            'data' => $campaign,
        ], 200);
    }

    /**
     * List all Configured Free Gift Products
     */
    public function indexItems(): JsonResponse
    {
        $items = FreeGiftItem::with(['product.images', 'variant'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $items,
        ], 200);
    }

    /**
     * Add an existing product as a Free Gift
     */
    public function storeItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'gift_stock' => 'required|integer|min:0',
            'gift_title' => 'nullable|string|max:255',
            'display_image_url' => 'nullable|string|max:500',
        ]);

        $productId = (int) $request->input('product_id');

        $existing = FreeGiftItem::where('product_id', $productId)->first();
        if ($existing) {
            $existing->update([
                'gift_stock' => (int) $request->input('gift_stock'),
                'gift_title' => $request->input('gift_title'),
                'display_image_url' => $request->input('display_image_url'),
                'status' => 'ACTIVE',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Free gift item updated successfully.',
                'data' => $existing->load('product'),
            ], 200);
        }

        $campaign = FreeGiftCampaign::where('status', 'ACTIVE')->first();
        $product = Product::with('images')->find($productId);

        $imgUrl = $request->input('display_image_url');
        if (!$imgUrl && $product) {
            $primaryImg = $product->images ? $product->images->firstWhere('is_primary', true) : null;
            $firstImg = $product->images ? $product->images->first() : null;
            $imgUrl = $primaryImg ? $primaryImg->image_url : ($firstImg ? $firstImg->image_url : null);
        }

        $item = FreeGiftItem::create([
            'campaign_id' => $campaign ? $campaign->id : null,
            'product_id' => $productId,
            'gift_title' => $request->input('gift_title') ?: ($product ? $product->name : 'Free Gift'),
            'display_image_url' => $imgUrl,
            'gift_stock' => (int) $request->input('gift_stock', 50),
            'claimed_count' => 0,
            'status' => 'ACTIVE',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product marked as Free Gift successfully.',
            'data' => $item->load('product'),
        ], 201);
    }

    /**
     * Update Free Gift Item (stock, title, image, status)
     */
    public function updateItem(Request $request, $id): JsonResponse
    {
        $item = FreeGiftItem::find($id);

        if (!$item) {
            return response()->json(['success' => false, 'message' => 'Free gift item not found.'], 404);
        }

        $item->update([
            'gift_title' => $request->input('gift_title', $item->gift_title),
            'gift_stock' => $request->has('gift_stock') ? (int)$request->input('gift_stock') : $item->gift_stock,
            'display_image_url' => $request->input('display_image_url', $item->display_image_url),
            'status' => $request->input('status', $item->status),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Free gift item updated.',
            'data' => $item->load('product'),
        ], 200);
    }

    /**
     * Remove product from Free Gifts
     */
    public function destroyItem($id): JsonResponse
    {
        $item = FreeGiftItem::find($id);
        if ($item) {
            $item->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Free gift item removed.',
        ], 200);
    }
}
