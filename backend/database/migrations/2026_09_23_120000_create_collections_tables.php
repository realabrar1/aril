<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (!Schema::hasTable('collections')) {
            Schema::create('collections', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->string('slug')->unique();
                $table->text('description')->nullable();
                $table->string('image_url', 500)->nullable();
                $table->string('banner_url', 500)->nullable();
                $table->string('seo_title')->nullable();
                $table->text('seo_description')->nullable();
                $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        } else {
            Schema::table('collections', function (Blueprint $table) {
                if (!Schema::hasColumn('collections', 'image_url')) {
                    $table->string('image_url', 500)->nullable()->after('description');
                }
                if (!Schema::hasColumn('collections', 'seo_title')) {
                    $table->string('seo_title')->nullable()->after('banner_url');
                }
                if (!Schema::hasColumn('collections', 'seo_description')) {
                    $table->text('seo_description')->nullable()->after('seo_title');
                }
                if (!Schema::hasColumn('collections', 'sort_order')) {
                    $table->integer('sort_order')->default(0)->after('status');
                }
            });
        }

        if (!Schema::hasTable('collection_product')) {
            Schema::create('collection_product', function (Blueprint $table) {
                $table->id();
                $table->foreignId('collection_id')->constrained('collections')->onDelete('cascade');
                $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
                $table->integer('sort_order')->default(0);
                $table->timestamps();

                $table->unique(['collection_id', 'product_id']);
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('collection_product');
    }
};
