<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\CartCheckoutService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerOrderController extends Controller
{
    protected CartCheckoutService $cartCheckoutService;

    public function __construct(CartCheckoutService $cartCheckoutService)
    {
        $this->cartCheckoutService = $cartCheckoutService;
    }

    /**
     * POST /api/v1/customer/orders/checkout
     */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.name' => ['required', 'string'],
            'shipping_address.address' => ['required', 'string'],
            'shipping_address.city' => ['required', 'string'],
            'shipping_address.state' => ['required', 'string'],
            'shipping_address.pincode' => ['required', 'string'],
            'shipping_address.phone' => ['required', 'string'],
        ]);

        $order = $this->cartCheckoutService->checkout(
            $request->user(),
            $request->all()
        );

        return response()->json([
            'success' => true,
            'message' => 'Order created and stock reserved successfully.',
            'data' => $order,
        ], 201);
    }

    /**
     * GET /api/v1/customer/orders
     * Validates customer email ID and returns orders matching user_id or email address.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $userEmail = strtolower(trim($user->email ?? ''));

        $orders = Order::where(function ($query) use ($user, $userEmail) {
                $query->where('user_id', $user->id);
                if (!empty($userEmail)) {
                    $query->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(shipping_address_snapshot, "$.email"))) = ?', [$userEmail]);
                }
            })
            ->with(['items.product.images', 'latestPayment', 'statusHistory'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'message' => 'Customer orders retrieved successfully.',
            'data' => $orders->items(),
            'meta' => [
                'pagination' => [
                    'total' => $orders->total(),
                    'per_page' => $orders->perPage(),
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                ]
            ]
        ], 200);
    }

    /**
     * GET /api/v1/customer/orders/{id}
     * Authenticated endpoint to view a specific customer order.
     * Enforces strict BOLA / IDOR protection.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $order = Order::where(function ($query) use ($id) {
                $query->where('id', $id)
                    ->orWhere('order_number', $id);
            })
            ->with(['items.product.images', 'latestPayment', 'statusHistory'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        // BOLA / IDOR Protection
        $userEmail = strtolower(trim($user->email ?? ''));
        $shippingEmail = strtolower(trim($order->shipping_address_snapshot['email'] ?? ''));
        $isOwner = ($order->user_id === $user->id) || (!empty($userEmail) && $shippingEmail === $userEmail);

        if (!$isOwner) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to order details.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order details retrieved successfully.',
            'data' => $order,
        ], 200);
    }

    /**
     * GET /api/v1/orders/lookup/{orderNumber}
     * Fetches single order details and auto-links to customer account if email matches.
     */
    public function showByNumber(Request $request, string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)
            ->orWhere('id', $orderNumber)
            ->with(['items.product.images', 'latestPayment', 'statusHistory', 'user'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found.',
            ], 404);
        }

        $shippingEmail = strtolower(trim($order->shipping_address_snapshot['email'] ?? ''));
        $authUser = $request->user();

        if ($authUser) {
            $authEmail = strtolower(trim($authUser->email ?? ''));
            if (empty($order->user_id) && !empty($shippingEmail) && ($shippingEmail === $authEmail)) {
                $order->user_id = $authUser->id;
                $order->save();
            }

            $isOwner = ($order->user_id === $authUser->id) || (!empty($authEmail) && $shippingEmail === $authEmail);
            if (!$isOwner) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to order details.',
                ], 403);
            }
        } else {
            $providedEmail = strtolower(trim($request->query('email', '')));
            if (!empty($providedEmail) && $providedEmail !== $shippingEmail) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to order details.',
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Order details retrieved successfully.',
            'data' => $order,
        ]);
    }
}
