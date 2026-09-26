<?php

use App\Http\Controllers\Api\V1\Admin\AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminModuleController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AnalyticsAdminController;
use App\Http\Controllers\Api\V1\Admin\CollectionAdminController;
use App\Http\Controllers\Api\V1\Admin\CustomerAdminController;
use App\Http\Controllers\Api\V1\Admin\CategoryAdminController;
use App\Http\Controllers\Api\V1\Admin\CMSAdminController;
use App\Http\Controllers\Api\V1\Admin\CouponAdminController;
use App\Http\Controllers\Api\V1\Admin\EmailNotificationAdminController;
use App\Http\Controllers\Api\V1\Admin\InventoryController;
use App\Http\Controllers\Api\V1\Admin\OfferAdminController;
use App\Http\Controllers\Api\V1\Admin\OrderAdminController;
use App\Http\Controllers\Api\V1\Admin\PaymentAdminController;
use App\Http\Controllers\Api\V1\Admin\ProductAdminController;
use App\Http\Controllers\Api\V1\Admin\ReviewAdminController;
use App\Http\Controllers\Api\V1\Admin\ReturnAdminController;
use App\Http\Controllers\Api\V1\Admin\ShippingAdminController;
use App\Http\Controllers\Api\V1\Admin\ShiprocketAdminController;
use App\Http\Controllers\Api\V1\Admin\TaxAdminController;
use App\Http\Controllers\Api\V1\Customer\CustomerOrderController;
use App\Http\Controllers\Api\V1\Customer\CustomerReturnController;
use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\CMSPublicController;
use App\Http\Controllers\Api\V1\CustomerAddressController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PaymentWebhookController;
use App\Http\Controllers\Api\V1\ShiprocketWebhookController;
use App\Http\Controllers\Api\V1\PublicCatalogController;
use App\Http\Controllers\Api\V1\PublicPolicyController;
use App\Http\Controllers\Api\V1\ShippingController;
use App\Http\Controllers\Api\V1\VisitorController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes - ARILHA E-Commerce Engine
|--------------------------------------------------------------------------
*/

Route::get('/health', function () {
    return response()->json([
        'success' => true,
        'message' => 'ARILHA REST API v1 is operational.',
        'version' => '1.0.0',
        'timestamp' => now()->toIso8601String(),
    ]);
});

