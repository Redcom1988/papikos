<?php

namespace Database\Seeders;

use App\Models\Facility;
use Illuminate\Database\Seeder;

class FacilitySeeder extends Seeder
{
    public function run(): void
    {
        $facilities = [
            ['name' => 'WiFi', 'description' => 'High-speed wireless internet'],
            ['name' => 'Air Conditioning', 'description' => 'Room with air conditioning'],
            ['name' => 'Electricity Included', 'description' => 'Electricity costs included in rent'],
            ['name' => 'Water Included', 'description' => 'Water costs included in rent'],
            ['name' => 'Weekly Trash Collection', 'description' => 'Trash collected weekly'],
            ['name' => 'Laundry Service', 'description' => 'Laundry service available'],
            ['name' => 'Bed', 'description' => 'Comfortable single or double bed'],
            ['name' => 'Desk', 'description' => 'Desk for study or work'],
            ['name' => 'Chair', 'description' => 'Comfortable chair'],
            ['name' => 'Wardrobe', 'description' => 'Wardrobe for clothes storage'],
            ['name' => 'Private Bathroom', 'description' => 'Bathroom inside the room'],
            ['name' => 'Shared Kitchen', 'description' => 'Access to a shared kitchen'],
            ['name' => 'Parking', 'description' => 'Parking space for vehicles'],
            ['name' => '24/7 Security', 'description' => 'Security available at all times'],
            ['name' => 'CCTV', 'description' => 'Closed-circuit television for security'],
            ['name' => 'Balcony', 'description' => 'Private balcony attached to the room'],
            ['name' => 'Hot Water', 'description' => 'Hot water available in the bathroom'],
            ['name' => 'Refrigerator', 'description' => 'Personal or shared refrigerator'],
            ['name' => 'TV', 'description' => 'Television in the room or shared area'],
            ['name' => 'Pet Friendly', 'description' => 'Pets are allowed in the property'],
            ['name' => 'Smoking Area', 'description' => 'Designated smoking area'],
            ['name' => 'Shared Living Room', 'description' => 'Common living room for tenants'],
        ];

        foreach ($facilities as $facility) {
            Facility::firstOrCreate(['name' => $facility['name']], $facility);
        }
    }
}