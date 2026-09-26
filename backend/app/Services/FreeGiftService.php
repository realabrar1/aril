<?php

namespace App\Services;

use App\Models\FreeGiftCampaign;
use App\Models\FreeGiftItem;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class FreeGiftService
{
    /**
     * Fetch or initialize default Free Gift Campaign.
     */
    public function getActiveCampaign(): ?FreeGiftCampaign
    {
        $campaign = FreeGiftCampaign::where('status', 'ACTIVE')->first();

        if (!$campaign) {
            // Seed default campaign as specified in prompt
            $campaign = FreeGiftCampaign::create([
                'name' => 'Free Gift Offer',
                'description' => 'Get a free gift on orders ₹899 or above',
                'min_order_amount' => 899.00,
                'online_payment_eligible' => true,
                'cod_eligible_above_threshold' => true,
                'max_gifts_per_order' => 1,
                'status' => 'ACTIVE',
            ]);
        }

        if ($campaign->start_at && now()->lt($campaign->start_at)) {
            return null;
        }

        if ($campaign->end_at && now()->gt($campaign->end_at)) {
            return null;
        }

        return $campaign;
    }

    /**
     * Evaluate Free Gift Eligibility based on merchandise subtotal.
     * Rules:
     * - Order Subtotal >= ₹899 = FREE GIFT (Eligible for COD & Prepaid)
     * - Order Subtotal < ₹899 = NO FREE GIFT (Ineligible)
     */
    public function evaluateEligibility(float $subtotal, string $paymentMethod): array
    {
        $campaign = $this->getActiveCampaign();

        if (!$campaign || $campaign->status !== 'ACTIVE') {
            return [
                'eligible' => false,
                'reason' => 'Free gift campaign is currently inactive.',
                'threshold' => 899.00,
            ];
        }

        $threshold = (float) $campaign->min_order_amount;

        if ($subtotal >= $threshold) {
            return [
                'eligible' => true,
                'reason' => '🎉 You\'ve unlocked a FREE gift!',
                'message' => 'Choose 1 free gift from the available options below.',
                'threshold' => $threshold,
            ];
        } else {
            $remaining = max(0, $threshold - $subtotal);
            return [
                'eligible' => false,
                'reason' => "You're ₹" . number_format($remaining, 0) . " away from unlocking your FREE gift!",
                'message' => "Add ₹" . number_format($remaining, 0) . " more to unlock your gift.",
                'threshold' => $threshold,
            ];
        }
    }

    /**
     * Fetch list of eligible free gift options.
     */
    public function getEligibleGiftOptions(): array
    {
        $items = FreeGiftItem::with(['product.images', 'variant'])
            ->where('status', 'ACTIVE')
            ->where('gift_stock', '>', 0)
            ->get();

        $options = [];

        foreach ($items as $item) {
            $product = $item->product;
            if (!$product || $product->status !== 'ACTIVE') {
                continue;
            }

            $img = $item->display_image_url;
            if (!$img) {
                $primaryImg = $product->images ? $product->images->firstWhere('is_primary', true) : null;
                $firstImg = $product->images ? $product->images->first() : null;
                $img = $primaryImg ? $primaryImg->image_url : ($firstImg ? $firstImg->image_url : '/images/placeholder.jpg');
            }

            $variantId = $item->variant_id;
            if (!$variantId) {
                $activeVariant = $product->variants ? $product->variants->firstWhere('status', 'ACTIVE') : null;
                $variantId = $activeVariant ? $activeVariant->id : null;
            }

            $options[] = [
                'gift_id' => $item->id,
                'product_id' => $product->id,
                'variant_id' => $variantId,
                'title' => $item->gift_title ?: $product->name,
                'description' => $item->description ?: $product->description,
                'image_url' => $img,
                'stock' => $item->gift_stock,
                'claimed_count' => $item->claimed_count,
                'reference_price' => (float) ($item->variant ? $item->variant->price : ($product->base_price ?? 299.00)),
            ];
        }

        // Auto-fallback if no specific free gift items have been added to DB yet
        if (empty($options)) {
            $fallbackProducts = Product::with(['images', 'variants'])
                ->where('status', 'ACTIVE')
                ->take(4)
                ->get();

            foreach ($fallbackProducts as $prod) {
                $firstVariant = $prod->variants->firstWhere('status', 'ACTIVE');
                if (!$firstVariant) continue;

                $primaryImg = $prod->images->firstWhere('is_primary', true);
                $firstImg = $prod->images->first();
                $imgUrl = $primaryImg ? $primaryImg->image_url : ($firstImg ? $firstImg->image_url : '/images/placeholder.jpg');

                $options[] = [
                    'gift_id' => 0,
                    'product_id' => $prod->id,
                    'variant_id' => $firstVariant->id,
                    'title' => 'Free Gift: ' . $prod->name,
                    'description' => 'Complimentary free gift for your order.',
                    'image_url' => $imgUrl,
                    'stock' => $firstVariant->stock > 0 ? $firstVariant->stock : 50,
                    'claimed_count' => 0,
                    'reference_price' => (float) $firstVariant->price,
                ];
            }
        }

        return $options;
    }

    /**
     * Validate selected free gift against business rules & stock.
     */
    public function validateSelectedGift(?int $giftProductId, float $subtotal, string $paymentMethod): array
    {
        if (!$giftProductId) {
            return ['valid' => true, 'gift' => null];
        }

        $eval = $this->evaluateEligibility($subtotal, $paymentMethod);
        if (!$eval['eligible']) {
            return [
                'valid' => false,
                'message' => $eval['reason'] ?: 'Selected order is not eligible for a free gift.',
            ];
        }

        // Find product
        $product = Product::with(['variants', 'images'])->find($giftProductId);
        if (!$product || $product->status !== 'ACTIVE') {
            return [
                'valid' => false,
                'message' => 'The selected free gift product is invalid or no longer available.',
            ];
        }

        // Check if explicit FreeGiftItem exists
        $giftItem = FreeGiftItem::where('product_id', $giftProductId)
            ->where('status', 'ACTIVE')
            ->first();

        if ($giftItem && $giftItem->gift_stock <= 0) {
            return [
                'valid' => false,
                'message' => 'Sorry, this free gift is out of stock.',
            ];
        }

        $firstVariant = $product->variants->firstWhere('status', 'ACTIVE');
        if (!$firstVariant || $firstVariant->stock <= 0) {
            return [
                'valid' => false,
                'message' => 'Selected free gift item is out of stock.',
            ];
        }

        $primaryImg = $product->images->firstWhere('is_primary', true);
        $firstImg = $product->images->first();
        $imgUrl = $giftItem && $giftItem->display_image_url 
            ? $giftItem->display_image_url 
            : ($primaryImg ? $primaryImg->image_url : ($firstImg ? $firstImg->image_url : '/images/placeholder.jpg'));

        return [
            'valid' => true,
            'gift' => [
                'gift_item_id' => $giftItem ? $giftItem->id : null,
                'product_id' => $product->id,
                'variant_id' => $firstVariant->id,
                'product_name' => ($giftItem && $giftItem->gift_title) ? $giftItem->gift_title : 'Free Gift - ' . $product->name,
                'sku' => $firstVariant->sku,
                'size' => $firstVariant->size ?: 'Free Size',
                'color' => $firstVariant->color ?: 'Standard',
                'image_url' => $imgUrl,
                'reference_price' => (float) $firstVariant->price,
            ],
        ];
    }
}
