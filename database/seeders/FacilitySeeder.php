<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            ['name' => 'WiFi', 'description' => 'High-speed internet connection'],
            ['name' => 'AC', 'description' => 'Air conditioning'],
            ['name' => 'Free Listrik', 'description' => 'Free electricity'],
            ['name' => 'Free Air', 'description' => 'Free water'],
            ['name' => 'Tukang sampah mingguan', 'description' => 'Weekly garbage collection'],
            ['name' => 'Laundry', 'description' => 'Laundry service'],
            ['name' => 'Bed', 'description' => 'Comfortable bed'],
            ['name' => 'Desk', 'description' => 'Study/work desk'],
            ['name' => 'Chair', 'description' => 'Comfortable chair'],
            ['name' => 'Wardrobe', 'description' => 'Storage wardrobe'],
            ['name' => 'Private Bathroom', 'description' => 'En-suite bathroom'],
            ['name' => 'Shared Kitchen', 'description' => 'Common kitchen area'],
            ['name' => 'Parking', 'description' => 'Vehicle parking space'],
            ['name' => 'Security', 'description' => '24/7 security'],
        ];

        foreach ($facilities as $facility) {
            Facility::firstOrCreate(['name' => $facility['name']], $facility);
        }
    }
}