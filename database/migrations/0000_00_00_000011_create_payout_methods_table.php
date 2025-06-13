<?php
// File: database/migrations/0000_00_00_000011_create_payout_methods_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['ovo', 'dana', 'gopay', 'shopeepay', 'bank']);
            $table->string('account_identifier'); // phone number or account number
            $table->string('account_name');
            $table->string('bank_code')->nullable(); // for bank transfers
            $table->boolean('is_primary')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['owner_id', 'is_primary']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_methods');
    }
};