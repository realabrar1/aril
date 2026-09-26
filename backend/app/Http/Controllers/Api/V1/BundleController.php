<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ProductBundle;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BundleController extends Controller
{
    protected CartService $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    /**
     * GET /api/v1/bundles
     * List all active product bundles for storefront.
     */
    public function index(): JsonResponse
    {
        $bundles = ProductBundle::with(['items.product.images', 'items.variant'])
            ->where('status', 'ACTIVE')
            ->where(function ($q) {
                $q->whereNull('start_at')->orWhere('start_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_at')->orWhere('end_at', '>=', now());
            })
            ->orderBy('priority', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $bundles,
        ], 200);
    }

    /**
     * GET /api/v1/bundles/{slug}
     * Get specific bundle details.
     */
    public function show(string $slug): JsonResponse
    {
        $bundle = ProductBundle::with(['items.product.images', 'items.variant'])
            ->where('slug', $slug)
            ->where('status', 'ACTIVE')
            ->first();

        if (!$bundle) {
            return response()->json(['success' => false, 'message' => 'Product bundle not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $bundle,
        ], 200);
    }

    /**
     * POST /api/v1/bundles/add-to-cart
     * Validates bundle stock, price, items server-side and adds all bundle items to cart.
     */
    public function addToCart(Request $request): JsonResponse
    {
        $request->validate([
            'bundle_id' => 'required|exists:product_bundles,id',
            'quantity' => 'nullable|integer|min:1',
        ]);

        $bundleId = (int) $request->input('bundle_id');
        $bundleQty = (int) $request->input('quantity', 1);

        $bundle = ProductBundle::with(['items.variant'])->find($bundleId);

        if (!$bundle || $bundle->status !== 'ACTIVE') {
            return response()->json([
                'success' => false,
                'message' => 'This product bundle is currently unavailable.',
            ], 422);
        }

        $user = $request->user();
        $guestSessionId = $request->header('X-Guest-Session-ID');
        $cart = $this->cartService->getOrCreateCart($user, $guestSessionId);

        $addedItems = [];
        $errors = [];

        foreach ($bundle->items as $bItem) {
            $variantId = $bItem->variant_id;
            if (!$variantId) {
                $prod = $bItem->product;
                $activeVariant = $prod ? $prod->variants()->where('status', 'ACTIVE')->first() : null;
                $variantId = $activeVariant ? $activeVariant->id : null;
            }

            if (!$variantId) {
                $errors[] = "Variant unavailable for item ID {$bItem->product_id}";
                continue;
            }

            $itemQty = $bItem->quantity * $bundleQty;
            $res = $this->cartService->addItem($cart, $variantId, $itemQty);

            if (!$res['success']) {
                $errors[] = $res['message'];
            } else {
                $addedItems[] = $variantId;
            }
        }

        if (!empty($errors) && empty($addedItems)) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add bundle to cart: ' . implode(', ', $errors),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "🎉 Bundle '{$bundle->name}' added to your cart successfully!",
            'data' => [
                'bundle' => $bundle,
                'cart_id' => $cart->id,
                'added_variants_count' => count($addedItems),
            ],
        ], 200);
    }
}
