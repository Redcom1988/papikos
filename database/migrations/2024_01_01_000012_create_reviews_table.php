<?php
// 2024_01_01_000012_create_reviews_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id('review_id');
            $table->unsignedBigInteger('room_id');
            $table->unsignedBigInteger('payment_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('cleanliness_rating', 3, 2);
            $table->decimal('security_rating', 3, 2);
            $table->decimal('comfort_rating', 3, 2);
            $table->decimal('value_rating', 3, 2);
            $table->decimal('overall_rating', 3, 2);
            $table->text('comment')->nullable();
            $table->dateTime('review_date');
            $table->boolean('is_verified')->default(true);
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            $table->foreign('payment_id')->references('payment_id')->on('payments')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('room_id');
            $table->index('user_id');
            $table->unique('payment_id'); // One review per payment
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
};