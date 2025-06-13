<?php
// 2024_01_01_000001_create_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id(); // Laravel's default id column (works as user_id)
            $table->string('name'); // Laravel's default name field
            $table->string('username')->unique()->nullable(); // Your custom username field
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable(); // Laravel's email verification
            $table->string('password'); // Laravel's default password field
            $table->string('phone_number')->nullable(); // Your custom field
            $table->string('full_name')->nullable(); // Your custom field (can use 'name' as fallback)
            $table->boolean('is_owner')->default(false); // Your custom field
            $table->rememberToken(); // Laravel's remember token for "remember me"
            $table->timestamps();
        });

        // Laravel's password reset functionality
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        // Laravel's session management
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};