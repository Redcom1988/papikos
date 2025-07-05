<?php

namespace Database\Seeders;

use App\Models\Room;
use App\Models\Facility;
use App\Models\RoomImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class RoomSeeder extends Seeder
{
    public function run(): void
    {
        $owners = User::where('role', 'owner')->get();

        // If no owners exist, create a sample owner
        if ($owners->isEmpty()) {
            $owner = User::create([
                'name' => 'Sample Owner',
                'email' => 'owner@example.com',
                'password' => bcrypt('password'),
                'role' => 'owner',
            ]);
            $owners = collect([$owner]);
        }

        // More normal room names
        $roomNames = [
            'Putri Asrama',
            'Wisma Melati',
            'Kos Mawar',
            'Rumah Kost Sejahtera',
            'Kos Anggrek',
            'Wisma Budi',
            'Kos Flamboyan',
            'Griya Mahasiswa',
            'Kos Permata',
            'Wisma Indah',
            'Kos Harmoni',
            'Rumah Singgah',
            'Kos Bahagia',
            'Wisma Santai',
            'Kos Damai',
            'Griya Asri',
            'Kos Mutiara',
            'Wisma Sejati',
            'Kos Berkah',
            'Rumah Kost Nyaman'
        ];

        // Sample Google Maps embed links for different areas
        $sampleMapLinks = [
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.7468!2d106.8449!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNTAnNDEuNyJF!5e0!3m2!1sen!2sid!4v1234567890',
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.5266!2d106.8167!3d-6.1751!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTAnMzAuNCJTIDEwNsKwNDknMDAuMSJF!5e0!3m2!1sen!2sid!4v1234567891',
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.9876!2d106.8567!3d-6.1943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTEnMzkuNSJTIDEwNsKwNTEnMjQuMSJF!5e0!3m2!1sen!2sid!4v1234567892',
            'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.1234!2d106.7895!3d-6.2234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTMnMjQuMiJTIDEwNsKwNDcnMjIuMiJF!5e0!3m2!1sen!2sid!4v1234567893',
            null, // Some rooms without maps
        ];

        $usedNames = [];

        foreach ($owners as $owner) {
            $roomCount = rand(3, 6);
            
            for ($i = 0; $i < $roomCount; $i++) {
                // Use base name + number if needed for uniqueness
                $baseName = fake()->randomElement($roomNames);
                $roomName = $baseName;
                $counter = 1;
                
                // Add number suffix if name is already used
                while (in_array($roomName, $usedNames)) {
                    $roomName = $baseName . ' ' . $counter;
                    $counter++;
                }
                
                $usedNames[] = $roomName;

                // Some rooms with tours, some without:
                $room = Room::create([
                    'owner_id' => $owner->id,
                    'name' => $roomName,
                    'description' => fake()->paragraphs(3, true),
                    'address' => fake()->address(),
                    'embedded_map_link' => fake()->randomElement($sampleMapLinks),
                    'price' => rand(500000, 2000000), // Rp 500k - 2M
                    'size' => rand(15, 50), // 15-50 sqm
                    'max_occupancy' => rand(1, 4),
                    'is_available' => rand(0, 10) > 1, // 90% available

                    'available_tour_times' => rand(1, 10) <= 8 
                        ? ['09:00', '14:00', '16:00', '18:00'] 
                        : null, // null = tours disabled
                    'max_advance_days' => rand(2, 5),
                ]);

                // Add facilities using the new many-to-many relationship
                $facilityNames = ['WiFi', 'AC', 'Private Bathroom', 'Wardrobe', 'Desk', 'Chair', 'Bed', 'Parking', 'Security', 'Laundry'];
                $selectedFacilityNames = fake()->randomElements($facilityNames, rand(4, 8));
                
                // Get the actual facility models
                $facilities = Facility::whereIn('name', $selectedFacilityNames)->get();
                
                // Attach facilities to the room using the many-to-many relationship
                $room->facilities()->attach($facilities);

                // Add images
                RoomImage::create([
                    'room_id' => $room->id,
                    'url' => 'https://picsum.photos/800/600?random=' . ($room->id * 10 + 1),
                    'caption' => 'Main room view',
                    'is_primary' => true,
                ]);

                for ($j = 2; $j <= rand(3, 6); $j++) {
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