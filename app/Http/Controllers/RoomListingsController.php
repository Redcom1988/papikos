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
    /**
     * Display a listing of rooms with filters and pagination
     */
    public function index(Request $request): Response
    {
        $query = Room::query()->with(['images', 'facilities', 'owner']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Price filters
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Facilities filter
        if ($request->filled('facilities') && is_array($request->facilities)) {
            $query->whereHas('facilities', function($q) use ($request) {
                $q->whereIn('name', $request->facilities);
            });
        }

        // Rating filter
        if ($request->filled('rating') && $request->rating > 0) {
            $query->having('avg_rating', '>=', $request->rating);
        }

        // Sorting
        switch ($request->sort_by) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->withAvg('reviews', 'overall_rating')->orderBy('reviews_avg_overall_rating', 'desc');
                break;
            case 'popular':
                $query->withCount('bookmarks')->orderBy('bookmarks_count', 'desc');
                break;
            default: // newest
                $query->orderBy('created_at', 'desc');
                break;
        }

        // Paginate results
        $rooms = $query->paginate(12)->through(function ($room) {
            return [
                'id' => $room->id,
                'title' => $room->name,
                'price' => $room->price,
                'location' => $room->address,
                'rating' => round($room->averageRating() ?? 0, 1),
                'reviewCount' => $room->reviews_count ?? 0,
                'primary_image' => $room->images->where('is_primary', true)->first()?->url,
                'size' => $room->size,
                'max_occupancy' => $room->max_occupancy,
                'facilities' => $room->facilities->pluck('name')->toArray(),
                'description' => $room->description,
                'availableTours' => [],
            ];
        });

        // Get all available facilities with IDs
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
            'filters' => [
                'search' => $request->search ?? '',
                'min_price' => $request->min_price ?? 0,
                'max_price' => $request->max_price ?? 10000000,
                'facilities' => $request->facilities ?? [],
                'rating' => $request->rating ?? 0,
                'sort_by' => $request->sort_by ?? 'newest',
            ],
            'userBookmarks' => $userBookmarks,
        ]);
    }
}
