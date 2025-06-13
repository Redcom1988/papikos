<?php
// 2024_01_01_000004_create_room_rules_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('room_rules', function (Blueprint $table) {
            $table->id('rule_id');
            $table->unsignedBigInteger('room_id');
            $table->text('rule_description');
            
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            $table->index('room_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('room_rules');
    }
};