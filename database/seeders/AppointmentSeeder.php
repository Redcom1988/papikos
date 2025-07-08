<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class AppointmentSeeder extends Seeder
{
    public function run(): void
    {
        // Only select users with the 'renter' role
        $users = User::where('role', 'renter')->get();
        $rooms = Room::all();

        foreach ($users as $user) {
            // Each user has 0-2 appointments
            $appointmentCount = rand(0, 2);
            
            for ($i = 0; $i < $appointmentCount; $i++) {
                Appointment::create([
                    'user_id' => $user->id,
                    'room_id' => $rooms->random()->id,
                    'scheduled_at' => fake()->dateTimeBetween('now', '+30 days'),
                    'status' => fake()->randomElement(['scheduled', 'completed', 'cancelled']),
                    'notes' => fake()->optional()->sentence(),
                ]);
            }
        }
    }
}
