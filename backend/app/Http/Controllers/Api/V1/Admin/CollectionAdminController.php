<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $collections = Collection::withCount('products')
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $collections,
        ], 200);
    }

    public function show(int $id): JsonResponse
    {
        $collection = Collection::with(['products.images', 'products.variants'])->find($id);

        if (!$collection) {
            return response()->json([
                'success' => false,
                'message' => 'Collection not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $collection,
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:collections,slug',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'banner_url' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'status' => 'required|in:ACTIVE,DISABLED',
            'sort_order' => 'nullable|integer',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $slug = $request->filled('slug') ? Str::slug($request->input('slug')) : Str::slug($request->input('name'));

        $collection = Collection::create([
            'name' => $request->input('name'),
            'slug' => $slug,
            'description' => $request->input('description'),
            'image_url' => $request->input('image_url'),
            'banner_url' => $request->input('banner_url'),
            'seo_title' => $request->input('seo_title'),
            'seo_description' => $request->input('seo_description'),
            'status' => $request->input('status', 'ACTIVE'),
            'sort_order' => $request->input('sort_order', 0),
        ]);

        if ($request->has('product_ids')) {
            $collection->products()->sync($request->input('product_ids'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Collection created successfully.',
            'data' => $collection->fresh(['products']),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $collection = Collection::find($id);
        if (!$collection) {
            return response()->json(['success' => false, 'message' => 'Collection not found.'], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:collections,slug,' . $id,
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'banner_url' => 'nullable|string',
            'seo_title' => 'nullable|string|max:255',
            'seo_description' => 'nullable|string',
            'status' => 'required|in:ACTIVE,DISABLED',
            'sort_order' => 'nullable|integer',
            'product_ids' => 'nullable|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $data = $request->only([
            'name',
            'description',
            'image_url',
            'banner_url',
            'seo_title',
            'seo_description',
            'status',
            'sort_order',
        ]);

        if ($request->filled('slug')) {
            $data['slug'] = Str::slug($request->input('slug'));
        } else {
            $data['slug'] = Str::slug($request->input('name'));
        }

        $collection->update($data);

        if ($request->has('product_ids')) {
            $collection->products()->sync($request->input('product_ids'));
        }

        return response()->json([
            'success' => true,
            'message' => 'Collection updated successfully.',
            'data' => $collection->fresh(['products']),
        ], 200);
    }

    public function destroy(int $id): JsonResponse
    {
        $collection = Collection::find($id);
        if (!$collection) {
            return response()->json(['success' => false, 'message' => 'Collection not found.'], 404);
        }

        $collection->delete();

        return response()->json([
            'success' => true,
            'message' => 'Collection deleted successfully.',
        ], 200);
    }

    public function syncProducts(Request $request, int $id): JsonResponse
    {
        $collection = Collection::find($id);
        if (!$collection) {
            return response()->json(['success' => false, 'message' => 'Collection not found.'], 404);
        }

        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        $collection->products()->sync($request->input('product_ids'));

        return response()->json([
            'success' => true,
            'message' => 'Collection products synchronized successfully.',
            'data' => $collection->fresh(['products']),
        ], 200);
    }
}