// =========================================================================
// 1. PUBLIC AUTHENTICATION & GUEST CART ROUTES & WEBHOOKS
// =========================================================================
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/send-otp', [AuthController::class, 'sendOtp']);
    Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::get('/google/redirect', [AuthController::class, 'googleRedirect']);
    Route::get('/google/callback', [AuthController::class, 'googleCallback']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// Public Webhook Callbacks (Exempt from auth)
Route::post('/payments/webhook/razorpay', [PaymentWebhookController::class, 'handleRazorpay']);
Route::post('/webhooks/razorpay', [PaymentWebhookController::class, 'handleRazorpay']);
Route::match(['get', 'post'], '/shipment-updates', [ShiprocketWebhookController::class, 'handleWebhook']);
Route::match(['get', 'post'], '/shiprocket/webhook', [ShiprocketWebhookController::class, 'handleWebhook']);
Route::post('/newsletter/subscribe', [\App\Http\Controllers\Api\V1\NewsletterController::class, 'subscribe']);

// Public Ingestion Analytics APIs (Exempt from auth, non-blocking)
Route::prefix('analytics')->group(function () {
    Route::post('/track-pageview', [AnalyticsController::class, 'trackPageView']);
    Route::post('/track-event', [AnalyticsController::class, 'trackEvent']);
    Route::post('/track-search', [AnalyticsController::class, 'trackSearch']);
    Route::post('/batch', [AnalyticsController::class, 'batch']);
});

// Public Cart & Shipping APIs (Supports both guest & logged in users)
Route::prefix('cart')->group(function () {
    Route::get('/', [CartController::class, 'index']);
    Route::post('/items', [CartController::class, 'addItem']);
    Route::patch('/items/{id}', [CartController::class, 'updateItem']);
    Route::delete('/items/{id}', [CartController::class, 'removeItem']);
});

// Public Guest & Customer Checkout APIs (No Mandatory Auth Required)
Route::prefix('checkout')->group(function () {
    Route::post('/summary', [CheckoutController::class, 'summary']);
    Route::post('/validate', [CheckoutController::class, 'validateCheckout']);
    Route::post('/create-order', [CheckoutController::class, 'createOrder']);
});

// Public Guest & Customer Payment APIs
Route::prefix('payments')->group(function () {
    Route::post('/create', [PaymentController::class, 'createOrder']);
    Route::post('/verify', [PaymentController::class, 'verify']);
});

// Public Catalog, Order Lookup & CMS APIs (No Authentication Required)
Route::get('/orders/lookup/{orderNumber}', [\App\Http\Controllers\Api\V1\Customer\CustomerOrderController::class, 'showByNumber']);
Route::get('/settings', [CMSPublicController::class, 'settings']);
Route::get('/categories', [PublicCatalogController::class, 'categories']);
Route::get('/collections', [PublicCatalogController::class, 'collections']);
Route::get('/collections/{slug}', [PublicCatalogController::class, 'collectionBySlug']);
Route::get('/products', [PublicCatalogController::class, 'products']);
Route::get('/products/suggestions', [PublicCatalogController::class, 'searchSuggestions']);
Route::get('/products/{id}/reviews', [PublicCatalogController::class, 'productReviews']);
Route::get('/products/{id}/review-eligibility', [PublicCatalogController::class, 'reviewEligibility']);
Route::get('/products/{slug}', [PublicCatalogController::class, 'productBySlug']);
Route::get('/feeds/google-merchant', [\App\Http\Controllers\Api\V1\ProductFeedController::class, 'googleMerchant']);
Route::get('/feed/google-merchant', [\App\Http\Controllers\Api\V1\ProductFeedController::class, 'googleMerchant']);

Route::prefix('cms')->group(function () {
    Route::get('/hero-banners', [CMSPublicController::class, 'heroBanners']);
    Route::get('/homepage-sections', [CMSPublicController::class, 'homepageSections']);
    Route::get('/announcement', [CMSPublicController::class, 'announcement']);
    Route::get('/popup', [CMSPublicController::class, 'popup']);
    Route::get('/watch-and-shop', [CMSPublicController::class, 'watchAndShop']);
    Route::get('/lifestyle-slides', [CMSPublicController::class, 'lifestyleSlides']);
    Route::get('/testimonials', [CMSPublicController::class, 'testimonials']);
});

// Public Blog APIs
Route::prefix('blog')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\V1\PublicBlogController::class, 'index']);
    Route::get('/categories', [\App\Http\Controllers\Api\V1\PublicBlogController::class, 'categories']);
    Route::get('/feed.xml', [\App\Http\Controllers\Api\V1\PublicBlogController::class, 'rssFeed']);
    Route::get('/rss', [\App\Http\Controllers\Api\V1\PublicBlogController::class, 'rssFeed']);
    Route::get('/{slug}', [\App\Http\Controllers\Api\V1\PublicBlogController::class, 'show']);
});

Route::get('/shipping-policy', [PublicPolicyController::class, 'getShippingPolicy']);
Route::get('/return-policy', [PublicPolicyController::class, 'getReturnPolicy']);

Route::prefix('shipping')->group(function () {
    Route::get('/methods', [ShippingController::class, 'getMethods']);
    Route::post('/check-serviceability', [ShippingController::class, 'checkServiceability']);
});

// Public Back-In-Stock, Abandoned Cart & Product Bundles APIs
Route::post('/back-in-stock/subscribe', [\App\Http\Controllers\Api\V1\BackInStockController::class, 'subscribe']);
Route::post('/abandoned-cart/track', [\App\Http\Controllers\Api\V1\AbandonedCartController::class, 'track']);
Route::get('/abandoned-cart/recover/{token}', [\App\Http\Controllers\Api\V1\AbandonedCartController::class, 'recover']);

