<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AbandonedCart;
use App\Models\Cart;
use App\Models\CartItem;
use App\Jobs\SendEmailNotificationJob;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AbandonedCartController extends Controller
{
    /**
     * POST /api/v1/abandoned-cart/track
     * Tracks customer email for abandoned cart recovery.
     */
    public function track(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $email = strtolower(trim($request->input('email')));
        $phone = $request->input('phone');
        $guestSessionId = $request->header('X-Guest-Session-ID');
        $user = $request->user();

        $cart = null;
        if ($user) {
            $cart = Cart::where('customer_id', $user->id)->where('status', 'ACTIVE')->first();
        } elseif ($guestSessionId) {
            $cart = Cart::where('guest_session_id', $guestSessionId)->where('status', 'ACTIVE')->first();
        }

        if (!$cart) {
            return response()->json(['success' => false, 'message' => 'Active cart not found.'], 404);
        }

        $items = CartItem::with('variant.product')->where('cart_id', $cart->id)->get();
        if ($items->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Cart is empty.'], 400);
        }

        $subtotal = 0.00;
        $cartData = [];
        foreach ($items as $item) {
            $price = (float)($item->variant->price ?? 0);
            $subtotal += ($price * $item->quantity);
            $cartData[] = [
                'variant_id' => $item->variant_id,
                'product_name' => $item->variant->product->name ?? 'Jewellery Item',
                'quantity' => $item->quantity,
                'price' => $price,
            ];
        }

        $record = AbandonedCart::updateOrCreate(
            ['email' => $email, 'reminder_status' => 'PENDING'],
            [
                'cart_id' => $cart->id,
                'guest_session_id' => $guestSessionId,
                'user_id' => $user ? $user->id : null,
                'phone' => $phone,
                'cart_data' => $cartData,
                'subtotal' => round($subtotal, 2),
                'recovery_token' => Str::random(32),
                'updated_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Cart tracked for recovery.',
            'data' => $record,
        ], 200);
    }

    /**
     * GET /api/v1/abandoned-cart/recover/{token}
     * Recovers an abandoned cart using a secure token.
     */
    public function recover(string $token): JsonResponse
    {
        $abandoned = AbandonedCart::where('recovery_token', $token)->first();

        if (!$abandoned) {
            return response()->json(['success' => false, 'message' => 'Invalid or expired cart recovery link.'], 404);
        }

        $abandoned->update(['reminder_status' => 'CONVERTED']);

        return response()->json([
            'success' => true,
            'message' => 'Cart recovered successfully.',
            'data' => [
                'cart_id' => $abandoned->cart_id,
                'items' => $abandoned->cart_data,
                'email' => $abandoned->email,
            ],
        ], 200);
    }

    /**
     * GET /api/v1/admin/abandoned-carts
     * Lists abandoned carts for admin dashboard reporting.
     */
    public function adminIndex(): JsonResponse
    {
        $carts = AbandonedCart::orderBy('id', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $carts,
        ], 200);
    }

    /**
     * POST /api/v1/admin/abandoned-carts/{id}/send-reminder
     * Triggers manual or automated abandoned cart recovery email.
     */
    public function sendReminder(int $id): JsonResponse
    {
        $record = AbandonedCart::find($id);

        if (!$record) {
            return response()->json(['success' => false, 'message' => 'Abandoned cart record not found.'], 404);
        }

        $recoveryUrl = env('FRONTEND_URL', 'http://localhost:3000') . '/cart?recovery_token=' . $record->recovery_token;

        try {
            SendEmailNotificationJob::dispatch(
                'abandoned_cart_reminder',
                $record->email,
                'Valued Customer',
                [
                    'customer_name' => 'Valued Customer',
                    'subtotal' => $record->subtotal,
                    'recovery_url' => $recoveryUrl,
                    'cart_items' => $record->cart_data,
                ]
            );

            $record->update([
                'reminder_status' => 'SENT',
                'reminder_sent_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => "Abandoned cart reminder email sent to {$record->email}.",
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reminder email: ' . $e->getMessage(),
            ], 500);
        }
    }
}
