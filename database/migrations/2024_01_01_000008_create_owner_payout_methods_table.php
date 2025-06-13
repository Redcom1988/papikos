<?php
// 2024_01_01_000008_create_owner_payout_methods_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('owner_payout_methods', function (Blueprint $table) {
            $table->id('payout_method_id');
            $table->unsignedBigInteger('owner_id');
            $table->enum('method_type', ['bank_account', 'dana', 'ovo', 'gopay', 'shopeepay', 'doku_wallet']);
            $table->string('account_number');
            $table->string('account_name');
            $table->string('bank_code')->nullable();
            $table->string('ovo_phone_number')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
            
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('owner_id');
            $table->index('is_primary');
        });
    }

    public function down()
    {
        Schema::dropIfExists('owner_payout_methods');
    }
};