Route::prefix('bundles')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\V1\BundleController::class, 'index']);
    Route::post('/add-to-cart', [\App\Http\Controllers\Api\V1\BundleController::class, 'addToCart']);
    Route::get('/{slug}', [\App\Http\Controllers\Api\V1\BundleController::class, 'show']);
});

// Visitor Analytics Tracking APIs
Route::prefix('visitor')->group(function () {
    Route::post('/heartbeat', [VisitorController::class, 'heartbeat']);
    Route::post('/leave', [VisitorController::class, 'leave']);
    Route::get('/stats', [VisitorController::class, 'getStats']);
});
Route::get('/admin/analytics/visitors', [VisitorController::class, 'getStats']);

// =========================================================================
// 2. AUTHENTICATED CUSTOMER & USER ROUTES (Requires Sanctum Bearer Token)
// =========================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
    });

    // Cart Merge
    Route::post('/cart/merge', [CartController::class, 'mergeCart']);

    // Customer Addresses
    Route::prefix('customer/addresses')->group(function () {
        Route::get('/', [CustomerAddressController::class, 'index']);
        Route::post('/', [CustomerAddressController::class, 'store']);
        Route::put('/{id}', [CustomerAddressController::class, 'update']);
        Route::delete('/{id}', [CustomerAddressController::class, 'destroy']);
        Route::post('/{id}/default', [CustomerAddressController::class, 'setDefault']);
    });

    // Customer Payment History Detail & Retry
    Route::prefix('payments')->group(function () {
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::post('/{id}/retry', [PaymentController::class, 'retry']);
    });

    // Customer Order History, Returns & Product Reviews
    Route::prefix('customer')->group(function () {
        Route::post('/orders/checkout', [CustomerOrderController::class, 'checkout']);
        Route::get('/orders', [CustomerOrderController::class, 'index']);
        Route::get('/orders/{id}', [CustomerOrderController::class, 'show']);
        Route::get('/returns', [CustomerReturnController::class, 'index']);
        Route::post('/returns', [CustomerReturnController::class, 'store']);
        Route::get('/reviews', [\App\Http\Controllers\Api\V1\Customer\CustomerReviewController::class, 'index']);
        Route::post('/reviews', [\App\Http\Controllers\Api\V1\Customer\CustomerReviewController::class, 'store']);
        Route::put('/reviews/{id}', [\App\Http\Controllers\Api\V1\Customer\CustomerReviewController::class, 'update']);
    });
});

