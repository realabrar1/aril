<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\CustomerAddress;
use App\Models\FreeGiftItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CartCheckoutService
{
    protected InventoryService $inventoryService;
    protected DiscountService $discountService;
    protected ShippingService $shippingService;
    protected TaxService $taxService;
    protected CouponService $couponService;
    protected FreeGiftService $freeGiftService;

    public function __construct(
        InventoryService $inventoryService,
        DiscountService $discountService,
        ShippingService $shippingService,
        TaxService $taxService,
        CouponService $couponService,
        FreeGiftService $freeGiftService
    ) {
        $this->inventoryService = $inventoryService;
        $this->discountService = $discountService;
        $this->shippingService = $shippingService;
        $this->taxService = $taxService;
        $this->couponService = $couponService;
        $this->freeGiftService = $freeGiftService;
    }

    /**
     * Process Cart Checkout and Create Order atomically (Supports Guest & Logged-in Customers).
     */
    public function checkout(?User $user, array $checkoutData, ?string $guestSessionId = null): Order
    {
        return DB::transaction(function () use ($user, $checkoutData, $guestSessionId) {
            $shippingAddress = $checkoutData['shipping_address'] ?? [];

            $name = trim($shippingAddress['name'] ?? ($user ? $user->name : 'Guest Customer'));
            $phone = trim($shippingAddress['phone'] ?? ($user ? $user->phone : ''));
            $email = strtolower(trim($shippingAddress['email'] ?? ($user ? $user->email : '')));

            // 1. Automatic Customer Profile linking or creation for Guest Checkout
            if (!$user) {
                if (!empty($email) || !empty($phone)) {
                    $query = User::query();
                    if (!empty($email)) {
                        $query->where('email', $email);
                    }
                    if (!empty($phone)) {
                        $query->orWhere('phone', $phone);
                    }
                    $user = $query->first();
                }

                if (!$user) {
                    $dummyEmail = !empty($email) ? $email : ('guest_' . Str::random(8) . '@arilha.com');
                    $user = User::create([
                        'name' => $name,
                        'email' => $dummyEmail,
                        'phone' => $phone ?: null,
                        'password' => Hash::make(Str::random(16)),
                        'user_type' => 'CUSTOMER',
                        'status' => 'ACTIVE',
                    ]);
                } else {
                    // Update user name/phone if missing
                    if (empty($user->phone) && !empty($phone)) {
                        $user->phone = $phone;
                    }
                    if (empty($user->name) && !empty($name)) {
                        $user->name = $name;
                    }
                    $user->save();
                }
            }

            // Save address snapshot to customer's address book if not present
            if (!empty($shippingAddress['address']) && !empty($shippingAddress['city'])) {
                try {
                    CustomerAddress::updateOrCreate(
                        [
                            'customer_id' => $user->id,
                            'address_line_1' => $shippingAddress['address'],
                            'postal_code' => $shippingAddress['pincode'] ?? '560001',
                        ],
                        [
                            'name' => $name,
                            'phone' => $phone,
                            'address_line_2' => $shippingAddress['address_line_2'] ?? '',
                            'city' => $shippingAddress['city'],
                            'state' => $shippingAddress['state'] ?? 'Karnataka',
                            'country' => $shippingAddress['country'] ?? 'India',
                            'is_default' => true,
                        ]
                    );
                } catch (\Throwable $ex) {
                    // Ignore address duplication collision
                }
            }

            $itemsData = $checkoutData['items'] ?? [];

            // If items not directly provided in payload, load from active cart
            if (empty($itemsData)) {
                $cartQuery = Cart::where('status', 'ACTIVE');
                if ($user) {
                    $cartQuery->where(function ($q) use ($user, $guestSessionId) {
                        $q->where('customer_id', $user->id);
                        if ($guestSessionId) {
                            $q->orWhere('guest_session_id', $guestSessionId);
                        }
                    });
                } elseif ($guestSessionId) {
                    $cartQuery->where('guest_session_id', $guestSessionId);
                }

                $cart = $cartQuery->first();

                if ($cart) {
                    $cartItems = CartItem::where('cart_id', $cart->id)->get();
                    foreach ($cartItems as $cItem) {
                        $itemsData[] = [
                            'variant_id' => $cItem->variant_id,
                            'quantity' => $cItem->quantity,
                        ];
                    }
                }
            }

            if (empty($itemsData)) {
                throw new HttpException(400, 'Cart is empty. Cannot process checkout.');
            }

            // Generate unique human-friendly order number: ORD-YYYYMMDD-XXXXXX
            $datePrefix = now()->format('Ymd');
            $randomSuffix = str_pad((string)rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $orderNumber = "ORD-{$datePrefix}-{$randomSuffix}";

            $subtotal = 0.00;
            $orderItemsToCreate = [];

            // Lock variant inventory rows and calculate authoritative prices server-side
            foreach ($itemsData as $item) {
                $variantId = $item['variant_id'];
                $qty = (int)$item['quantity'];

                if ($qty <= 0) {
                    continue;
                }

                $variant = ProductVariant::with('product')
                    ->where('id', $variantId)
                    ->lockForUpdate()
                    ->first();

                if (!$variant || !$variant->product || $variant->status !== 'ACTIVE' || $variant->product->status !== 'ACTIVE') {
                    CartItem::where('variant_id', $variantId)->delete();
                    continue;
                }

                $inventory = $variant->inventory;
                if (!$inventory || $inventory->available_quantity < $qty) {
                    $available = $inventory ? $inventory->available_quantity : 0;
                    throw new HttpException(
                        400,
                        "Insufficient stock for {$variant->product->name} ({$variant->size}/{$variant->color}). Available: {$available}, Requested: {$qty}"
                    );
                }

                $unitPrice = (float)$variant->price;
                $lineTotal = round($unitPrice * $qty, 2);
                $subtotal += $lineTotal;

                $orderItemsToCreate[] = [
                    'product_id' => $variant->product_id,
                    'variant_id' => $variant->id,
                    'product_name_snapshot' => $variant->product->name,
                    'sku_snapshot' => $variant->sku,
                    'size_snapshot' => $variant->size,
                    'color_snapshot' => $variant->color,
                    'quantity' => $qty,
                    'unit_price' => $unitPrice,
                    'discount_amount' => 0.00,
                    'is_free_gift' => false,
                    'total_amount' => $lineTotal,
                ];
            }

            if (empty($orderItemsToCreate)) {
                throw new HttpException(400, 'The items in your cart are no longer available.');
            }

            // Authoritative server-side calculations
            $couponCode = isset($checkoutData['coupon_code']) ? trim($checkoutData['coupon_code']) : null;
            $discountCalc = $this->discountService->calculateDiscounts($subtotal, $orderItemsToCreate, $couponCode, $user);

            $discountAmount = $discountCalc['total_discount'];
            $netSubtotal = max(0.00, $subtotal - $discountAmount);

            $payMethod = strtoupper($checkoutData['payment_method'] ?? 'COD');

            $shippingMethodId = $checkoutData['shipping_method_id'] ?? null;
            $shippingCalc = $this->shippingService->calculateShipping($shippingMethodId, $netSubtotal, $payMethod);
            $shippingAmount = $shippingCalc['amount'];

            $taxCalc = $this->taxService->calculateTax($netSubtotal);
            $taxAmount = $taxCalc['tax_amount'];
            $taxAdded = !empty($taxCalc['is_inclusive']) ? 0.00 : $taxAmount;

            $totalAmount = round($netSubtotal + $shippingAmount + $taxAdded, 2);

            // Free Gift Validation & Inclusion
            $selectedGiftId = isset($checkoutData['free_gift_product_id']) ? (int) $checkoutData['free_gift_product_id'] : null;
            $freeGiftItemData = null;

            if ($selectedGiftId) {
                $giftValidation = $this->freeGiftService->validateSelectedGift($selectedGiftId, $netSubtotal, $payMethod);
                if (!$giftValidation['valid']) {
                    throw new HttpException(422, $giftValidation['message'] ?? 'Selected free gift is not eligible.');
                }
                $freeGiftItemData = $giftValidation['gift'];
            }

            $billingAddress = $checkoutData['billing_address'] ?? $shippingAddress;

            // Create Order
            $order = Order::create([
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'subtotal' => round($subtotal, 2),
                'discount_amount' => round($discountAmount, 2),
                'shipping_amount' => round($shippingAmount, 2),
                'tax_amount' => round($taxAmount, 2),
                'total_amount' => round($totalAmount, 2),
                'currency' => 'INR',
                'payment_status' => 'PENDING',
                'order_status' => 'PENDING',
                'shipping_address_snapshot' => $shippingAddress,
                'billing_address_snapshot' => $billingAddress,
            ]);

            // Create Order Items & Reserve Inventory
            foreach ($orderItemsToCreate as $itemData) {
                $itemData['order_id'] = $order->id;
                OrderItem::create($itemData);
                $this->inventoryService->reserveStock($itemData['variant_id'], $itemData['quantity'], $orderNumber);
            }

            // Create Free Gift Order Item if selected & eligible
            if ($freeGiftItemData) {
                // Lock free gift variant stock
                $giftVariant = ProductVariant::where('id', $freeGiftItemData['variant_id'])
                    ->lockForUpdate()
                    ->first();

                if ($giftVariant && $giftVariant->stock > 0) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'product_id' => $freeGiftItemData['product_id'],
                        'variant_id' => $freeGiftItemData['variant_id'],
                        'product_name_snapshot' => $freeGiftItemData['product_name'] . ' (FREE GIFT)',
                        'sku_snapshot' => $freeGiftItemData['sku'],
                        'size_snapshot' => $freeGiftItemData['size'],
                        'color_snapshot' => $freeGiftItemData['color'],
                        'quantity' => 1,
                        'unit_price' => 0.00,
                        'discount_amount' => 0.00,
                        'is_free_gift' => true,
                        'total_amount' => 0.00,
                    ]);

                    $this->inventoryService->reserveStock($freeGiftItemData['variant_id'], 1, $orderNumber);

                    // Increment claimed count on FreeGiftItem if present
                    if (!empty($freeGiftItemData['gift_item_id'])) {
                        FreeGiftItem::where('id', $freeGiftItemData['gift_item_id'])->increment('claimed_count');
                    }
                }
            }

            // Record Payment details
            \App\Models\Payment::create([
                'order_id' => $order->id,
                'user_id' => $user->id,
                'payment_method' => $payMethod,
                'provider' => $payMethod,
                'amount' => $totalAmount,
                'currency' => 'INR',
                'status' => $payMethod === 'COD' ? 'PENDING' : 'INITIATED',
            ]);

            // Record Coupon Usage if coupon applied
            if (!empty($discountCalc['applied_coupon'])) {
                $this->couponService->recordUsage($discountCalc['applied_coupon']['id'], $user->id, $order->id);
            }

            // Mark customer cart as CONVERTED
            $cart = Cart::where('customer_id', $user->id)->where('status', 'ACTIVE')->first();
            if (!$cart && $guestSessionId) {
                $cart = Cart::where('guest_session_id', $guestSessionId)->where('status', 'ACTIVE')->first();
            }
            if ($cart) {
                $cart->update(['status' => 'CONVERTED']);
            }

            // Initial Order Status History
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'previous_status' => null,
                'new_status' => 'PENDING',
                'comment' => 'Order created via checkout.',
                'changed_by' => $user->id,
                'created_at' => now(),
            ]);

            // Queue Customer & Admin Order Confirmation Emails
            try {
                $freshOrder = $order->fresh(['items']);
                $orderData = $freshOrder ? $freshOrder->toArray() : $order->toArray();
                $custEmail = $shippingAddress['email'] ?? $user->email ?? '';
                $custName = $shippingAddress['name'] ?? $user->name ?? 'Valued Customer';

                if (!empty($custEmail)) {
                    \App\Jobs\SendEmailNotificationJob::dispatch(
                        'order_confirmation',
                        $custEmail,
                        $custName,
                        ['order' => $orderData, 'customer_name' => $custName]
                    );
                }

                $adminEmail = env('ADMIN_NOTIFICATION_EMAIL', env('MAIL_FROM_ADDRESS', 'support@arilha.com'));
                \App\Jobs\SendEmailNotificationJob::dispatch(
                    'admin_new_order',
                    $adminEmail,
                    'Admin Concierge',
                    ['order' => $orderData]
                );
            } catch (\Throwable $ex) {
                \Illuminate\Support\Facades\Log::warning('CartCheckoutService: Email dispatch failed: ' . $ex->getMessage());
            }

            return $order->load(['items', 'latestPayment', 'statusHistory']);
        });
    }
}
