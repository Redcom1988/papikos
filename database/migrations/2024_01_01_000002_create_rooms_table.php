// 2024_01_01_000002_create_rooms_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id('room_id');
            $table->unsignedBigInteger('owner_id');
            $table->string('name');
            $table->text('description');
            $table->text('address');
            $table->text('map_link');
            $table->integer('price');
            $table->integer('size');
            $table->boolean('is_available')->default(true);
            $table->timestamp('availability_updated_at')->nullable();
            $table->integer('max_occupancy');
            $table->timestamps();
            
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('cascade');
            $table->index('owner_id');
            $table->index('is_available');
        });
    }

    public function down()
    {
        Schema::dropIfExists('rooms');
    }
};

<?php
// 2024_01_01_000003_create_room_facilities_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('room_facilities', function (Blueprint $table) {
            $table->id('facility_id');
            $table->unsignedBigInteger('room_id');
            $table->string('facility_name');
            $table->text('description')->nullable();
            
            $table->foreign('room_id')->references('room_id')->on('rooms')->onDelete('cascade');
            $table->index('room_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('room_facilities');
    }
};