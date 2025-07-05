<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::create([
            'name' => 'System Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567890',
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        // Create test owner
        User::create([
            'name' => 'Property Owner',
            'email' => 'owner@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567891',
            'role' => 'owner',
            'email_verified_at' => now(),
        ]);

        // Create test renter
        User::create([
            'name' => 'John Renter',
            'email' => 'renter@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567892',
            'role' => 'renter',
            'email_verified_at' => now(),
        ]);

        // Create more random users
        User::factory(10)->create(['role' => 'renter']);
        User::factory(5)->create(['role' => 'owner']);
    }
}