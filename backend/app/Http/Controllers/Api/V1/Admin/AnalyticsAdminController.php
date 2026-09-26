<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\AnalyticsPageView;
use App\Models\AnalyticsSearch;
use App\Models\AnalyticsSession;
use App\Models\Collection;
use App\Models\Order;
use App\Models\Product;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsAdminController extends Controller
{
    /**
     * Get Start & End Dates from Request Range (e.g. today, 7d, 30d, 90d)
     */
    private function parseDateRange(Request $request): array
    {
        $range = $request->input('range', '30d');
        $now = Carbon::now();

        switch ($range) {
            case 'today':
                $start = $now->copy()->startOfDay();
                break;
            case 'yesterday':
                $start = $now->copy()->subDay()->startOfDay();
                $now = $now->copy()->subDay()->endOfDay();
                break;
            case '7d':
                $start = $now->copy()->subDays(7)->startOfDay();
                break;
            case '90d':
                $start = $now->copy()->subDays(90)->startOfDay();
                break;
            case 'custom':
                $start = $request->input('start_date') ? Carbon::parse($request->input('start_date'))->startOfDay() : $now->copy()->subDays(30)->startOfDay();
                $now = $request->input('end_date') ? Carbon::parse($request->input('end_date'))->endOfDay() : $now;
                break;
            case '30d':
            default:
                $start = $now->copy()->subDays(30)->startOfDay();
                break;
        }

        return [$start, $now];
    }

    /**
     * Main Customer Analytics Overview Dashboard Stats
     */
    public function overview(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $totalPageViews = AnalyticsPageView::whereBetween('created_at', [$start, $end])->count();
        $uniqueVisitors = AnalyticsPageView::whereBetween('created_at', [$start, $end])->distinct('visitor_id')->count('visitor_id');
        $totalSessions = AnalyticsSession::whereBetween('created_at', [$start, $end])->count();
        $productViews = AnalyticsPageView::whereBetween('created_at', [$start, $end])->where('page_type', 'product')->count();
        $addCartEvents = AnalyticsEvent::whereBetween('created_at', [$start, $end])->whereIn('event_name', ['add_to_cart', 'buy_now'])->count();
        
        // Revenue & Orders ground truth from Order table
        $ordersCount = Order::whereBetween('created_at', [$start, $end])->where('payment_status', 'PAID')->count();
        $totalRevenue = (float) Order::whereBetween('created_at', [$start, $end])->where('payment_status', 'PAID')->sum('total_amount');
        
        $conversionRate = $uniqueVisitors > 0 ? round(($ordersCount / $uniqueVisitors) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'total_page_views' => $totalPageViews,
                'unique_visitors' => $uniqueVisitors,
                'total_sessions' => $totalSessions,
                'product_views' => $productViews,
                'add_to_cart_events' => $addCartEvents,
                'orders_count' => $ordersCount,
                'total_revenue' => $totalRevenue,
                'conversion_rate' => $conversionRate,
                'range' => $request->input('range', '30d'),
            ],
        ]);
    }

    /**
     * Most Viewed Pages Analytics API
     */
    public function pages(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);
        $sort = $request->input('sort', 'views');

        $query = AnalyticsPageView::whereBetween('created_at', [$start, $end])
            ->select(
                'page_url',
                'page_type',
                DB::raw('COUNT(*) as total_views'),
                DB::raw('COUNT(DISTINCT visitor_id) as unique_visitors'),
                DB::raw('ROUND(AVG(active_time_seconds)) as avg_time'),
                DB::raw('ROUND(AVG(max_scroll_percentage)) as avg_scroll')
            )
            ->groupBy('page_url', 'page_type');

        if ($sort === 'visitors') {
            $query->orderBy('unique_visitors', 'desc');
        } elseif ($sort === 'time') {
            $query->orderBy('avg_time', 'desc');
        } elseif ($sort === 'scroll') {
            $query->orderBy('avg_scroll', 'desc');
        } else {
            $query->orderBy('total_views', 'desc');
        }

        $pages = $query->limit(50)->get();

        return response()->json([
            'success' => true,
            'data' => $pages,
        ]);
    }

    /**
     * Individual Page Deep-Dive Detail View API
     */
    public function pageDetail(Request $request): JsonResponse
    {
        $url = $request->input('url');
        if (!$url) {
            return response()->json(['success' => false, 'message' => 'Target URL required'], 422);
        }

        [$start, $end] = $this->parseDateRange($request);

        $totalViews = AnalyticsPageView::where('page_url', $url)->whereBetween('created_at', [$start, $end])->count();
        $uniqueVisitors = AnalyticsPageView::where('page_url', $url)->whereBetween('created_at', [$start, $end])->distinct('visitor_id')->count('visitor_id');
        $avgTime = (int) AnalyticsPageView::where('page_url', $url)->whereBetween('created_at', [$start, $end])->avg('active_time_seconds');
        $avgScroll = (int) AnalyticsPageView::where('page_url', $url)->whereBetween('created_at', [$start, $end])->avg('max_scroll_percentage');

        // Traffic sources breakdown for this specific page
        $trafficSources = AnalyticsSession::whereIn('session_id', function ($q) use ($url, $start, $end) {
            $q->select('session_id')->from('analytics_page_views')->where('page_url', $url)->whereBetween('created_at', [$start, $end]);
        })
        ->select('traffic_source', DB::raw('COUNT(*) as count'))
        ->groupBy('traffic_source')
        ->orderBy('count', 'desc')
        ->get();

        // Device Breakdown for this page
        $devices = AnalyticsSession::whereIn('session_id', function ($q) use ($url, $start, $end) {
            $q->select('session_id')->from('analytics_page_views')->where('page_url', $url)->whereBetween('created_at', [$start, $end]);
        })
        ->select('device_type', DB::raw('COUNT(*) as count'))
        ->groupBy('device_type')
        ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'page_url' => $url,
                'total_views' => $totalViews,
                'unique_visitors' => $uniqueVisitors,
                'avg_time_seconds' => $avgTime,
                'avg_scroll_percentage' => $avgScroll,
                'traffic_sources' => $trafficSources,
                'devices' => $devices,
            ],
        ]);
    }

    /**
     * Product-Level Analytics API
     */
    public function products(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $products = Product::select('id', 'name', 'slug', 'price')
            ->get()
            ->map(function ($prod) use ($start, $end) {
                $views = AnalyticsPageView::where('product_id', $prod->id)->whereBetween('created_at', [$start, $end])->count();
                $uniqueViewers = AnalyticsPageView::where('product_id', $prod->id)->whereBetween('created_at', [$start, $end])->distinct('visitor_id')->count('visitor_id');
                $addToCarts = AnalyticsEvent::where('product_id', $prod->id)->whereIn('event_name', ['add_to_cart', 'buy_now'])->whereBetween('created_at', [$start, $end])->count();
                
                // Purchases & Revenue from backend Orders
                $orderItems = DB::table('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('order_items.product_id', $prod->id)
                    ->where('orders.payment_status', 'PAID')
                    ->whereBetween('orders.created_at', [$start, $end])
                    ->select(DB::raw('SUM(quantity) as units_sold'), DB::raw('SUM(total) as revenue'))
                    ->first();

                $purchases = (int) ($orderItems->units_sold ?? 0);
                $revenue = (float) ($orderItems->revenue ?? 0.00);

                $addToCartRate = $uniqueViewers > 0 ? round(($addToCarts / $uniqueViewers) * 100, 2) : 0;
                $conversionRate = $uniqueViewers > 0 ? round(($purchases / $uniqueViewers) * 100, 2) : 0;

                return [
                    'id' => $prod->id,
                    'name' => $prod->name,
                    'slug' => $prod->slug,
                    'price' => (float) $prod->price,
                    'views' => $views,
                    'unique_viewers' => $uniqueViewers,
                    'add_to_carts' => $addToCarts,
                    'add_to_cart_rate' => $addToCartRate,
                    'purchases' => $purchases,
                    'conversion_rate' => $conversionRate,
                    'revenue' => $revenue,
                ];
            })
            ->sortByDesc('views')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Collection / Category Analytics API
     */
    public function collections(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $collections = Collection::select('id', 'name', 'slug')
            ->get()
            ->map(function ($col) use ($start, $end) {
                $views = AnalyticsPageView::where('collection_id', $col->id)->whereBetween('created_at', [$start, $end])->count();
                $uniqueVisitors = AnalyticsPageView::where('collection_id', $col->id)->whereBetween('created_at', [$start, $end])->distinct('visitor_id')->count('visitor_id');
                $productClicks = AnalyticsEvent::where('collection_id', $col->id)->where('event_name', 'product_view')->whereBetween('created_at', [$start, $end])->count();
                $addToCarts = AnalyticsEvent::where('collection_id', $col->id)->whereIn('event_name', ['add_to_cart', 'buy_now'])->whereBetween('created_at', [$start, $end])->count();

                return [
                    'id' => $col->id,
                    'name' => $col->name,
                    'slug' => $col->slug,
                    'views' => $views,
                    'unique_visitors' => $uniqueVisitors,
                    'product_clicks' => $productClicks,
                    'add_to_carts' => $addToCarts,
                ];
            })
            ->sortByDesc('views')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $collections,
        ]);
    }

    /**
     * Customer Session Navigation Paths & Journeys API
     */
    public function customerJourneys(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $sessions = AnalyticsSession::with(['pageViews' => function ($q) {
            $q->orderBy('created_at', 'asc');
        }])
        ->whereBetween('created_at', [$start, $end])
        ->orderBy('updated_at', 'desc')
        ->limit(30)
        ->get()
        ->map(function ($session) {
            $path = $session->pageViews->pluck('page_url')->toArray();
            return [
                'session_id' => $session->session_id,
                'visitor_id' => $session->visitor_id,
                'device_type' => $session->device_type,
                'traffic_source' => $session->traffic_source,
                'total_views' => $session->total_page_views,
                'total_active_seconds' => $session->total_active_seconds,
                'has_purchased' => $session->has_purchased,
                'path' => array_values(array_unique($path)),
                'created_at' => $session->created_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $sessions,
        ]);
    }

    /**
     * Traffic Sources & UTM Campaign Analytics API
     */
    public function trafficSources(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $sources = AnalyticsSession::whereBetween('created_at', [$start, $end])
            ->select(
                'traffic_source',
                DB::raw('COUNT(*) as sessions'),
                DB::raw('COUNT(DISTINCT visitor_id) as visitors'),
                DB::raw('SUM(total_page_views) as page_views'),
                DB::raw('SUM(CASE WHEN has_add_to_cart = 1 THEN 1 ELSE 0 END) as add_to_carts'),
                DB::raw('SUM(CASE WHEN has_purchased = 1 THEN 1 ELSE 0 END) as purchases')
            )
            ->groupBy('traffic_source')
            ->orderBy('sessions', 'desc')
            ->get();

        $utmCampaigns = AnalyticsSession::whereBetween('created_at', [$start, $end])
            ->whereNotNull('utm_source')
            ->select(
                'utm_source',
                'utm_medium',
                'utm_campaign',
                DB::raw('COUNT(*) as sessions'),
                DB::raw('COUNT(DISTINCT visitor_id) as visitors')
            )
            ->groupBy('utm_source', 'utm_medium', 'utm_campaign')
            ->orderBy('sessions', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'sources' => $sources,
                'utm_campaigns' => $utmCampaigns,
            ],
        ]);
    }

    /**
     * Landing & Exit Pages Analytics API
     */
    public function landingPages(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $landings = AnalyticsSession::whereBetween('created_at', [$start, $end])
            ->whereNotNull('landing_page')
            ->select('landing_page', DB::raw('COUNT(*) as sessions'), DB::raw('COUNT(DISTINCT visitor_id) as visitors'))
            ->groupBy('landing_page')
            ->orderBy('sessions', 'desc')
            ->limit(20)
            ->get();

        $exits = AnalyticsSession::whereBetween('created_at', [$start, $end])
            ->whereNotNull('exit_page')
            ->select('exit_page', DB::raw('COUNT(*) as exits'))
            ->groupBy('exit_page')
            ->orderBy('exits', 'desc')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'landing_pages' => $landings,
                'exit_pages' => $exits,
            ],
        ]);
    }

    /**
     * Search Behavior & Zero-Result Searches API
     */
    public function search(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $mostSearched = AnalyticsSearch::whereBetween('created_at', [$start, $end])
            ->select('search_query', DB::raw('COUNT(*) as search_count'), DB::raw('AVG(results_count) as avg_results'))
            ->groupBy('search_query')
            ->orderBy('search_count', 'desc')
            ->limit(30)
            ->get();

        $zeroResults = AnalyticsSearch::whereBetween('created_at', [$start, $end])
            ->where('results_count', 0)
            ->select('search_query', DB::raw('COUNT(*) as search_count'))
            ->groupBy('search_query')
            ->orderBy('search_count', 'desc')
            ->limit(30)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'most_searched' => $mostSearched,
                'zero_results' => $zeroResults,
            ],
        ]);
    }

    /**
     * 7-Stage E-Commerce Checkout Funnel API
     */
    public function checkoutFunnel(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $totalVisitors = AnalyticsPageView::whereBetween('created_at', [$start, $end])->distinct('visitor_id')->count('visitor_id');
        $productViewers = AnalyticsPageView::whereBetween('created_at', [$start, $end])->where('page_type', 'product')->distinct('visitor_id')->count('visitor_id');
        $addToCarts = AnalyticsEvent::whereBetween('created_at', [$start, $end])->whereIn('event_name', ['add_to_cart', 'buy_now'])->distinct('visitor_id')->count('visitor_id');
        $cartViews = AnalyticsPageView::whereBetween('created_at', [$start, $end])->where('page_type', 'cart')->distinct('visitor_id')->count('visitor_id');
        $checkoutViewers = AnalyticsPageView::whereBetween('created_at', [$start, $end])->where('page_type', 'checkout')->distinct('visitor_id')->count('visitor_id');
        $purchasers = Order::whereBetween('created_at', [$start, $end])->where('payment_status', 'PAID')->distinct('customer_id')->count('customer_id');

        return response()->json([
            'success' => true,
            'data' => [
                ['stage' => 'Store Visitors', 'count' => $totalVisitors],
                ['stage' => 'Product Viewers', 'count' => $productViewers],
                ['stage' => 'Add To Cart', 'count' => $addToCarts],
                ['stage' => 'Cart Viewers', 'count' => $cartViews],
                ['stage' => 'Checkout Started', 'count' => $checkoutViewers],
                ['stage' => 'Completed Orders', 'count' => $purchasers],
            ],
        ]);
    }

    /**
     * Real-Time Active Visitors API (Active in last 5 minutes)
     */
    public function realtime(Request $request): JsonResponse
    {
        $threshold = Carbon::now()->subMinutes(5);

        $activeSessions = AnalyticsSession::where('last_active_at', '>=', $threshold)
            ->select('session_id', 'visitor_id', 'exit_page as current_page', 'device_type', 'traffic_source', 'last_active_at')
            ->orderBy('last_active_at', 'desc')
            ->get();

        $activePages = AnalyticsPageView::where('created_at', '>=', $threshold)
            ->select('page_url', DB::raw('COUNT(DISTINCT visitor_id) as active_count'))
            ->groupBy('page_url')
            ->orderBy('active_count', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'active_visitor_count' => $activeSessions->count(),
                'active_pages' => $activePages,
                'recent_sessions' => $activeSessions,
            ],
        ]);
    }

    /**
     * Device & Browser Breakdown Analytics API
     */
    public function devices(Request $request): JsonResponse
    {
        [$start, $end] = $this->parseDateRange($request);

        $deviceBreakdown = AnalyticsSession::whereBetween('created_at', [$start, $end])
            ->select('device_type', DB::raw('COUNT(*) as count'))
            ->groupBy('device_type')
            ->get();

        $browsers = AnalyticsSession::whereBetween('created_at', [$start, $end])
            ->select('browser', DB::raw('COUNT(*) as count'))
            ->groupBy('browser')
            ->get();

        $operatingSystems = AnalyticsSession::whereBetween('created_at', [$start, $end])
            ->select('os', DB::raw('COUNT(*) as count'))
            ->groupBy('os')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'device_types' => $deviceBreakdown,
                'browsers' => $browsers,
                'operating_systems' => $operatingSystems,
            ],
        ]);
    }
}
