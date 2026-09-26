<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogFaq extends Model
{
    use HasFactory;

    protected $table = 'blog_faqs';

    protected $fillable = [
        'blog_post_id',
        'question',
        'answer',
        'sort_order',
    ];

    public function post()
    {
        return $this->belongsTo(BlogPost::class, 'blog_post_id');
    }
}
