<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Models\BlogFaq;
use App\Models\BlogRedirect;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

class BlogAdminController extends Controller
{
    // ==========================================
    // BLOG POSTS CRUD
    // ==========================================

    public function index(Request $request)
    {
        $query = BlogPost::with(['category', 'author:id,name,email', 'tags']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('focus_keyword', 'like', "%{$search}%");
            });
        }

        $posts = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'total' => $posts->total(),
            ]
        ]);
    }

    public function show($id)
    {
        $post = BlogPost::with([
            'category',
            'tags',
            'faqs',
            'relatedProducts:id,name,slug,price,mrp',
            'relatedPosts:id,title,slug,featured_image'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $post
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'status' => 'required|in:DRAFT,PUBLISHED,SCHEDULED',
            'category_id' => 'nullable|exists:blog_categories,id',
            'featured_image' => 'nullable|string',
            'featured_image_alt' => 'nullable|string',
            'featured_image_caption' => 'nullable|string',
            'seo_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'focus_keyword' => 'nullable|string',
            'secondary_keywords' => 'nullable',
            'canonical_url' => 'nullable|string',
            'robots_index' => 'boolean',
            'robots_follow' => 'boolean',
            'og_title' => 'nullable|string',
            'og_description' => 'nullable|string',
            'og_image' => 'nullable|string',
            'twitter_title' => 'nullable|string',
            'twitter_description' => 'nullable|string',
            'twitter_image' => 'nullable|string',
            'published_at' => 'nullable|date',
        ]);

        return DB::transaction(function () use ($request) {
            $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->title);
            
            // Ensure unique slug
            $originalSlug = $slug;
            $count = 1;
            while (BlogPost::where('slug', $slug)->exists()) {
                $slug = "{$originalSlug}-{$count}";
                $count++;
            }

            // Word count for reading time
            $wordCount = str_word_count(strip_tags($request->content));
            $readingTime = max(1, (int) ceil($wordCount / 200));

            $publishedAt = $request->published_at;
            if ($request->status === 'PUBLISHED' && !$publishedAt) {
                $publishedAt = now();
            }

            $post = BlogPost::create([
                'title' => $request->title,
                'slug' => $slug,
                'excerpt' => $request->excerpt,
                'content' => $request->content,
                'featured_image' => $request->featured_image,
                'featured_image_alt' => $request->featured_image_alt,
                'featured_image_caption' => $request->featured_image_caption,
                'author_id' => $request->user()?->id || 1,
                'category_id' => $request->category_id,
                'status' => $request->status,
                'is_featured' => $request->boolean('is_featured', false),
                'published_at' => $publishedAt,
                'reading_time' => $readingTime,
                'seo_title' => $request->seo_title ?: $request->title . ' | Arilha',
                'meta_description' => $request->meta_description ?: Str::limit(strip_tags($request->excerpt ?: $request->content), 155),
                'focus_keyword' => $request->focus_keyword,
                'secondary_keywords' => is_array($request->secondary_keywords) ? $request->secondary_keywords : [],
                'canonical_url' => $request->canonical_url ?: "https://arilha.com/blog/{$slug}",
                'robots_index' => $request->boolean('robots_index', true),
                'robots_follow' => $request->boolean('robots_follow', true),
                'og_title' => $request->og_title ?: ($request->seo_title ?: $request->title),
                'og_description' => $request->og_description ?: ($request->meta_description ?: $request->excerpt),
                'og_image' => $request->og_image ?: $request->featured_image,
                'twitter_title' => $request->twitter_title ?: ($request->seo_title ?: $request->title),
                'twitter_description' => $request->twitter_description ?: ($request->meta_description ?: $request->excerpt),
                'twitter_image' => $request->twitter_image ?: $request->featured_image,
            ]);

            // Sync Tags
            if ($request->has('tag_ids') && is_array($request->tag_ids)) {
                $post->tags()->sync($request->tag_ids);
            }

            // Sync FAQs
            if ($request->has('faqs') && is_array($request->faqs)) {
                foreach ($request->faqs as $idx => $faq) {
                    if (!empty($faq['question']) && !empty($faq['answer'])) {
                        BlogFaq::create([
                            'blog_post_id' => $post->id,
                            'question' => $faq['question'],
                            'answer' => $faq['answer'],
                            'sort_order' => $idx + 1,
                        ]);
                    }
                }
            }

            // Sync Related Products
            if ($request->has('related_product_ids') && is_array($request->related_product_ids)) {
                $post->relatedProducts()->sync($request->related_product_ids);
            }

            // Sync Related Posts
            if ($request->has('related_post_ids') && is_array($request->related_post_ids)) {
                $post->relatedPosts()->sync($request->related_post_ids);
            }

            return response()->json([
                'success' => true,
                'message' => 'Blog post created successfully.',
                'data' => $post->load(['category', 'tags', 'faqs', 'relatedProducts', 'relatedPosts'])
            ], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'status' => 'required|in:DRAFT,PUBLISHED,SCHEDULED',
            'category_id' => 'nullable|exists:blog_categories,id',
        ]);

        return DB::transaction(function () use ($request, $post) {
            $oldSlug = $post->slug;
            $newSlug = $request->slug ? Str::slug($request->slug) : Str::slug($request->title);

            // Check if published slug has changed -> Create 301 Redirect rule
            if ($post->status === 'PUBLISHED' && $oldSlug !== $newSlug) {
                BlogRedirect::updateOrCreate(
                    ['old_slug' => $oldSlug],
                    ['new_slug' => $newSlug]
                );
            }

            // Ensure unique slug (excluding current post)
            if ($newSlug !== $oldSlug) {
                $originalSlug = $newSlug;
                $count = 1;
                while (BlogPost::where('slug', $newSlug)->where('id', '!=', $post->id)->exists()) {
                    $newSlug = "{$originalSlug}-{$count}";
                    $count++;
                }
            }

            $wordCount = str_word_count(strip_tags($request->content));
            $readingTime = max(1, (int) ceil($wordCount / 200));

            $publishedAt = $post->published_at;
            if ($request->status === 'PUBLISHED' && !$publishedAt) {
                $publishedAt = now();
            }

            $post->update([
                'title' => $request->title,
                'slug' => $newSlug,
                'excerpt' => $request->excerpt,
                'content' => $request->content,
                'featured_image' => $request->featured_image,
                'featured_image_alt' => $request->featured_image_alt,
                'featured_image_caption' => $request->featured_image_caption,
                'category_id' => $request->category_id,
                'status' => $request->status,
                'is_featured' => $request->boolean('is_featured', false),
                'published_at' => $publishedAt,
                'reading_time' => $readingTime,
                'seo_title' => $request->seo_title ?: $request->title . ' | Arilha',
                'meta_description' => $request->meta_description ?: Str::limit(strip_tags($request->excerpt ?: $request->content), 155),
                'focus_keyword' => $request->focus_keyword,
                'secondary_keywords' => is_array($request->secondary_keywords) ? $request->secondary_keywords : [],
                'canonical_url' => $request->canonical_url ?: "https://arilha.com/blog/{$newSlug}",
                'robots_index' => $request->boolean('robots_index', true),
                'robots_follow' => $request->boolean('robots_follow', true),
                'og_title' => $request->og_title ?: ($request->seo_title ?: $request->title),
                'og_description' => $request->og_description ?: ($request->meta_description ?: $request->excerpt),
                'og_image' => $request->og_image ?: $request->featured_image,
                'twitter_title' => $request->twitter_title ?: ($request->seo_title ?: $request->title),
                'twitter_description' => $request->twitter_description ?: ($request->meta_description ?: $request->excerpt),
                'twitter_image' => $request->twitter_image ?: $request->featured_image,
            ]);

            // Sync Tags
            if ($request->has('tag_ids')) {
                $post->tags()->sync($request->tag_ids ?: []);
            }

            // Sync FAQs
            BlogFaq::where('blog_post_id', $post->id)->delete();
            if ($request->has('faqs') && is_array($request->faqs)) {
                foreach ($request->faqs as $idx => $faq) {
                    if (!empty($faq['question']) && !empty($faq['answer'])) {
                        BlogFaq::create([
                            'blog_post_id' => $post->id,
                            'question' => $faq['question'],
                            'answer' => $faq['answer'],
                            'sort_order' => $idx + 1,
                        ]);
                    }
                }
            }

            // Sync Related Products
            if ($request->has('related_product_ids')) {
                $post->relatedProducts()->sync($request->related_product_ids ?: []);
            }

            // Sync Related Posts
            if ($request->has('related_post_ids')) {
                $post->relatedPosts()->sync($request->related_post_ids ?: []);
            }

            return response()->json([
                'success' => true,
                'message' => 'Blog post updated successfully.',
                'data' => $post->load(['category', 'tags', 'faqs', 'relatedProducts', 'relatedPosts'])
            ]);
        });
    }

    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Blog post deleted successfully.'
        ]);
    }

    // ==========================================
    // CATEGORIES CRUD
    // ==========================================

    public function getCategories()
    {
        $categories = BlogCategory::withCount('posts')->orderBy('sort_order')->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function storeCategory(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);

        $category = BlogCategory::create([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'sort_order' => $request->get('sort_order', 0),
        ]);

        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = BlogCategory::findOrFail($id);
        $request->validate(['name' => 'required|string|max:255']);
        $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);

        $category->update([
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'sort_order' => $request->get('sort_order', 0),
        ]);

        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroyCategory($id)
    {
        $category = BlogCategory::findOrFail($id);
        $category->delete();
        return response()->json(['success' => true, 'message' => 'Category deleted successfully.']);
    }

    // ==========================================
    // TAGS CRUD
    // ==========================================

    public function getTags()
    {
        $tags = BlogTag::withCount('posts')->orderBy('name')->get();
        return response()->json(['success' => true, 'data' => $tags]);
    }

    public function storeTag(Request $request)
    {
        $request->validate(['name' => 'required|string|max:255']);
        $slug = $request->slug ? Str::slug($request->slug) : Str::slug($request->name);

        $tag = BlogTag::firstOrCreate(['slug' => $slug], ['name' => $request->name]);

        return response()->json(['success' => true, 'data' => $tag], 201);
    }
}
