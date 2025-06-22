<?php
// File: database/migrations/0000_00_00_000010_create_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // renter
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade'); // room owner
            $table->foreignId('room_id')->constrained()->onDelete('cascade');
            $table->integer('amount'); // total amount paid by user
            $table->integer('platform_fee'); // your commission
            $table->integer('owner_amount'); // amount - platform_fee
            
            // DOKU Payment (User -> Platform)
            $table->string('doku_invoice_id')->nullable();
            $table->string('doku_transaction_id')->nullable();
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending');
            $table->timestamp('paid_at')->nullable();
            
            // Transfer to Owner Status
            $table->enum('transfer_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->timestamp('transferred_at')->nullable();
            
            $table->timestamps();
            
            $table->index(['user_id', 'payment_status']);
            $table->index(['owner_id', 'transfer_status']);
            $table->index('doku_invoice_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};