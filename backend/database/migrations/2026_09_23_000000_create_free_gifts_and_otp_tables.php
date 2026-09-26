<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Free Gift Campaigns Table
        if (!Schema::hasTable('free_gift_campaigns')) {
            Schema::create('free_gift_campaigns', function (Blueprint $table) {
                $table->id();
                $table->string('name')->default('Free Gift Offer');
                $table->text('description')->nullable();
                $table->decimal('min_order_amount', 12, 2)->default(500.00);
                $table->boolean('online_payment_eligible')->default(true);
                $table->boolean('cod_eligible_above_threshold')->default(true);
                $table->integer('max_gifts_per_order')->default(1);
                $table->timestamp('start_at')->nullable();
                $table->timestamp('end_at')->nullable();
                $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
                $table->timestamps();
            });
        }

        // 2. Free Gift Items Table
        if (!Schema::hasTable('free_gift_items')) {
            Schema::create('free_gift_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('campaign_id')->nullable()->constrained('free_gift_campaigns')->nullOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
                $table->string('gift_title')->nullable();
                $table->text('description')->nullable();
                $table->string('display_image_url', 500)->nullable();
                $table->integer('gift_stock')->default(100);
                $table->integer('claimed_count')->default(0);
                $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE');
                $table->timestamps();

                $table->index(['product_id', 'status']);
            });
        }

        // 3. Passwordless OTP Table
        if (!Schema::hasTable('otps')) {
            Schema::create('otps', function (Blueprint $table) {
                $table->id();
                $table->string('identifier', 255)->index(); // Phone or Email
                $table->string('otp_hash');
                $table->timestamp('expires_at');
                $table->integer('attempts_count')->default(0);
                $table->timestamp('last_sent_at')->useCurrent();
                $table->timestamps();
            });
        }

        // 4. Add is_free_gift to order_items & cart_items
        if (Schema::hasTable('order_items') && !Schema::hasColumn('order_items', 'is_free_gift')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->boolean('is_free_gift')->default(false)->after('discount_amount');
            });
        }

        if (Schema::hasTable('cart_items') && !Schema::hasColumn('cart_items', 'is_free_gift')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->boolean('is_free_gift')->default(false)->after('quantity');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('order_items') && Schema::hasColumn('order_items', 'is_free_gift')) {
            Schema::table('order_items', function (Blueprint $table) {
                $table->dropColumn('is_free_gift');
            });
        }

        if (Schema::hasTable('cart_items') && Schema::hasColumn('cart_items', 'is_free_gift')) {
            Schema::table('cart_items', function (Blueprint $table) {
                $table->dropColumn('is_free_gift');
            });
        }

        Schema::dropIfExists('otps');
        Schema::dropIfExists('free_gift_items');
        Schema::dropIfExists('free_gift_campaigns');
    }
};
