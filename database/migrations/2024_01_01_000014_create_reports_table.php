<?php
// 2024_01_01_000014_create_reports_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id('report_id');
            $table->unsignedBigInteger('reporter_id');
            $table->unsignedBigInteger('room_id');
            $table->unsignedBigInteger('reported_owner_id')->nullable();
            $table->enum('report_type', ['inappropriate_content', 'fake_listing', 'spam', 'fraud', 'safety_concern', 'other']);
            $table->text('description');
            $table->enum('status', ['pending', 'under_review', 'resolved', 'dismissed'])->default('pending');
            $table->text('admin_notes')->nullable();
            $table->timestamps();
            
            $table->foreign('reporter_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            $table->foreign('reported_owner_id')->references('id')->on('users')->onDelete('set null');
            $table->index('reporter_id');
            $table->index('room_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reports');
    }
};