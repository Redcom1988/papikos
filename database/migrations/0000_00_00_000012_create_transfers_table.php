<?php
// File: database/migrations/0000_00_00_000012_create_transfers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->foreignId('payout_method_id')->constrained()->onDelete('cascade');
            $table->integer('amount');
            $table->string('reference_id')->nullable(); // external transfer reference
            $table->enum('status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
            
            $table->index(['payment_id', 'status']);
            $table->index('reference_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};