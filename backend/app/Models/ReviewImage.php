<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewImage extends Model
{
    use HasFactory;

    protected $table = 'review_images';

    public $timestamps = false;

    protected $fillable = [
        'review_id',
        'image_url',
        'created_at',
    ];

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }
}
