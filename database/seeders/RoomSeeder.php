<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\RoomFacility;
use App\Models\RoomImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $owners = User::where('is_owner', true)->get();

        foreach ($owners as $owner) {
            // Create 1-3 rooms per owner
            $roomCount = rand(1, 3);
            
            for ($i = 0; $i < $roomCount; $i++) {
                $room = Room::create([
                    'owner_id' => $owner->id,
                    'name' => fake()->words(3, true) . ' Room',
                    'description' => fake()->paragraphs(3, true),
                    'address' => fake()->address(),
                    'price' => rand(500000, 2000000), // Rp 500k - 2M
                    'size' => rand(15, 50), // 15-50 sqm
                    'max_occupancy' => rand(1, 4),
                    'is_available' => rand(0, 10) > 1, // 90% available
                ]);

                // Add facilities
                $facilities = ['WiFi', 'AC', 'Private Bathroom', 'Wardrobe', 'Desk', 'Chair', 'Bed'];
                $selectedFacilities = fake()->randomElements($facilities, rand(3, 6));
                
                foreach ($selectedFacilities as $facility) {
                    RoomFacility::create([
                        'room_id' => $room->id,
                        'name' => $facility,
                        'description' => "High quality $facility available",
                    ]);
                }

                // Add images
                RoomImage::create([
                    'room_id' => $room->id,
                    'url' => 'https://picsum.photos/800/600?random=' . ($room->id * 10 + 1),
                    'caption' => 'Main room view',
                    'is_primary' => true,
                ]);

                for ($j = 2; $j <= rand(2, 5); $j++) {
                    RoomImage::create([
                        'room_id' => $room->id,
                        'url' => 'https://picsum.photos/800/600?random=' . ($room->id * 10 + $j),
                        'caption' => fake()->sentence(3),
                        'is_primary' => false,
                    ]);
                }
            }
        }
    }
}