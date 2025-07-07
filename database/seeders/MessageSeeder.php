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
            'Is there a curfew?',
            'How many people can stay in the room?',
            'Is there a kitchen I can use?',
            'Are guests allowed to stay overnight?',
            'How do I pay the rent each month?',
            'Is there a minimum stay period?',
            'Can I move in next month?',
            'Is there a contract to sign?',
            'Are there any additional fees?',
            'Can I bring my own furniture?',
        ];

        // Create 80 random messages
        for ($i = 0; $i < 80; $i++) {
            $sender = $users->random();
            $receiver = $users->where('id', '!=', $sender->id)->random();

            Message::create([
                'sender' => $sender->id,
                'receiver' => $receiver->id,
                'message' => $sampleMessages[array_rand($sampleMessages)],
                'created_at' => Carbon::now()->subDays(rand(0, 30))->addMinutes(rand(0, 1440)),
                'updated_at' => Carbon::now()->subDays(rand(0, 30))->addMinutes(rand(0, 1440)),
            ]);
        }

        // Create more realistic conversation threads
        $owners = User::where('role', 'owner')->get();
        $renters = User::where('role', 'renter')->get();

        foreach ($owners as $owner) {
            foreach ($renters->random(min(2, $renters->count())) as $renter) {
                $baseTime = Carbon::now()->subDays(rand(1, 10));
                $thread = [
                    ['sender' => $renter->id, 'message' => 'Hi, I\'m interested in your kos. Is it still available?'],
                    ['sender' => $owner->id, 'message' => 'Yes, it\'s still available. Would you like to schedule a viewing?'],
                    ['sender' => $renter->id, 'message' => 'Yes, can I come this Saturday?'],
                    ['sender' => $owner->id, 'message' => 'Saturday works. See you at 10 AM!'],
                    ['sender' => $renter->id, 'message' => 'Thank you! Looking forward to it.'],
                ];
                foreach ($thread as $idx => $msg) {
                    Message::create([
                        'sender' => $msg['sender'],
                        'receiver' => $msg['sender'] == $owner->id ? $renter->id : $owner->id,
                        'message' => $msg['message'],
                        'created_at' => $baseTime->copy()->addMinutes($idx * 30),
                        'updated_at' => $baseTime->copy()->addMinutes($idx * 30),
                    ]);
                }
            }
        }

        // Create some already existing conversations between specific users
        $userPairs = [
            // [sender_id, receiver_id]
            [$users[0]->id, $users[1]->id],
            [$users[1]->id, $users[0]->id],
            [$users[2]->id ?? $users[0]->id, $users[3]->id ?? $users[1]->id],
        ];

        foreach ($userPairs as $pair) {
            $baseTime = Carbon::now()->subDays(rand(5, 20));
            $conversation = [
                ['sender' => $pair[0], 'receiver' => $pair[1], 'message' => 'Hey, are you still looking for a room?'],
                ['sender' => $pair[1], 'receiver' => $pair[0], 'message' => 'Yes, I am! Do you have any available?'],
                ['sender' => $pair[0], 'receiver' => $pair[1], 'message' => 'I have one available starting next week.'],
                ['sender' => $pair[1], 'receiver' => $pair[0], 'message' => 'Great! Can I visit this Friday?'],
                ['sender' => $pair[0], 'receiver' => $pair[1], 'message' => 'Sure, see you then!'],
            ];
            foreach ($conversation as $idx => $msg) {
                Message::create([
                    'sender' => $msg['sender'],
                    'receiver' => $msg['receiver'],
                    'message' => $msg['message'],
                    'created_at' => $baseTime->copy()->addMinutes($idx * 25),
                    'updated_at' => $baseTime->copy()->addMinutes($idx * 25),
                ]);
            }
        }
    }
}