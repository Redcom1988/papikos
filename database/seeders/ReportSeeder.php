<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\ReportImage;
use App\Models\User;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ReportSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();
        
        $users = User::all();
        $rooms = Room::all();
        
        if ($users->count() == 0 || $rooms->count() == 0) {
            $this->command->warn('Please run UserSeeder and RoomSeeder first.');
            return;
        }

        $reportTypes = ['inappropriate_content', 'fake_listing', 'fraud', 'safety_concern', 'other'];
        $statuses = ['pending', 'investigating', 'resolved', 'dismissed'];
        
        $reportDescriptions = [
            'inappropriate_content' => [
                'The room images contain inappropriate content',
                'Room description has offensive language',
                'Profile contains inappropriate photos',
            ],
            'fake_listing' => [
                'This listing appears to be fake - images are from a hotel website',
                'The address provided does not exist',
                'Owner is using stolen photos from another property',
            ],
            'fraud' => [
                'Owner asked for money transfer before viewing',
                'Suspicious payment request outside platform',
                'Owner demanding full payment upfront without contract',
            ],
            'safety_concern' => [
                'The building looks unsafe and poorly maintained',
                'No fire safety equipment visible',
                'Area seems unsafe, poor lighting and security',
            ],
            'other' => [
                'Owner is unresponsive to messages',
                'Room condition does not match description',
                'Misleading pricing information',
            ]
        ];

        // Create 30 reports
        for ($i = 0; $i < 30; $i++) {
            $reporter = $users->random();
            $room = $rooms->random();
            $type = $faker->randomElement($reportTypes);
            $status = $faker->randomElement($statuses);
            
            $report = Report::create([
                'reporter_id' => $reporter->id,
                'room_id' => $room->id,
                'type' => $type,
                'description' => $faker->randomElement($reportDescriptions[$type]),
                'status' => $status,
                'admin_notes' => $status !== 'pending' ? $faker->sentence(10) : null,
                'created_at' => $faker->dateTimeBetween('-60 days', 'now'),
            ]);

            // Add some images to reports (30% chance)
            if (rand(1, 10) <= 3) {
                $imageCount = rand(1, 3);
                for ($j = 0; $j < $imageCount; $j++) {
                    ReportImage::create([
                        'report_id' => $report->id,
                        'url' => 'https://picsum.photos/800/600?random=' . ($report->id * 10 + $j),
                    ]);
                }
            }
        }

        // Create some specific scenario reports
        $specificReports = [
            [
                'type' => 'fake_listing',
                'description' => 'This listing is using photos from a 5-star hotel. I reverse searched the images and found them on the hotel\'s official website.',
                'status' => 'investigating',
                'admin_notes' => 'Images flagged for verification. Contacted owner for proof of ownership.',
            ],
            [
                'type' => 'fraud',
                'description' => 'Owner demanded 6 months rent upfront via bank transfer before even showing the room. Very suspicious behavior.',
                'status' => 'resolved',
                'admin_notes' => 'Owner account suspended. User refunded through platform protection.',
            ],
            [
                'type' => 'safety_concern',
                'description' => 'Electrical wiring is exposed and dangerous. Fire exits are blocked. This place is a safety hazard.',
                'status' => 'resolved',
                'admin_notes' => 'Listing removed. Local authorities contacted for safety inspection.',
            ],
        ];

        foreach ($specificReports as $reportData) {
            $reporter = $users->where('is_owner', false)->random();
            $room = $rooms->random();
            
            Report::create([
                'reporter_id' => $reporter->id,
                'room_id' => $room->id, 
                'type' => $reportData['type'],
                'description' => $reportData['description'],
                'status' => $reportData['status'],
                'admin_notes' => $reportData['admin_notes'],
                'created_at' => $faker->dateTimeBetween('-30 days', 'now'),
            ]);
        }

        $this->command->info('Reports seeded successfully!');
    }
}