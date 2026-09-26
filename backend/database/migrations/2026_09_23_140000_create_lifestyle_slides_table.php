<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lifestyle_slides')) {
            Schema::create('lifestyle_slides', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('subtitle')->nullable();
                $table->text('image_url');
                $table->string('link_url')->default('/shop');
                $table->integer('sort_order')->default(0);
                $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
                $table->timestamps();
            });

            // Seed default Palmonas-style lifestyle slides
            DB::table('lifestyle_slides')->insert([
                [
                    'title' => 'DAILY WEAR',
                    'subtitle' => 'Everyday Anti-Tarnish Essentials',
                    'image_url' => 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=1000&auto=format&fit=crop',
                    'link_url' => '/collections/chains',
                    'sort_order' => 1,
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'title' => 'OFFICE WEAR',
                    'subtitle' => 'Sleek Minimalist Elegance',
                    'image_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1000&auto=format&fit=crop',
                    'link_url' => '/collections/rings',
                    'sort_order' => 2,
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'title' => 'PARTY WEAR',
                    'subtitle' => 'Statement Glamour & Pearl Edits',
                    'image_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000&auto=format&fit=crop',
                    'link_url' => '/collections/earrings',
                    'sort_order' => 3,
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'title' => 'WEDDING WEAR',
                    'subtitle' => 'Royal Heritage Kundan & Bridal',
                    'image_url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1000&auto=format&fit=crop',
                    'link_url' => '/collections/diwali',
                    'sort_order' => 4,
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'title' => 'VACATION WEAR',
                    'subtitle' => 'Golden Hour Charms & Cuffs',
                    'image_url' => 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop',
                    'link_url' => '/collections/bracelets',
                    'sort_order' => 5,
                    'status' => 'ACTIVE',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lifestyle_slides');
    }
};
