<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Back In Stock Subscriptions
        if (!Schema::hasTable('back_in_stock_subscriptions')) {
            Schema::create('back_in_stock_subscriptions', function (Blueprint $table) {
                $table->id();
                $table->string('email', 255)->index();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
                $table->enum('status', ['PENDING', 'NOTIFIED', 'UNSUBSCRIBED'])->default('PENDING')->index();
                $table->timestamp('notified_at')->nullable();
                $table->timestamps();

                $table->unique(['email', 'product_id', 'status'], 'bis_email_product_status_unique');
            });
        }

        // 2. Abandoned Carts Tracker
        if (!Schema::hasTable('abandoned_carts')) {
            Schema::create('abandoned_carts', function (Blueprint $table) {
                $table->id();
                $table->foreignId('cart_id')->nullable()->constrained('carts')->nullOnDelete();
                $table->string('guest_session_id', 255)->nullable()->index();
                $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->string('email', 255)->index();
                $table->string('phone', 50)->nullable();
                $table->json('cart_data')->nullable();
                $table->decimal('subtotal', 12, 2)->default(0.00);
                $table->enum('reminder_status', ['PENDING', 'SENT', 'CONVERTED', 'EXPIRED'])->default('PENDING')->index();
                $table->timestamp('reminder_sent_at')->nullable();
                $table->string('recovery_token', 100)->unique();
                $table->timestamps();
            });
        }

        // 3. Product Bundles Table
        if (!Schema::hasTable('product_bundles')) {
            Schema::create('product_bundles', function (Blueprint $table) {
                $table->id();
                $table->string('name', 255);
                $table->string('slug', 255)->unique();
                $table->text('description')->nullable();
                $table->string('image_url', 500)->nullable();
                $table->decimal('original_total_price', 12, 2)->default(0.00);
                $table->decimal('bundle_price', 12, 2)->default(0.00);
                $table->decimal('savings_amount', 12, 2)->default(0.00);
                $table->timestamp('start_at')->nullable();
                $table->timestamp('end_at')->nullable();
                $table->integer('priority')->default(0);
                $table->enum('status', ['ACTIVE', 'INACTIVE'])->default('ACTIVE')->index();
                $table->timestamps();
            });
        }

        // 4. Product Bundle Items Table
        if (!Schema::hasTable('product_bundle_items')) {
            Schema::create('product_bundle_items', function (Blueprint $table) {
                $table->id();
                $table->foreignId('bundle_id')->constrained('product_bundles')->cascadeOnDelete();
                $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
                $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
                $table->integer('quantity')->default(1);
                $table->decimal('unit_price', 12, 2)->default(0.00);
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_bundle_items');
        Schema::dropIfExists('product_bundles');
        Schema::dropIfExists('abandoned_carts');
        Schema::dropIfExists('back_in_stock_subscriptions');
    }
};
