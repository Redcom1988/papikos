<?php
// File: database/migrations/0000_00_00_000013_create_reviews_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->decimal('cleanliness_rating', 2, 1); // 1.0 to 5.0
            $table->decimal('security_rating', 2, 1);
            $table->decimal('comfort_rating', 2, 1);
            $table->decimal('value_rating', 2, 1);
            $table->decimal('overall_rating', 2, 1); // calculated average
            $table->text('comment')->nullable();
            $table->timestamps();
            
            $table->unique('payment_id'); // one review per payment
            $table->index(['room_id', 'overall_rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};