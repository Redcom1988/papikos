<?php
// 2024_01_01_000005_create_room_images_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('room_images', function (Blueprint $table) {
            $table->id('image_id');
            $table->unsignedBigInteger('room_id');
            $table->string('image_url');
            $table->string('caption')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamp('uploaded_at')->useCurrent();
            
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            $table->index('room_id');
            $table->index('is_primary');
        });
    }

    public function down()
    {
        Schema::dropIfExists('room_images');
    }
};
