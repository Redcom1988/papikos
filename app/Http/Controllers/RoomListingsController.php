<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Bookmark;
use App\Models\Facility;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RoomListingsController extends Controller
{
    public function index(Request $request): Response
    {
        // Get filter parameters
        $filters = [
            'search' => $request->input('search', ''),
            'min_price' => $request->input('min_price', 0),
            'max_price' => $request->input('max_price', 999999999),
            'facilities' => $request->input('facilities', []),
            'sort_by' => $request->input('sort_by', 'newest'),
            'paginate' => $request->input('paginate', 24),
            'is_available' => $request->input('is_available', false),
        ];

        // Get available rooms with filters
        $rooms = Room::getAllRooms($filters);

        // Get all available facilities with IDs for the filter dropdown
        $allFacilities = Facility::select('id', 'name')->get()->toArray();

        // Get user bookmarks if authenticated
        $userBookmarks = [];
        if (Auth::check()) {
            $userBookmarks = Bookmark::where('user_id', Auth::id())
                ->pluck('room_id')
                ->toArray();
        }

        return Inertia::render('room-listings-page', [
            'rooms' => $rooms,
            'facilities' => $allFacilities,
            'filters' => $filters,
            'userBookmarks' => $userBookmarks,
        ]);
    }
}