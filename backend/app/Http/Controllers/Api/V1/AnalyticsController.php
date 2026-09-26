<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsPageView;
use App\Models\AnalyticsSearch;
use App\Models\AnalyticsSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    /**
     * Ingest Page View Event (Asynchronous / Non-blocking)
     */
    public function trackPageView(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'session_id' => 'required|string|max:100',
                'visitor_id' => 'required|string|max:100',
                'user_id' => 'nullable|integer',
                'page_url' => 'required|string|max:500',
                'route_name' => 'nullable|string|max:100',
                'page_title' => 'nullable|string|max:255',
                'page_type' => 'nullable|string|max:50',
                'product_id' => 'nullable|integer',
                'collection_id' => 'nullable|integer',
                'category_id' => 'nullable|integer',
                'referrer_url' => 'nullable|string|max:500',
                'landing_page' => 'nullable|string|max:500',
                'traffic_source' => 'nullable|string|max:100',
                'utm_source' => 'nullable|string|max:100',
                'utm_medium' => 'nullable|string|max:100',
                'utm_campaign' => 'nullable|string|max:100',
                'utm_term' => 'nullable|string|max:100',
                'utm_content' => 'nullable|string|max:100',
                'device_type' => 'nullable|string|max:50',
                'browser' => 'nullable|string|max:50',
                'os' => 'nullable|string|max:50',
                'screen_size' => 'nullable|string|max:50',
                'active_time_seconds' => 'nullable|integer',
                'max_scroll_percentage' => 'nullable|integer',
                'is_entry_page' => 'nullable|boolean',
                'is_exit_page' => 'nullable|boolean',
            ]);

            $sessionId = $data['session_id'];
            $visitorId = $data['visitor_id'];
            $userId = $data['user_id'] ?? auth('sanctum')->id();

            // Upsert Session
            $session = AnalyticsSession::firstOrCreate(
                ['session_id' => $sessionId],
                [
                    'visitor_id' => $visitorId,
                    'user_id' => $userId,
                    'landing_page' => $data['landing_page'] ?? $data['page_url'],
                    'referrer_url' => $data['referrer_url'] ?? null,
                    'traffic_source' => $data['traffic_source'] ?? 'Direct',
                    'utm_source' => $data['utm_source'] ?? null,
                    'utm_medium' => $data['utm_medium'] ?? null,
                    'utm_campaign' => $data['utm_campaign'] ?? null,
                    'utm_term' => $data['utm_term'] ?? null,
                    'utm_content' => $data['utm_content'] ?? null,
                    'device_type' => $data['device_type'] ?? 'Desktop',
                    'browser' => $data['browser'] ?? 'Browser',
                    'os' => $data['os'] ?? 'OS',
                    'screen_size' => $data['screen_size'] ?? null,
                    'ip_address' => $request->ip(),
                    'last_active_at' => now(),
                ]
            );

            if (!$session->wasRecentlyCreated) {
                $session->increment('total_page_views');
                if (!empty($data['active_time_seconds'])) {
                    $session->increment('total_active_seconds', (int)$data['active_time_seconds']);
                }
                $session->update([
                    'exit_page' => $data['page_url'],
                    'last_active_at' => now(),
                    'user_id' => $userId ?: $session->user_id,
                ]);
            }

            // Create Page View
            $pageView = AnalyticsPageView::create([
                'session_id' => $sessionId,
                'visitor_id' => $visitorId,
                'user_id' => $userId,
                'page_url' => $data['page_url'],
                'route_name' => $data['route_name'] ?? null,
                'page_title' => $data['page_title'] ?? null,
                'page_type' => $data['page_type'] ?? 'other',
                'product_id' => $data['product_id'] ?? null,
                'collection_id' => $data['collection_id'] ?? null,
                'category_id' => $data['category_id'] ?? null,
                'referrer_url' => $data['referrer_url'] ?? null,
                'active_time_seconds' => $data['active_time_seconds'] ?? 0,
                'max_scroll_percentage' => $data['max_scroll_percentage'] ?? 0,
                'is_entry_page' => $data['is_entry_page'] ?? ($session->total_page_views === 1),
                'is_exit_page' => $data['is_exit_page'] ?? false,
                'created_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Pageview recorded',
                'page_view_id' => $pageView->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('AnalyticsController trackPageView exception: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Tracking failed gracefully'], 200);
        }
    }

    /**
     * Ingest Analytics Event (e.g. add_to_cart, wishlist_add, buy_now, variant_select)
     */
    public function trackEvent(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'session_id' => 'required|string|max:100',
                'visitor_id' => 'required|string|max:100',
                'user_id' => 'nullable|integer',
                'event_name' => 'required|string|max:100',
                'page_url' => 'nullable|string|max:500',
                'product_id' => 'nullable|integer',
                'collection_id' => 'nullable|integer',
                'metadata' => 'nullable|array',
            ]);

            $sessionId = $data['session_id'];
            $eventName = $data['event_name'];

            AnalyticsEvent::create([
                'session_id' => $sessionId,
                'visitor_id' => $data['visitor_id'],
                'user_id' => $data['user_id'] ?? auth('sanctum')->id(),
                'event_name' => $eventName,
                'page_url' => $data['page_url'] ?? null,
                'product_id' => $data['product_id'] ?? null,
                'collection_id' => $data['collection_id'] ?? null,
                'metadata' => $data['metadata'] ?? null,
                'created_at' => now(),
            ]);

            // Update Session Flags
            if ($eventName === 'add_to_cart' || $eventName === 'buy_now') {
                AnalyticsSession::where('session_id', $sessionId)->update(['has_add_to_cart' => true]);
            } elseif ($eventName === 'begin_checkout') {
                AnalyticsSession::where('session_id', $sessionId)->update(['has_checkout' => true]);
            } elseif ($eventName === 'purchase') {
                AnalyticsSession::where('session_id', $sessionId)->update(['has_purchased' => true]);
            }

            return response()->json(['success' => true, 'message' => 'Event recorded']);
        } catch (\Throwable $e) {
            Log::error('AnalyticsController trackEvent exception: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Tracking failed gracefully'], 200);
        }
    }

    /**
     * Ingest Analytics Search Query
     */
    public function trackSearch(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'session_id' => 'required|string|max:100',
                'visitor_id' => 'required|string|max:100',
                'search_query' => 'required|string|max:255',
                'results_count' => 'required|integer',
                'clicked_product_id' => 'nullable|integer',
            ]);

            AnalyticsSearch::create([
                'session_id' => $data['session_id'],
                'visitor_id' => $data['visitor_id'],
                'search_query' => strtolower(trim($data['search_query'])),
                'results_count' => $data['results_count'],
                'clicked_product_id' => $data['clicked_product_id'] ?? null,
                'created_at' => now(),
            ]);

            return response()->json(['success' => true, 'message' => 'Search query logged']);
        } catch (\Throwable $e) {
            Log::error('AnalyticsController trackSearch exception: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Tracking failed gracefully'], 200);
        }
    }

    /**
     * Batch Ingestion Endpoint (Supports navigator.sendBeacon)
     */
    public function batch(Request $request): JsonResponse
    {
        try {
            $events = $request->input('events', []);
            if (!is_array($events)) {
                $events = json_decode($request->getContent(), true) ?: [];
            }

            foreach ($events as $item) {
                if (isset($item['type']) && $item['type'] === 'pageview') {
                    $this->trackPageView(new Request($item));
                } elseif (isset($item['event_name'])) {
                    $this->trackEvent(new Request($item));
                }
            }

            return response()->json(['success' => true, 'message' => 'Batch events processed']);
        } catch (\Throwable $e) {
            Log::error('AnalyticsController batch exception: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Batch processing failed gracefully'], 200);
        }
    }
}
