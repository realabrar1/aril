<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Collection extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image_url',
        'banner_url',
        'seo_title',
        'seo_description',
        'status',
        'sort_order',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'collection_product')
                    ->withPivot('sort_order')
                    ->withTimestamps()
                    ->orderBy('collection_product.sort_order', 'asc');
    }
}
