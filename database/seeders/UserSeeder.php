<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create test owner
        $owner = User::create([
            'name' => 'Admin Owner',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567891',
            'is_owner' => true,
            'email_verified_at' => now(),
        ]);

        // Create test renter
        User::create([
            'name' => 'John Renter',
            'email' => 'renter@example.com',
            'password' => Hash::make('password'),
            'phone' => '081234567892',
            'is_owner' => false,
            'email_verified_at' => now(),
        ]);

        // Create more random users
        User::factory(10)->create(['is_owner' => false]);
        User::factory(10)->create(['is_owner' => true]);
    }
}