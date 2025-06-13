<?php
// 2024_01_01_000013_create_review_images_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('review_images', function (Blueprint $table) {
            $table->id('image_id');
            $table->unsignedBigInteger('review_id');
            $table->string('image_url');
            $table->timestamp('uploaded_at')->useCurrent();
            
            $table->foreign('review_id')->references('review_id')->on('reviews')->onDelete('cascade');
            $table->index('review_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('review_images');
    }
};
