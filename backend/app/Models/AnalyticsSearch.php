<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsSearch extends Model
{
    use HasFactory;

    protected $table = 'analytics_searches';
    public $timestamps = false;

    protected $fillable = [
        'session_id',
        'visitor_id',
        'search_query',
        'results_count',
        'clicked_product_id',
        'added_to_cart',
        'purchased',
        'created_at',
    ];

    protected $casts = [
        'results_count' => 'integer',
        'added_to_cart' => 'boolean',
        'purchased' => 'boolean',
        'created_at' => 'datetime',
    ];
}
