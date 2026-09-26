<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    use HasFactory;

    protected $table = 'blog_posts';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'featured_image',
        'featured_image_alt',
        'featured_image_caption',
        'author_id',
        'category_id',
        'status',
        'is_featured',
        'published_at',
        'reading_time',
        'seo_title',
        'meta_description',
        'focus_keyword',
        'secondary_keywords',
        'canonical_url',
        'robots_index',
        'robots_follow',
        'og_title',
        'og_description',
        'og_image',
        'twitter_title',
        'twitter_description',
        'twitter_image',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'robots_index' => 'boolean',
        'robots_follow' => 'boolean',
        'published_at' => 'datetime',
        'reading_time' => 'integer',
        'secondary_keywords' => 'array',
    ];

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function category()
    {
        return $this->belongsTo(BlogCategory::class, 'category_id');
    }

    public function tags()
    {
        return $this->belongsToMany(BlogTag::class, 'blog_post_tags', 'blog_post_id', 'tag_id');
    }

    public function faqs()
    {
        return $this->hasMany(BlogFaq::class, 'blog_post_id')->orderBy('sort_order');
    }

    public function relatedProducts()
    {
        return $this->belongsToMany(Product::class, 'blog_post_related_products', 'blog_post_id', 'product_id')->withPivot('sort_order');
    }

    public function relatedPosts()
    {
        return $this->belongsToMany(BlogPost::class, 'blog_post_related_posts', 'blog_post_id', 'related_post_id')->withPivot('sort_order');
    }
}
