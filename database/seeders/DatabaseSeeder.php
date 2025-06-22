<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            FacilitySeeder::class,
            RoomSeeder::class,
            BookmarkSeeder::class,
            AppointmentSeeder::class,
            PaymentSeeder::class,
            ReviewSeeder::class,
        ]);
    }
}