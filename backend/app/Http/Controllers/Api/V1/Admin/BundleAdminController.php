<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductBundle;
use App\Models\ProductBundleItem;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BundleAdminController extends Controller
{
    /**
     * GET /api/v1/admin/bundles
     */
    public function index(): JsonResponse
    {
        $bundles = ProductBundle::with(['items.product', 'items.variant'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bundles,
        ], 200);
    }

    /**
     * POST /api/v1/admin/bundles
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'bundle_price' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.variant_id' => 'nullable|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'status' => 'required|in:ACTIVE,INACTIVE',
            'start_at' => 'nullable|date',
            'end_at' => 'nullable|date',
        ]);

        $slug = Str::slug($request->input('name')) . '-' . Str::random(5);
        $bundlePrice = (float) $request->input('bundle_price');

        $originalTotal = 0.00;
        $itemsPayload = $request->input('items', []);

        // Calculate original total from actual DB product variant prices
        foreach ($itemsPayload as $itemData) {
            $variantId = $itemData['variant_id'] ?? null;
            if ($variantId) {
                $var = ProductVariant::find($variantId);
                $price = $var ? (float)$var->price : 0;
            } else {
                $prod = Product::with('variants')->find($itemData['product_id']);
                $var = $prod ? $prod->variants->first() : null;
                $price = $var ? (float)$var->price : ($prod ? (float)$prod->base_price : 0);
            }
            $originalTotal += ($price * (int)$itemData['quantity']);
        }

        $savings = max(0.00, $originalTotal - $bundlePrice);

        $bundle = ProductBundle::create([
            'name' => $request->input('name'),
            'slug' => $slug,
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'original_total_price' => round($originalTotal, 2),
            'bundle_price' => round($bundlePrice, 2),
            'savings_amount' => round($savings, 2),
            'start_at' => $request->input('start_at'),
            'end_at' => $request->input('end_at'),
            'status' => $request->input('status', 'ACTIVE'),
            'priority' => (int) $request->input('priority', 0),
        ]);

        foreach ($itemsPayload as $itemData) {
            ProductBundleItem::create([
                'bundle_id' => $bundle->id,
                'product_id' => $itemData['product_id'],
                'variant_id' => $itemData['variant_id'] ?? null,
                'quantity' => (int) $itemData['quantity'],
                'unit_price' => 0.00,
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Product bundle created successfully.',
            'data' => $bundle->load(['items.product', 'items.variant']),
        ], 201);
    }

    /**
     * PUT /api/v1/admin/bundles/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $bundle = ProductBundle::find($id);

        if (!$bundle) {
            return response()->json(['success' => false, 'message' => 'Product bundle not found.'], 404);
        }

        $data = $request->only(['name', 'description', 'image_url', 'bundle_price', 'status', 'start_at', 'end_at', 'priority']);
        if ($request->has('bundle_price')) {
            $data['bundle_price'] = (float) $request->input('bundle_price');
            $data['savings_amount'] = max(0.00, $bundle->original_total_price - $data['bundle_price']);
        }

        $bundle->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Product bundle updated successfully.',
            'data' => $bundle->load(['items.product', 'items.variant']),
        ], 200);
    }

    /**
     * DELETE /api/v1/admin/bundles/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $bundle = ProductBundle::find($id);
        if ($bundle) {
            $bundle->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Product bundle deleted.',
        ], 200);
    }
}
