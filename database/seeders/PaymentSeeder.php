<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('is_owner', false)->get();
        $rooms = Room::all();

        foreach ($users->take(5) as $user) {
            // Each user has 1-2 payments
            $paymentCount = rand(1, 2);
            
            for ($i = 0; $i < $paymentCount; $i++) {
                $room = $rooms->random();
                $amount = $room->price;
                $platformFee = (int) ($amount * 0.1); // 10% commission
                $ownerAmount = $amount - $platformFee;
                
                Payment::create([
                    'user_id' => $user->id,
                    'owner_id' => $room->owner_id,
                    'room_id' => $room->id,
                    'amount' => $amount,
                    'platform_fee' => $platformFee,
                    'owner_amount' => $ownerAmount,
                    'doku_invoice_id' => 'INV-' . fake()->uuid(),
                    'doku_transaction_id' => 'TXN-' . fake()->uuid(),
                    'payment_status' => 'paid',
                    'paid_at' => fake()->dateTimeBetween('-30 days', 'now'),
                    'transfer_status' => fake()->randomElement(['completed', 'pending']),
                    'transferred_at' => fake()->optional()->dateTimeBetween('-20 days', 'now'),
                ]);
            }
        }
    }
}