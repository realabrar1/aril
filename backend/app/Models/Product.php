<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'category_id',
        'collection_id',
        'name',
        'slug',
        'sku',
        'description',
        'short_description',
        'brand',
        'gender',
        'status',
        'is_featured',
        'is_new',
        'is_best_seller',
        'seo_title',
        'seo_description',
        'shipping_type',
        'delivery_estimate',
        'return_policy_type',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function collections()
    {
        return $this->belongsToMany(Collection::class, 'collection_product')
                    ->withPivot('sort_order')
                    ->withTimestamps();
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class, 'product_id')->orderBy('sort_order', 'asc');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class, 'product_id');
    }

    public function approvedReviews()
    {
        return $this->hasMany(Review::class, 'product_id')->where('status', 'APPROVED');
    }
}
