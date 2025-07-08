<?php

namespace Database\Seeders;

use App\Models\Bookmark;
use App\Models\Room;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookmarkSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'renter')->get();
        $rooms = Room::all();

        foreach ($users as $user) {
            // Each user bookmarks 0-5 random rooms
            $bookmarkCount = rand(0, 5);
            $randomRooms = $rooms->random(min($bookmarkCount, $rooms->count()));
            
            foreach ($randomRooms as $room) {
                Bookmark::create([
                    'user_id' => $user->id,
                    'room_id' => $room->id,
                ]);
            }
        }
    }
}