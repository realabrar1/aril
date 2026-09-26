<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsDailyStat extends Model
{
    use HasFactory;

    protected $table = 'analytics_daily_stats';

    protected $fillable = [
        'stat_date',
        'page_type',
        'page_url',
        'product_id',
        'collection_id',
        'page_views',
        'unique_visitors',
        'total_sessions',
        'avg_active_seconds',
        'avg_scroll_percentage',
        'add_to_cart_count',
        'purchases_count',
        'total_revenue',
    ];

    protected $casts = [
        'stat_date' => 'date',
        'page_views' => 'integer',
        'unique_visitors' => 'integer',
        'total_sessions' => 'integer',
        'avg_active_seconds' => 'integer',
        'avg_scroll_percentage' => 'integer',
        'add_to_cart_count' => 'integer',
        'purchases_count' => 'integer',
        'total_revenue' => 'float',
    ];
}
