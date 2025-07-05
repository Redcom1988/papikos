<?php
// File: database/migrations/0000_00_00_000015_create_reports_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporter_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['inappropriate_content', 'fake_listing', 'fraud', 'safety_concern', 'other']);
            $table->text('description');
            $table->enum('status', ['pending', 'investigating', 'resolved', 'dismissed'])->default('pending');
            $table->text('admin_notes')->nullable();
            
            // Owner response fields
            $table->text('owner_response')->nullable();
            $table->enum('owner_response_action', ['issue_resolved', 'listing_updated', 'additional_info', 'dispute'])->nullable();
            $table->timestamp('owner_responded_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};