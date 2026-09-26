<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    use HasFactory;

    protected $table = 'reviews';

    protected $fillable = [
        'product_id',
        'user_id',
        'order_id',
        'order_item_id',
        'reviewer_name',
        'rating',
        'title',
        'comment',
        'is_verified_purchase',
        'status',
    ];

    protected $casts = [
        'rating' => 'integer',
        'is_verified_purchase' => 'boolean',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReviewImage::class);
    }

    /**
     * Recalculate average rating and review count for a product.
     */
    public static function recalculateProductRating(int $productId): void
    {
        $stats = self::where('product_id', $productId)
            ->where('status', 'APPROVED')
            ->selectRaw('COUNT(*) as total_reviews, AVG(rating) as avg_rating')
            ->first();

        $totalReviews = (int) ($stats->total_reviews ?? 0);
        $avgRating = round((float) ($stats->avg_rating ?? 0), 2);

        Product::where('id', $productId)->update([
            'rating' => $avgRating,
            'review_count' => $totalReviews,
            'updated_at' => now(),
        ]);
    }
}
