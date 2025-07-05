<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Bookmark;
use App\Models\Facility;
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

        // Get available rooms with filters
        $rooms = Room::getAllRooms($filters);
        
        // Get random room for hero (separate from filtered results)
        $heroRoom = Room::getRandomRoomForHero();

        // Get all available facilities with IDs for the filter dropdown
        $facilities = Room::getAllFacilities();

        // Get user's bookmarks if authenticated
        $userBookmarks = [];
        if (Auth::check()) {
            $userBookmarks = Bookmark::where('user_id', Auth::id())
                ->pluck('room_id')
                ->toArray();
        }

        return Inertia::render('landing-page', [
            'rooms' => $rooms,
            'heroRoom' => $heroRoom,
            'facilities' => $facilities,
            'filters' => $filters,
            'userBookmarks' => $userBookmarks,
        ]);
    }
}
