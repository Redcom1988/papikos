<?php
// 2024_01_01_000006_create_bookmarks_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('bookmarks', function (Blueprint $table) {
            $table->id('bookmark_id');
            $table->unsignedBigInteger('room_id');
            $table->unsignedBigInteger('user_id');
            $table->timestamp('created_at')->useCurrent();
            
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['room_id', 'user_id']);
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('bookmarks');
    }
};