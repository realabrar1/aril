<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'rating')) {
                $table->decimal('rating', 3, 2)->default(0.00)->after('status');
            }
            if (!Schema::hasColumn('products', 'review_count')) {
                $table->unsignedInteger('review_count')->default(0)->after('rating');
            }
        });

        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'order_id')) {
                $table->foreignId('order_id')->nullable()->after('user_id')->constrained('orders')->onDelete('set null');
            }
            if (!Schema::hasColumn('reviews', 'reviewer_name')) {
                $table->string('reviewer_name')->nullable()->after('order_item_id');
            }
            if (!Schema::hasColumn('reviews', 'is_verified_purchase')) {
                $table->boolean('is_verified_purchase')->default(false)->after('comment');
            }
        });

        // Make user_id nullable for admin created reviews if needed
        try {
            DB::statement('ALTER TABLE reviews MODIFY user_id BIGINT UNSIGNED NULL;');
        } catch (\Throwable $e) {
            // Ignore if already nullable
        }
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'is_verified_purchase')) {
                $table->dropColumn('is_verified_purchase');
            }
            if (Schema::hasColumn('reviews', 'reviewer_name')) {
                $table->dropColumn('reviewer_name');
            }
            if (Schema::hasColumn('reviews', 'order_id')) {
                $table->dropForeign(['order_id']);
                $table->dropColumn('order_id');
            }
        });

        Schema::table('products', function (Blueprint $table) {
            if (Schema::hasColumn('products', 'review_count')) {
                $table->dropColumn('review_count');
            }
            if (Schema::hasColumn('products', 'rating')) {
                $table->dropColumn('rating');
            }
        });
    }
};
