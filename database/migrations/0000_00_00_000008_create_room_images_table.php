<?php
// File: database/migrations/0000_00_00_000007_create_room_images_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->string('url');
            $table->string('caption')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            
            $table->index(['room_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_images');
    }
};
