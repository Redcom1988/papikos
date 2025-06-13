<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\ReviewImage;
use App\Models\Payment;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $paidPayments = Payment::where('payment_status', 'paid')->get();

        foreach ($paidPayments as $payment) {
            // 70% chance of having a review
            if (rand(1, 10) <= 7) {
                $review = Review::create([
                    'payment_id' => $payment->id,
                    'user_id' => $payment->user_id,
                    'room_id' => $payment->room_id,
                    'cleanliness_rating' => fake()->randomFloat(1, 3.0, 5.0),
                    'security_rating' => fake()->randomFloat(1, 3.0, 5.0),
                    'comfort_rating' => fake()->randomFloat(1, 3.0, 5.0),
                    'value_rating' => fake()->randomFloat(1, 3.0, 5.0),
                    'comment' => fake()->optional(0.8)->paragraphs(2, true),
                ]);

                // 30% chance of having review images
                if (rand(1, 10) <= 3) {
                    $imageCount = rand(1, 3);
                    for ($i = 0; $i < $imageCount; $i++) {
                        ReviewImage::create([
                            'review_id' => $review->id,
                            'url' => 'https://picsum.photos/400/300?random=' . ($review->id * 100 + $i),
                        ]);
                    }
                }
            }
        }
    }
}