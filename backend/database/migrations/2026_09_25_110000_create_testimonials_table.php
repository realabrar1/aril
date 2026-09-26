<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('testimonials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('quote');
            $table->string('verified')->default('Verified Buyer');
            $table->integer('rating')->default(5);
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['ACTIVE', 'DISABLED'])->default('ACTIVE');
            $table->timestamps();
        });

        // Seed initial homepage testimonials
        DB::table('testimonials')->insert([
            [
                'name' => 'Ananya R.',
                'quote' => 'The design, quality, and anti-tarnish finish are incredible. ARILHA is my go-to jewellery brand now!',
                'verified' => 'Verified Buyer',
                'rating' => 5,
                'sort_order' => 1,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Priya S.',
                'quote' => 'Beautiful Kundan choker set and fast delivery. Loved the piece I ordered for my sister\'s wedding!',
                'verified' => 'Verified Buyer',
                'rating' => 5,
                'sort_order' => 2,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Neha K.',
                'quote' => 'Chic everyday jewellery by Irsa Khan at such accessible prices. Highly recommended!',
                'verified' => 'Verified Buyer',
                'rating' => 5,
                'sort_order' => 3,
                'status' => 'ACTIVE',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('testimonials');
    }
};
