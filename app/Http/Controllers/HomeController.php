<?php

namespace App\Http\Controllers;

use App\Models\Room;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(Request $request): Response
    {
        // Get filter parameters
        $filters = [
            'min_price' => $request->input('min_price', 0),
            'max_price' => $request->input('max_price', 10000000),
            'facilities' => $request->input('facilities', []),
        ];

        // Get available rooms with filters
        $rooms = Room::getAvailableRooms($filters);
        
        // Get all available facilities for the filter dropdown
        $availableFacilities = Room::getAllFacilities();

        return Inertia::render('landing-page', [
            'rooms' => $rooms,
            'facilities' => $availableFacilities,
            'filters' => $filters,
        ]);
    }
}
