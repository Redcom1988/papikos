<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\User;
use App\Models\Facility;
use App\Models\Bookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        // Get filter parameters
        $filters = [
            'min_price' => $request->input('min_price', 0),
            'max_price' => $request->input('max_price', 999999999),
            'facilities' => $request->input('facilities', []),
        ];

        // Get featured room
        $featuredRoom = Room::with(['images'])
            ->where('is_available', true)
            ->inRandomOrder()
            ->first();

        // Get total properties count (all rooms, not just available)
        $totalProperties = Room::count(); // Remove the where clause to get all rooms

        // Get total owners count (users with owner role who have at least one room)
        $totalOwners = User::where('role', 'owner')
            ->whereHas('rooms') // Only count owners who actually have rooms
            ->count();

        // Transform featured room if exists
        $heroRoom = null;
        if ($featuredRoom) {
            $heroRoom = [
                'id' => $featuredRoom->id,
                'title' => $featuredRoom->name,
                'primary_image' => $featuredRoom->images->where('is_primary', true)->first()?->url
            ];
        }

        // Get rooms for the grid (limited to 6 for homepage)
        $rooms = Room::with(['owner', 'images', 'facilities'])
            ->where('is_available', true)
            ->latest()
            ->take(6)
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'title' => $room->name,
                    'price' => $room->price,
                    'location' => $room->address,
                    'images' => $room->images->pluck('url')->toArray(),
                    'facilities' => $room->facilities->map(function ($facility) {
                        return [
                            'id' => $facility->id,
                            'name' => $facility->name,
                            'description' => $facility->description,
                            'icon' => $facility->icon,
                        ];
                    })->toArray(),
                    'description' => $room->description,
                    'primary_image' => $room->images->where('is_primary', true)->first()?->url,
                    'size' => $room->size,
                    'max_occupancy' => $room->max_occupancy,
                    'is_available' => $room->is_available,
                ];
            });

        // Get facilities for filter
        $facilities = Facility::orderBy('name')->get();

        // Get user's bookmarks if authenticated
        $userBookmarks = [];
        if (Auth::check()) {
            $userBookmarks = Bookmark::where('user_id', Auth::id())
                ->pluck('room_id')
                ->toArray();
        }

        return Inertia::render('landing-page', [
            'heroRoom' => $heroRoom,
            'totalProperties' => $totalProperties,
            'totalOwners' => $totalOwners,
            'rooms' => $rooms,
            'facilities' => $facilities,
            'filters' => [
                'min_price' => null,
                'max_price' => null,
                'facilities' => [],
            ],
            'userBookmarks' => $userBookmarks,
        ]);
    }
}
