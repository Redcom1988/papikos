<?php
// File: database/migrations/0000_00_00_000006_create_room_facilities_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->foreignId('facility_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // Ensure unique combinations
            $table->unique(['room_id', 'facility_id']);
            $table->index(['room_id']);
            $table->index(['facility_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_facilities');
    }
};