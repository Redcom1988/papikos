<?php
// File: database/migrations/0000_00_00_000005_create_rooms_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->text('address');
            $table->text('embedded_map_link')->nullable(); // for embedding maps
            $table->integer('price'); // in cents
            $table->integer('size')->nullable(); // in sqm
            $table->integer('max_occupancy')->default(1);
            $table->boolean('is_available')->default(true);

            $table->json('available_tour_times')->nullable(); // null = tours disabled
            $table->integer('max_advance_days')->default(2);

            $table->timestamps();
            
            $table->index(['is_available', 'price']);
            $table->index('owner_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rooms');
    }
};