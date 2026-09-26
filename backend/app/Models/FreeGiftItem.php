<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FreeGiftItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'campaign_id',
        'product_id',
        'variant_id',
        'gift_title',
        'description',
        'display_image_url',
        'gift_stock',
        'claimed_count',
        'status',
    ];

    protected $casts = [
        'gift_stock' => 'integer',
        'claimed_count' => 'integer',
    ];

    public function campaign()
    {
        return $this->belongsTo(FreeGiftCampaign::class, 'campaign_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}