// =========================================================================
// 3. PROTECTED ADMIN ROUTES (Requires Sanctum Bearer Token + Admin Access)
// =========================================================================
Route::middleware(['auth:sanctum', 'admin.access'])->prefix('admin')->group(function () {
    
    // Dashboard (Requires reports.view)
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->middleware('permission:reports.view');
    Route::get('/analytics/visitors', [VisitorController::class, 'getStats']);

    // Admin Free Gifts Management APIs
    Route::prefix('free-gifts')->group(function () {
        Route::get('/campaign', [\App\Http\Controllers\Api\V1\Admin\FreeGiftAdminController::class, 'getCampaign']);
        Route::put('/campaign', [\App\Http\Controllers\Api\V1\Admin\FreeGiftAdminController::class, 'updateCampaign']);
        Route::get('/items', [\App\Http\Controllers\Api\V1\Admin\FreeGiftAdminController::class, 'indexItems']);
        Route::post('/items', [\App\Http\Controllers\Api\V1\Admin\FreeGiftAdminController::class, 'storeItem']);
        Route::put('/items/{id}', [\App\Http\Controllers\Api\V1\Admin\FreeGiftAdminController::class, 'updateItem']);
        Route::delete('/items/{id}', [\App\Http\Controllers\Api\V1\Admin\FreeGiftAdminController::class, 'destroyItem']);
    });
    Route::get('/analytics/visitors', [VisitorController::class, 'getStats']);

    // Admin Users Management (SUPER_ADMIN / users.* permissions)
    Route::get('/users', [AdminUserController::class, 'index'])->middleware('permission:users.view');
    Route::post('/users', [AdminUserController::class, 'store'])->middleware('permission:users.create');
    Route::get('/users/{id}', [AdminUserController::class, 'show'])->middleware('permission:users.view');
    Route::put('/users/{id}', [AdminUserController::class, 'update'])->middleware('permission:users.update');
    Route::delete('/users/{id}', [AdminUserController::class, 'destroy'])->middleware('permission:users.delete');

    // Registered Customers / Login Directory
    Route::get('/customers', [CustomerAdminController::class, 'index']);
    Route::get('/customers/{id}', [CustomerAdminController::class, 'show']);
    Route::put('/customers/{id}/status', [CustomerAdminController::class, 'toggleStatus']);

    // Admin Products & Variant Management
    Route::get('/products', [ProductAdminController::class, 'index'])->middleware('permission:products.view');
    Route::post('/products', [ProductAdminController::class, 'store'])->middleware('permission:products.create');
    Route::get('/products/{id}', [ProductAdminController::class, 'show'])->middleware('permission:products.view');
    Route::post('/products/{id}/variants/generate', [ProductAdminController::class, 'generateVariants'])->middleware('permission:products.create');
    Route::put('/products/{id}/variants/{variantId}', [ProductAdminController::class, 'updateVariant'])->middleware('permission:products.update');
    Route::delete('/products/{id}/variants/{variantId}', [ProductAdminController::class, 'destroyVariant'])->middleware('permission:products.delete');

    // Admin Inventory APIs
    Route::get('/inventory', [InventoryController::class, 'index'])->middleware('permission:inventory.view');
    Route::get('/inventory/low-stock', [InventoryController::class, 'lowStock'])->middleware('permission:inventory.view');
    Route::get('/inventory/out-of-stock', [InventoryController::class, 'outOfStock'])->middleware('permission:inventory.view');
    Route::get('/inventory/history', [InventoryController::class, 'history'])->middleware('permission:inventory.view');
    Route::post('/inventory/{variantId}/adjust', [InventoryController::class, 'adjust'])->middleware('permission:inventory.update');

    // Admin Orders APIs
    Route::get('/orders', [OrderAdminController::class, 'index'])->middleware('permission:orders.view');
    Route::get('/orders/{id}', [OrderAdminController::class, 'show'])->middleware('permission:orders.view');
    Route::put('/orders/{id}/status', [OrderAdminController::class, 'updateStatus'])->middleware('permission:orders.update');
    Route::post('/orders/{id}/cancel', [OrderAdminController::class, 'cancel'])->middleware('permission:orders.cancel');
    Route::post('/orders/{id}/tracking', [OrderAdminController::class, 'tracking'])->middleware('permission:orders.update');
    Route::get('/orders/{id}/history', [OrderAdminController::class, 'history'])->middleware('permission:orders.view');

    // Admin Payment APIs
    Route::get('/payments', [PaymentAdminController::class, 'index'])->middleware('permission:orders.view');
    Route::get('/payments/{id}', [PaymentAdminController::class, 'show'])->middleware('permission:orders.view');
    Route::post('/payments/{id}/refund', [PaymentAdminController::class, 'refund'])->middleware('permission:orders.update');

    // Admin Coupons APIs (coupons.* permissions)
    Route::get('/coupons', [CouponAdminController::class, 'index'])->middleware('permission:coupons.view');
    Route::get('/coupons/analytics', [CouponAdminController::class, 'analytics'])->middleware('permission:coupons.view');
    Route::get('/coupons/{id}', [CouponAdminController::class, 'show'])->middleware('permission:coupons.view');
    Route::post('/coupons', [CouponAdminController::class, 'store'])->middleware('permission:coupons.create');
    Route::put('/coupons/{id}', [CouponAdminController::class, 'update'])->middleware('permission:coupons.update');
    Route::post('/coupons/{id}/toggle-status', [CouponAdminController::class, 'toggleStatus'])->middleware('permission:coupons.update');
    Route::delete('/coupons/{id}', [CouponAdminController::class, 'destroy'])->middleware('permission:coupons.delete');

    // Admin Offers APIs (offers.* permissions)
    Route::get('/offers', [OfferAdminController::class, 'index'])->middleware('permission:offers.view');
    Route::post('/offers', [OfferAdminController::class, 'store'])->middleware('permission:offers.create');
    Route::put('/offers/{id}', [OfferAdminController::class, 'update'])->middleware('permission:offers.update');
    Route::delete('/offers/{id}', [OfferAdminController::class, 'destroy'])->middleware('permission:offers.delete');

    // Admin Shipping APIs (settings.view & settings.update)
    Route::get('/shipping', [ShippingAdminController::class, 'index'])->middleware('permission:settings.view');
    Route::post('/shipping', [ShippingAdminController::class, 'store'])->middleware('permission:settings.update');
    Route::put('/shipping/{id}', [ShippingAdminController::class, 'update'])->middleware('permission:settings.update');
    Route::delete('/shipping/{id}', [ShippingAdminController::class, 'destroy'])->middleware('permission:settings.update');
    Route::get('/shipping-rules', [ShippingAdminController::class, 'index']);
    Route::post('/shipping-rules', [ShippingAdminController::class, 'store']);
    Route::delete('/shipping-rules/{id}', [ShippingAdminController::class, 'destroy']);
    Route::post('/policies/shipping', [ShippingAdminController::class, 'updatePolicy'])->middleware('permission:settings.update');
    Route::post('/shipping-fees', [ShippingAdminController::class, 'updateFees']);

    // Admin Shiprocket Shipping Rate Calculator & Shipment APIs
    Route::get('/shipping/shiprocket-test', [ShiprocketAdminController::class, 'testConnection']);
    Route::post('/shipping/rates/calculate', [ShiprocketAdminController::class, 'calculateRates']);
    Route::post('/orders/{id}/create-shipment', [ShiprocketAdminController::class, 'createShipment']);
    Route::get('/orders/{id}/track-shipment', [ShiprocketAdminController::class, 'trackShipment']);
    Route::post('/orders/{id}/cancel-shipment', [ShiprocketAdminController::class, 'cancelShipment']);
    Route::post('/shipping/orders/{id}/cancel-shipment', [ShiprocketAdminController::class, 'cancelShipment']);

    // Admin Returns APIs (orders.view & orders.update)
    Route::get('/returns', [ReturnAdminController::class, 'index'])->middleware('permission:orders.view');
    Route::get('/returns/{id}', [ReturnAdminController::class, 'show'])->middleware('permission:orders.view');
    Route::put('/returns/{id}/status', [ReturnAdminController::class, 'updateStatus'])->middleware('permission:orders.update');
    Route::post('/policies/return', [ReturnAdminController::class, 'updatePolicy'])->middleware('permission:settings.update');

    // Admin Tax APIs (settings.view & settings.update)
    Route::get('/tax', [TaxAdminController::class, 'index'])->middleware('permission:settings.view');
    Route::post('/tax', [TaxAdminController::class, 'store'])->middleware('permission:settings.update');
    Route::put('/tax/{id}', [TaxAdminController::class, 'update'])->middleware('permission:settings.update');
    Route::delete('/tax/{id}', [TaxAdminController::class, 'destroy'])->middleware('permission:settings.update');

    // Media Upload API
    Route::post('/media/upload', [MediaController::class, 'upload']);

    // Admin Settings & Branding
    Route::get('/settings', [CMSAdminController::class, 'getSettings'])->middleware('permission:settings.view');
    Route::post('/settings', [CMSAdminController::class, 'updateSettings'])->middleware('permission:settings.update');

    // Admin Hero Banners & Popups
    Route::get('/banners', [CMSAdminController::class, 'indexBanners'])->middleware('permission:banners.view');
    Route::post('/banners', [CMSAdminController::class, 'storeBanner'])->middleware('permission:banners.create');
    Route::put('/banners/{id}', [CMSAdminController::class, 'updateBanner'])->middleware('permission:banners.update');
    Route::delete('/banners/{id}', [CMSAdminController::class, 'destroyBanner'])->middleware('permission:banners.delete');

    Route::get('/popups', [CMSAdminController::class, 'indexPopups'])->middleware('permission:popups.view');
    Route::post('/popups', [CMSAdminController::class, 'storePopup'])->middleware('permission:popups.create');
    Route::put('/popups/{id}', [CMSAdminController::class, 'updatePopup'])->middleware('permission:popups.update');
    Route::delete('/popups/{id}', [CMSAdminController::class, 'destroyPopup'])->middleware('permission:popups.delete');

    // Admin Watch & Shop Reels
    Route::get('/watch-and-shop', [CMSAdminController::class, 'indexWatchAndShop']);
    Route::post('/watch-and-shop', [CMSAdminController::class, 'storeWatchAndShop']);
    Route::put('/watch-and-shop/{id}', [CMSAdminController::class, 'updateWatchAndShop']);
    Route::delete('/watch-and-shop/{id}', [CMSAdminController::class, 'destroyWatchAndShop']);

    // Admin Lifestyle Carousel Slides
    Route::get('/lifestyle-slides', [CMSAdminController::class, 'indexLifestyleSlides']);
    Route::post('/lifestyle-slides', [CMSAdminController::class, 'storeLifestyleSlide']);
    Route::put('/lifestyle-slides/{id}', [CMSAdminController::class, 'updateLifestyleSlide']);
    Route::delete('/lifestyle-slides/{id}', [CMSAdminController::class, 'destroyLifestyleSlide']);

    // Admin Customer Testimonials ("WHAT OUR CLIENTS SAY")
    Route::get('/testimonials', [CMSAdminController::class, 'indexTestimonials']);
    Route::post('/testimonials', [CMSAdminController::class, 'storeTestimonial']);
    Route::put('/testimonials/{id}', [CMSAdminController::class, 'updateTestimonial']);
    Route::delete('/testimonials/{id}', [CMSAdminController::class, 'destroyTestimonial']);

    // Admin Blog CMS APIs
    Route::prefix('blog')->group(function () {
        Route::get('/posts', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'index']);
        Route::post('/posts', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'store']);
        Route::get('/posts/{id}', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'show']);
        Route::put('/posts/{id}', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'update']);
        Route::delete('/posts/{id}', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'destroy']);

        Route::get('/categories', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'getCategories']);
        Route::post('/categories', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'storeCategory']);
        Route::put('/categories/{id}', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'destroyCategory']);

        Route::get('/tags', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'getTags']);
        Route::post('/tags', [\App\Http\Controllers\Api\V1\Admin\BlogAdminController::class, 'storeTag']);
    });

    // Admin Categories CRUD
    Route::get('/categories', [CategoryAdminController::class, 'index'])->middleware('permission:categories.view');
    Route::post('/categories', [CategoryAdminController::class, 'store'])->middleware('permission:categories.create');
    Route::put('/categories/{id}', [CategoryAdminController::class, 'update'])->middleware('permission:categories.update');
    Route::delete('/categories/{id}', [CategoryAdminController::class, 'destroy'])->middleware('permission:categories.delete');

    // Admin Collections CRUD
    Route::get('/collections', [CollectionAdminController::class, 'index']);
    Route::post('/collections', [CollectionAdminController::class, 'store']);
    Route::get('/collections/{id}', [CollectionAdminController::class, 'show']);
    Route::put('/collections/{id}', [CollectionAdminController::class, 'update']);
    Route::delete('/collections/{id}', [CollectionAdminController::class, 'destroy']);
    Route::post('/collections/{id}/products', [CollectionAdminController::class, 'syncProducts']);

    // Admin Products CRUD (update & delete)
    Route::put('/products/{id}', [ProductAdminController::class, 'update'])->middleware('permission:products.update');
    Route::delete('/products/{id}', [ProductAdminController::class, 'destroy'])->middleware('permission:products.delete');

    // Admin Reviews Moderation & Management
    Route::get('/reviews', [ReviewAdminController::class, 'index'])->middleware('permission:reviews.view');
    Route::post('/reviews', [ReviewAdminController::class, 'store']);
    Route::get('/reviews/{id}', [ReviewAdminController::class, 'show']);
    Route::put('/reviews/{id}', [ReviewAdminController::class, 'update']);
    Route::put('/reviews/{id}/status', [ReviewAdminController::class, 'updateStatus'])->middleware('permission:reviews.moderate');
    Route::delete('/reviews/{id}', [ReviewAdminController::class, 'destroy'])->middleware('permission:reviews.moderate');

    // Other Module Placeholders
    Route::get('/customers', [AdminModuleController::class, 'customers'])->middleware('permission:customers.view');
    Route::get('/homepage', [AdminModuleController::class, 'homepage'])->middleware('permission:homepage.view');
    Route::get('/reports', [AdminModuleController::class, 'reports'])->middleware('permission:reports.view');

    // Admin Email Notification Settings & Diagnostics
    Route::get('/settings/email-notifications', [EmailNotificationAdminController::class, 'index']);
    Route::put('/settings/email-notifications', [EmailNotificationAdminController::class, 'update']);
    Route::post('/settings/email-notifications/test', [EmailNotificationAdminController::class, 'testConnection']);

    // Admin Back-In-Stock & Abandoned Cart Reports & Reminders
    Route::get('/back-in-stock', [\App\Http\Controllers\Api\V1\BackInStockController::class, 'adminIndex']);
    Route::get('/abandoned-carts', [\App\Http\Controllers\Api\V1\AbandonedCartController::class, 'adminIndex']);
    Route::post('/abandoned-carts/{id}/send-reminder', [\App\Http\Controllers\Api\V1\AbandonedCartController::class, 'sendReminder']);

    // Admin Product Bundles CRUD
    Route::get('/bundles', [\App\Http\Controllers\Api\V1\Admin\BundleAdminController::class, 'index']);
    Route::post('/bundles', [\App\Http\Controllers\Api\V1\Admin\BundleAdminController::class, 'store']);
    Route::put('/bundles/{id}', [\App\Http\Controllers\Api\V1\Admin\BundleAdminController::class, 'update']);
    Route::delete('/bundles/{id}', [\App\Http\Controllers\Api\V1\Admin\BundleAdminController::class, 'destroy']);

    // Admin Customer Analytics APIs
    Route::prefix('analytics')->group(function () {
        Route::get('/overview', [AnalyticsAdminController::class, 'overview']);
        Route::get('/pages', [AnalyticsAdminController::class, 'pages']);
        Route::get('/pages/detail', [AnalyticsAdminController::class, 'pageDetail']);
        Route::get('/products', [AnalyticsAdminController::class, 'products']);
        Route::get('/collections', [AnalyticsAdminController::class, 'collections']);
        Route::get('/customer-journeys', [AnalyticsAdminController::class, 'customerJourneys']);
        Route::get('/traffic-sources', [AnalyticsAdminController::class, 'trafficSources']);
        Route::get('/landing-pages', [AnalyticsAdminController::class, 'landingPages']);
        Route::get('/search', [AnalyticsAdminController::class, 'search']);
        Route::get('/checkout-funnel', [AnalyticsAdminController::class, 'checkoutFunnel']);
        Route::get('/realtime', [AnalyticsAdminController::class, 'realtime']);
        Route::get('/devices', [AnalyticsAdminController::class, 'devices']);
    });
});
