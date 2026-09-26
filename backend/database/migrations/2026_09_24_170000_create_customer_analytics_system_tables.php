<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for Customer Analytics Module.
     */
    public function up(): void
    {
        // 1. Sessions Table
        Schema::create('analytics_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 100)->index();
            $table->string('visitor_id', 100)->index();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('landing_page', 500)->nullable();
            $table->string('exit_page', 500)->nullable();
            $table->text('referrer_url')->nullable();
            $table->string('traffic_source', 100)->default('Direct')->index();
            $table->string('traffic_medium', 100)->nullable();
            $table->string('campaign', 150)->nullable();
            $table->string('utm_source', 100)->nullable();
            $table->string('utm_medium', 100)->nullable();
            $table->string('utm_campaign', 100)->nullable();
            $table->string('utm_term', 100)->nullable();
            $table->string('utm_content', 100)->nullable();
            $table->string('device_type', 50)->default('Desktop');
            $table->string('browser', 50)->nullable();
            $table->string('os', 50)->nullable();
            $table->string('screen_size', 50)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->integer('total_page_views')->default(1);
            $table->integer('total_active_seconds')->default(0);
            $table->boolean('has_add_to_cart')->default(false);
            $table->boolean('has_checkout')->default(false);
            $table->boolean('has_purchased')->default(false);
            $table->timestamp('last_active_at')->nullable();
            $table->timestamps();
        });

        // 2. Page Views Table
        Schema::create('analytics_page_views', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 100)->index();
            $table->string('visitor_id', 100)->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('page_url', 500)->index();
            $table->string('route_name', 100)->nullable();
            $table->string('page_title', 255)->nullable();
            $table->string('page_type', 50)->default('other')->index();
            $table->unsignedBigInteger('product_id')->nullable()->index();
            $table->unsignedBigInteger('collection_id')->nullable()->index();
            $table->unsignedBigInteger('category_id')->nullable()->index();
            $table->string('referrer_url', 500)->nullable();
            $table->integer('active_time_seconds')->default(0);
            $table->integer('max_scroll_percentage')->default(0);
            $table->boolean('is_entry_page')->default(false);
            $table->boolean('is_exit_page')->default(false);
            $table->timestamp('created_at')->useCurrent()->index();
        });

        // 3. Analytics Events Table
        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 100)->index();
            $table->string('visitor_id', 100)->index();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('event_name', 100)->index();
            $table->string('page_url', 500)->nullable();
            $table->unsignedBigInteger('product_id')->nullable()->index();
            $table->unsignedBigInteger('collection_id')->nullable()->index();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent()->index();
        });

        // 4. Analytics Search Queries Table
        Schema::create('analytics_searches', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 100)->index();
            $table->string('visitor_id', 100)->index();
            $table->string('search_query', 255)->index();
            $table->integer('results_count')->default(0);
            $table->unsignedBigInteger('clicked_product_id')->nullable();
            $table->boolean('added_to_cart')->default(false);
            $table->boolean('purchased')->default(false);
            $table->timestamp('created_at')->useCurrent()->index();
        });

        // 5. Daily Aggregation Stats Table
        Schema::create('analytics_daily_stats', function (Blueprint $table) {
            $table->id();
            $table->date('stat_date')->index();
            $table->string('page_type', 50)->nullable()->index();
            $table->string('page_url', 500)->nullable()->index();
            $table->unsignedBigInteger('product_id')->nullable()->index();
            $table->unsignedBigInteger('collection_id')->nullable()->index();
            $table->integer('page_views')->default(0);
            $table->integer('unique_visitors')->default(0);
            $table->integer('total_sessions')->default(0);
            $table->integer('avg_active_seconds')->default(0);
            $table->integer('avg_scroll_percentage')->default(0);
            $table->integer('add_to_cart_count')->default(0);
            $table->integer('purchases_count')->default(0);
            $table->decimal('total_revenue', 12, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('analytics_daily_stats');
        Schema::dropIfExists('analytics_searches');
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('analytics_page_views');
        Schema::dropIfExists('analytics_sessions');
    }
};
