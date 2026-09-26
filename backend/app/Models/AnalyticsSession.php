<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalyticsSession extends Model
{
    use HasFactory;

    protected $table = 'analytics_sessions';

    protected $fillable = [
        'session_id',
        'visitor_id',
        'user_id',
        'landing_page',
        'exit_page',
        'referrer_url',
        'traffic_source',
        'traffic_medium',
        'campaign',
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'device_type',
        'browser',
        'os',
        'screen_size',
        'country',
        'city',
        'ip_address',
        'total_page_views',
        'total_active_seconds',
        'has_add_to_cart',
        'has_checkout',
        'has_purchased',
        'last_active_at',
    ];

    protected $casts = [
        'total_page_views' => 'integer',
        'total_active_seconds' => 'integer',
        'has_add_to_cart' => 'boolean',
        'has_checkout' => 'boolean',
        'has_purchased' => 'boolean',
        'last_active_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function pageViews(): HasMany
    {
        return $this->hasMany(AnalyticsPageView::class, 'session_id', 'session_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AnalyticsEvent::class, 'session_id', 'session_id');
    }
}
