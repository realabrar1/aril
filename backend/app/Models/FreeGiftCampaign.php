<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FreeGiftCampaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'min_order_amount',
        'online_payment_eligible',
        'cod_eligible_above_threshold',
        'max_gifts_per_order',
        'start_at',
        'end_at',
        'status',
    ];

    protected $casts = [
        'min_order_amount' => 'float',
        'online_payment_eligible' => 'boolean',
        'cod_eligible_above_threshold' => 'boolean',
        'max_gifts_per_order' => 'integer',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
    ];

    public function giftItems()
    {
        return $this->hasMany(FreeGiftItem::class, 'campaign_id');
    }
}
