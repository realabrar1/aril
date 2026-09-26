<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\BlogRedirect;
use Illuminate\Http\Request;

class PublicBlogController extends Controller
{
    /**
     * Get published blog posts for public /blog page.
     */
    public function index(Request $request)
    {
        $query = BlogPost::with(['category', 'author:id,name', 'tags'])
            ->where('status', 'PUBLISHED')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });

        if ($request->filled('category')) {
            $categorySlug = $request->category;
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('focus_keyword', 'like', "%{$search}%");
            });
        }

        // Get featured post if requested or on first page
        $featuredPost = null;
        if (!$request->filled('page') || $request->page == 1) {
            $featuredPost = (clone $query)->where('is_featured', true)->orderBy('published_at', 'desc')->first();
        }

        $posts = $query->orderBy('published_at', 'desc')->paginate($request->get('per_page', 9));

        return response()->json([
            'success' => true,
            'data' => [
                'featured_post' => $featuredPost,
                'posts' => $posts->items(),
            ],
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    /**
     * Get categories list for blog filters.
     */
    public function categories()
    {
        $categories = BlogCategory::withCount(['posts' => function ($q) {
            $q->where('status', 'PUBLISHED');
        }])->orderBy('sort_order')->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Get single blog post by slug.
     */
    public function show($slug)
    {
        // 1. Check for 301 Redirect entry
        $redirect = BlogRedirect::where('old_slug', $slug)->first();
        if ($redirect) {
            return response()->json([
                'success' => true,
                'is_redirect' => true,
                'redirect_url' => "/blog/{$redirect->new_slug}",
                'new_slug' => $redirect->new_slug,
            ], 301);
        }

        $post = BlogPost::with([
            'category',
            'author:id,name',
            'tags',
            'faqs',
            'relatedProducts' => function ($q) {
                $q->with(['category', 'images'])->where('status', 'ACTIVE');
            },
            'relatedPosts' => function ($q) {
                $q->where('status', 'PUBLISHED')->with(['category']);
            }
        ])
        ->where('slug', $slug)
        ->where('status', 'PUBLISHED')
        ->first();

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => 'Blog article not found or not published.'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    /**
     * Generate RSS 2.0 Feed XML for /blog/feed.xml.
     */
    public function rssFeed()
    {
        $posts = BlogPost::with(['author:id,name', 'category'])
            ->where('status', 'PUBLISHED')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            })
            ->orderBy('published_at', 'desc')
            ->take(30)
            ->get();

        $siteUrl = 'https://arilha.com';

        $xml = new \SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"></rss>');
        $channel = $xml->addChild('channel');
        $channel->addChild('title', 'ARILHA Blog — Modern Indian Jewellery Insights & Styling Guides');
        $channel->addChild('link', "{$siteUrl}/blog");
        $channel->addChild('description', 'Discover styling tips, gold-plated jewellery care guides, Kundan jewellery heritage, and trend reports from ARILHA by Irsa Khan.');
        $channel->addChild('language', 'en-us');
        $channel->addChild('pubDate', now()->toRfc2822String());

        $atomLink = $channel->addChild('atom:link', '', 'http://www.w3.org/2005/Atom');
        $atomLink->addAttribute('href', "{$siteUrl}/blog/feed.xml");
        $atomLink->addAttribute('rel', 'self');
        $atomLink->addAttribute('type', 'application/rss+xml');

        foreach ($posts as $post) {
            $item = $channel->addChild('item');
            $item->addChild('title', htmlspecialchars($post->title));
            $item->addChild('link', "{$siteUrl}/blog/{$post->slug}");
            $item->addChild('guid', "{$siteUrl}/blog/{$post->slug}");
            $item->addChild('description', htmlspecialchars($post->excerpt ?: strip_tags($post->content)));
            $item->addChild('pubDate', $post->published_at ? $post->published_at->toRfc2822String() : $post->created_at->toRfc2822String());
            
            if ($post->author) {
                $item->addChild('author', htmlspecialchars($post->author->name));
            }

            if ($post->featured_image) {
                $mediaImage = $item->addChild('media:content', '', 'http://search.yahoo.com/mrss/');
                $mediaImage->addAttribute('url', $post->featured_image);
                $mediaImage->addAttribute('medium', 'image');
            }
        }

        return response($xml->asXML(), 200)
            ->header('Content-Type', 'text/xml; charset=utf-8');
    }
}
