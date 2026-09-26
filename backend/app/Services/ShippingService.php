<?php

namespace App\Services;

use App\Models\ShippingMethod;
use Illuminate\Support\Facades\DB;

class ShippingService
{
    /**
     * Validate Indian PIN code format (6 digits, does not start with 0).
     */
    public function checkServiceability(string $postalCode): array
    {
        $cleanCode = trim($postalCode);
        $isIndianPinFormat = preg_match('/^[1-9][0-9]{5}$/', $cleanCode);

        if (!$isIndianPinFormat) {
            return [
                'serviceable' => false,
                'postal_code' => $cleanCode,
                'message' => 'Invalid PIN code format. Indian PIN codes must be 6 digits.',
            ];
        }

        return [
            'serviceable' => true,
            'postal_code' => $cleanCode,
            'estimated_days' => '3–5 business days',
            'message' => 'Deliverable to ' . $cleanCode,
        ];
    }

    /**
     * Get all active shipping methods.
     */
    public function getAvailableMethods(): array
    {
        return ShippingMethod::where('status', 'ACTIVE')
            ->orderBy('price', 'asc')
            ->get()
            ->toArray();
    }

    /**
     * Get configured free shipping threshold from settings.
     */
    public function getFreeShippingThreshold(): float
    {
        $val = DB::table('settings')->where('key_name', 'free_shipping_threshold')->value('value_content');
        return $val ? (float) $val : 999.00;
    }

    /**
     * Calculate shipping cost dynamically based on payment method:
     * - COD (Cash on Delivery): ₹100 shipping fee
     * - Prepaid (UPI / Card / Netbanking): ₹50 shipping fee
     */
    public function calculateShipping(?int $methodId, float $subtotal, string $paymentMethod = 'COD'): array
    {
        $payMethod = strtoupper($paymentMethod);
        $isCOD = ($payMethod === 'COD' || $payMethod === 'CASH_ON_DELIVERY');

        // Payment-method dependent shipping fees: COD ₹100, Prepaid (UPI/Card) ₹50
        $codFee = (float) (DB::table('settings')->where('key_name', 'shipping_cod_fee')->value('value_content') ?? 100.00);
        $prepaidFee = (float) (DB::table('settings')->where('key_name', 'shipping_prepaid_fee')->value('value_content') ?? 50.00);

        // Check if explicit active shipping rule exists in DB
        $matchingRule = DB::table('shipping_rules')
            ->where('status', 'ACTIVE')
            ->where('min_order_amount', '<=', $subtotal)
            ->where(function ($q) use ($subtotal) {
                $q->whereNull('max_order_amount')
                  ->orWhere('max_order_amount', '>=', $subtotal);
            })
            ->orderBy('min_order_amount', 'desc')
            ->first();

        if ($matchingRule) {
            $shippingPrice = (float) $matchingRule->shipping_fee;
            $name = $matchingRule->name;
            $days = $matchingRule->estimated_days;
            $isFreeShipping = ($shippingPrice === 0.0);
        } else {
            $shippingPrice = $isCOD ? $codFee : $prepaidFee;
            $name = $isCOD ? 'COD Shipping Fee' : 'Prepaid Shipping (UPI / Card)';
            $days = '3–5 business days';
            $isFreeShipping = ($shippingPrice === 0.0);
        }

        return [
            'method_id' => $matchingRule ? $matchingRule->id : $methodId,
            'method_name' => $name,
            'estimated_days' => $days,
            'amount' => $shippingPrice,
            'is_free_shipping' => $isFreeShipping,
            'payment_method' => $isCOD ? 'COD' : 'PREPAID',
            'cod_fee' => $codFee,
            'prepaid_fee' => $prepaidFee,
            'free_shipping_threshold' => 0,
            'amount_needed_for_free_shipping' => 0,
        ];
    }
}
