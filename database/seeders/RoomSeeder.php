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
            $roomCount = rand(10, 18);

            // Get all available facilities from the database
            $allFacilities = Facility::all();

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

                // Randomly select 4-8 facilities from all available facilities
                $selectedFacilities = $allFacilities->random(rand(4, min(8, $allFacilities->count())));
                $room->facilities()->attach($selectedFacilities);

                // Add images
                $unsplashImages = [
                    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80', // simple bed
                    'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80', // cozy room
                    'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=800&q=80', // small room
                    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80', // desk and bed
                    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', // window room
                    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80', // simple room
                    'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80', // small bed
                    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', // single bed
                    'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80', // small room
                    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80', // simple room
                    'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80', // desk
                    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80', // neat bed
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', // simple white room
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', // small apartment
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', // minimal bedroom
                    'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?auto=format&fit=crop&w=800&q=80', // student room
                    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', // simple bed setup
                    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80', // clean room
                    'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80', // modern simple room
                    'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80', // basic bedroom
                    'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', // cozy corner
                    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80', // single room
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', // white minimal room
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', // small space
                    'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=800&q=80', // simple furniture
                    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', // basic room
                    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80', // single bed room
                    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', // minimal design
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80', // small bedroom
                    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80', // compact room
                    'https://images.unsplash.com/photo-1571055107559-3e67626fa8be?auto=format&fit=crop&w=800&q=80', // student accommodation
                    'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=800&q=80' // clean minimal room
                ];

                RoomImage::create([
                    'room_id' => $room->id,
                    'url' => $unsplashImages[array_rand($unsplashImages)],
                    'caption' => 'Main room view',
                    'is_primary' => true,
                ]);

                for ($j = 2; $j <= rand(3, 6); $j++) {
                    RoomImage::create([
                        'room_id' => $room->id,
                        'url' => $unsplashImages[array_rand($unsplashImages)],
                        'caption' => fake()->sentence(3),
                        'is_primary' => false,
                    ]);
                }
            }
        }
    }
}