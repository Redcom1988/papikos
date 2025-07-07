<?php

namespace Database\Seeders;

use App\Models\Report;
use App\Models\ReportImage;
use App\Models\User;
use App\Models\Room;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;
use Carbon\Carbon;

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
        $ownerResponseActions = ['issue_resolved', 'listing_updated', 'additional_info', 'dispute'];
        
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

        $ownerResponses = [
            'issue_resolved' => [
                'I have fixed the issues mentioned in this report. The problem has been resolved.',
                'Thank you for bringing this to my attention. I have addressed all the concerns raised.',
                'The reported issues have been corrected. The listing is now accurate.',
                'I apologize for any inconvenience. The matter has been resolved completely.',
            ],
            'listing_updated' => [
                'I have updated the listing with more accurate information and photos.',
                'The listing description and images have been revised based on your feedback.',
                'Thank you for the feedback. I have made necessary updates to the listing.',
                'The listing has been updated to reflect the current condition of the room.',
            ],
            'additional_info' => [
                'I would like to provide additional context about this situation.',
                'There seems to be a misunderstanding. Let me clarify the situation.',
                'I have more information that might help resolve this matter.',
                'Please let me explain the circumstances behind this report.',
            ],
            'dispute' => [
                'I disagree with this report. The claims made are not accurate.',
                'This report contains false information about my property.',
                'I believe this report is unfair and does not reflect reality.',
                'I contest the validity of the claims made in this report.',
            ]
        ];

        // Create 30 reports
        for ($i = 0; $i < 30; $i++) {
            $reporter = $users->random();
            $room = $rooms->random();
            $type = $faker->randomElement($reportTypes);
            $status = $faker->randomElement($statuses);
            $createdAt = $faker->dateTimeBetween('-60 days', 'now');
            
            $reportData = [
                'reporter_id' => $reporter->id,
                'room_id' => $room->id,
                'type' => $type,
                'description' => $faker->randomElement($reportDescriptions[$type]),
                'status' => $status,
                'admin_notes' => $status !== 'pending' ? $faker->sentence(10) : null,
                'created_at' => $createdAt,
            ];

            // Add owner response for 40% of non-pending reports
            if ($status !== 'pending' && rand(1, 10) <= 4) {
                $responseAction = $faker->randomElement($ownerResponseActions);
                $responseDate = Carbon::parse($createdAt)->addDays(rand(1, 7));
                
                $reportData['owner_response'] = $faker->randomElement($ownerResponses[$responseAction]);
                $reportData['owner_response_action'] = $responseAction;
                $reportData['owner_responded_at'] = $responseDate;
            }

            $report = Report::create($reportData);

            $unsplashImages = [
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1503389152951-9c3d8b6e9c94?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1519974719765-e6559eac2575?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1512918728675-3d8017c8b6b4?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1512918728675-3d8017c8b6b4?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1519985176271-adb1088fa94c?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1509395176047-4a66953fd231?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
                'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
            ];

            // Add some images to reports (30% chance)
            if (rand(1, 10) <= 3) {
                $imageCount = rand(1, 3);
                for ($j = 0; $j < $imageCount; $j++) {
                    ReportImage::create([
                        'report_id' => $report->id,
                        'url' => $unsplashImages[array_rand($unsplashImages)],
                    ]);
                }
            }

            // Always add at least one image for every 3rd report
            if ($i % 3 === 0) {
                $imageCount = rand(1, 3);
                for ($j = 0; $j < $imageCount; $j++) {
                    ReportImage::create([
                        'report_id' => $report->id,
                        'url' => $unsplashImages[array_rand($unsplashImages)],
                    ]);
                }
            }
        }

        // Create some specific scenario reports with owner responses
        $specificReports = [
            [
                'type' => 'fake_listing',
                'description' => 'This listing is using photos from a 5-star hotel. I reverse searched the images and found them on the hotel\'s official website.',
                'status' => 'investigating',
                'admin_notes' => 'Images flagged for verification. Contacted owner for proof of ownership.',
                'owner_response' => 'I understand the concern, but these are actually professional photos I had taken of my property. I can provide the photographer\'s contact information and invoices as proof.',
                'owner_response_action' => 'additional_info',
            ],
            [
                'type' => 'fraud',
                'description' => 'Owner demanded 6 months rent upfront via bank transfer before even showing the room. Very suspicious behavior.',
                'status' => 'resolved',
                'admin_notes' => 'Owner account suspended. User refunded through platform protection.',
                'owner_response' => 'I apologize for any confusion. I was following what I thought was standard practice, but I understand now that this was inappropriate. I have updated my approach.',
                'owner_response_action' => 'issue_resolved',
            ],
            [
                'type' => 'safety_concern',
                'description' => 'Electrical wiring is exposed and dangerous. Fire exits are blocked. This place is a safety hazard.',
                'status' => 'resolved',
                'admin_notes' => 'Listing removed. Local authorities contacted for safety inspection.',
                'owner_response' => 'Thank you for bringing this to my attention. I have hired a licensed electrician to fix all wiring issues and have cleared all fire exits. Safety inspection has been completed.',
                'owner_response_action' => 'issue_resolved',
            ],
            [
                'type' => 'inappropriate_content',
                'description' => 'Room description contains offensive language that makes me uncomfortable as a potential renter.',
                'status' => 'resolved',
                'admin_notes' => 'Owner was contacted and listing description was updated.',
                'owner_response' => 'I sincerely apologize for the inappropriate language. I have completely rewritten the listing description to be more professional and welcoming.',
                'owner_response_action' => 'listing_updated',
            ],
            [
                'type' => 'other',
                'description' => 'The room condition does not match the photos at all. Very misleading listing.',
                'status' => 'dismissed',
                'admin_notes' => 'Investigation showed photos were taken before tenant moved in. No violation found.',
                'owner_response' => 'I believe this report is unfair. The photos were taken when the room was clean and vacant. The current condition reflects normal wear from the previous tenant.',
                'owner_response_action' => 'dispute',
            ],
        ];

        foreach ($specificReports as $index => $reportData) {
            $reporter = $users->where('is_owner', false)->random();
            $room = $rooms->random();
            $createdAt = $faker->dateTimeBetween('-30 days', 'now');
            $responseDate = Carbon::parse($createdAt)->addDays(rand(2, 10));
            
            Report::create([
                'reporter_id' => $reporter->id,
                'room_id' => $room->id,
                'type' => $reportData['type'],
                'description' => $reportData['description'],
                'status' => $reportData['status'],
                'admin_notes' => $reportData['admin_notes'],
                'owner_response' => $reportData['owner_response'],
                'owner_response_action' => $reportData['owner_response_action'],
                'owner_responded_at' => $responseDate,
                'created_at' => $createdAt,
            ]);
        }

        $this->command->info('Reports seeded successfully with owner responses!');
    }
}