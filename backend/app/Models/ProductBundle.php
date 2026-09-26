<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductBundle extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image_url',
        'original_total_price',
        'bundle_price',
        'savings_amount',
        'start_at',
        'end_at',
        'priority',
        'status',
    ];

    protected $casts = [
        'original_total_price' => 'decimal:2',
        'bundle_price' => 'decimal:2',
        'savings_amount' => 'decimal:2',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'priority' => 'integer',
    ];

    public function items()
    {
        return $this->hasMany(ProductBundleItem::class, 'bundle_id');
    }
}
