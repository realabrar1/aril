<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BlogRedirect extends Model
{
    use HasFactory;

    protected $table = 'blog_redirects';

    protected $fillable = [
        'old_slug',
        'new_slug',
    ];
}
