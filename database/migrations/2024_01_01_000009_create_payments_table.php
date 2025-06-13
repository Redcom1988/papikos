<?php
// 2024_01_01_000009_create_payments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id('payment_id');
            $table->unsignedBigInteger('owner_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('room_id');
            $table->integer('amount');
            $table->integer('platform_fee');
            $table->integer('owner_profit');
            $table->string('doku_invoice_id');
            $table->string('doku_transaction_id')->nullable();
            $table->enum('payment_status', ['pending', 'completed', 'failed', 'refunded'])->default('pending');
            $table->dateTime('payment_date')->nullable();
            $table->enum('settlement_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->timestamps();
            
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            $table->index('owner_id');
            $table->index('user_id');
            $table->index('room_id');
            $table->index('payment_status');
            $table->index('settlement_status');
            $table->unique('doku_invoice_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('payments');
    }
};