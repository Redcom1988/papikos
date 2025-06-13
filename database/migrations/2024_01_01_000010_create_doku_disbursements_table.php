<?php
// 2024_01_01_000010_create_doku_disbursements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('doku_disbursements', function (Blueprint $table) {
            $table->id('disbursement_id');
            $table->unsignedBigInteger('payment_id');
            $table->unsignedBigInteger('owner_id');
            $table->unsignedBigInteger('payout_method_id');
            $table->integer('transfer_amount');
            $table->string('doku_disburse_id')->nullable();
            $table->enum('disbursement_status', ['pending', 'processing', 'completed', 'failed'])->default('pending');
            $table->dateTime('disbursement_date')->nullable();
            $table->text('failure_reason')->nullable();
            $table->integer('retry_count')->default(0);
            $table->timestamps();
            
            $table->foreign('payment_id')->references('payment_id')->on('payments')->onDelete('cascade');
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('payout_method_id')->references('payout_method_id')->on('owner_payout_methods')->onDelete('cascade');
            $table->index('payment_id');
            $table->index('owner_id');
            $table->index('disbursement_status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('doku_disbursements');
    }
};