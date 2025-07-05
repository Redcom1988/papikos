<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class MessageSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        
        if ($users->count() < 2) {
            $this->command->warn('Not enough users to create messages. Please run UserSeeder first.');
            return;
        }

        $sampleMessages = [
            'Hello! I\'m interested in your room listing.',
            'Is the room still available?',
            'Can we schedule a viewing appointment?',
            'What facilities are included?',
            'Is the price negotiable?',
            'When is the earliest move-in date?',
            'Are utilities included in the rent?',
            'Is parking available?',
            'Can I see more photos of the room?',
            'What are the house rules?',
            'Is the deposit refundable?',
            'How close is it to public transportation?',
            'Are pets allowed?',
            'Is internet included?',
            'Can I visit this weekend?',
        ];

        // Create 50 random messages
        for ($i = 0; $i < 50; $i++) {
            $sender = $users->random();
            $receiver = $users->where('id', '!=', $sender->id)->random();
            
            Message::create([
                'sender' => $sender->id,
                'receiver' => $receiver->id,
                'message' => $sampleMessages[array_rand($sampleMessages)],
                'created_at' => Carbon::now()->subDays(rand(0, 30)),
                'updated_at' => Carbon::now()->subDays(rand(0, 30)),
            ]);
        }

        // Create some conversation threads between specific users
        $owner = User::where('email', 'admin@example.com')->first();
        $renter = User::where('email', 'renter@example.com')->first();

        if ($owner && $renter) {
            // Conversation thread
            $conversationMessages = [
                ['sender' => $renter->id, 'message' => 'Hi, I saw your room listing and I\'m very interested!'],
                ['sender' => $owner->id, 'message' => 'Hello! Thank you for your interest. Which room are you looking at?'],
                ['sender' => $renter->id, 'message' => 'The one-bedroom apartment downtown. Is it still available?'],
                ['sender' => $owner->id, 'message' => 'Yes, it\'s still available. Would you like to schedule a viewing?'],
                ['sender' => $renter->id, 'message' => 'That would be great! When are you available?'],
                ['sender' => $owner->id, 'message' => 'I\'m free this weekend. How about Saturday at 2 PM?'],
                ['sender' => $renter->id, 'message' => 'Perfect! I\'ll see you then. What\'s the exact address?'],
            ];

            $baseTime = Carbon::now()->subDays(5);
            foreach ($conversationMessages as $index => $msgData) {
                Message::create([
                    'sender' => $msgData['sender'],
                    'receiver' => $msgData['sender'] == $owner->id ? $renter->id : $owner->id,
                    'message' => $msgData['message'],
                    'created_at' => $baseTime->copy()->addHours($index * 2),
                    'updated_at' => $baseTime->copy()->addHours($index * 2),
                ]);
            }
        }

        $this->command->info('Messages seeded successfully!');
    }
}