<?php
// 2024_01_01_000011_create_doku_api_logs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('doku_api_logs', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('reference_id');
            $table->enum('reference_type', ['payment', 'disbursement']);
            $table->string('api_endpoint');
            $table->longText('request_payload');
            $table->longText('response_payload');
            $table->integer('api_status_code');
            $table->timestamp('created_at')->useCurrent();
            
            $table->index(['reference_id', 'reference_type']);
            $table->index('created_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('doku_api_logs');
    }
};
