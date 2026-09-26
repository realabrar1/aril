<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnalyticsPageView extends Model
{
    use HasFactory;

    protected $table = 'analytics_page_views';
    public $timestamps = false; // Uses created_at timestamp

    protected $fillable = [
        'session_id',
        'visitor_id',
        'user_id',
        'page_url',
        'route_name',
        'page_title',
        'page_type',
        'product_id',
        'collection_id',
        'category_id',
        'referrer_url',
        'active_time_seconds',
        'max_scroll_percentage',
        'is_entry_page',
        'is_exit_page',
        'created_at',
    ];

    protected $casts = [
        'active_time_seconds' => 'integer',
        'max_scroll_percentage' => 'integer',
        'is_entry_page' => 'boolean',
        'is_exit_page' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
