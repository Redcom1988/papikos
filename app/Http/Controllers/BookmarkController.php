<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Facility;
use App\Models\Bookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return redirect()->route('login');
        }

        // Get user's bookmarked room IDs
        $bookmarkedRoomIds = $user->bookmarks()->pluck('room_id')->toArray();

        // If no bookmarks, return empty result
        if (empty($bookmarkedRoomIds)) {
            return Inertia::render('bookmarked-rooms-page', [
                'rooms' => [
                    'data' => [],
                    'current_page' => 1,
                    'last_page' => 1,
                    'total' => 0,
                    'from' => 0,
                    'to' => 0,
                ],
                'facilities' => Facility::orderBy('name')->get(),
                'filters' => [
                    'search' => $request->get('search', ''),
                    'min_price' => $request->get('min_price'),
                    'max_price' => $request->get('max_price'),
                    'facilities' => $request->get('facilities', []),
                    'sort_by' => $request->get('sort_by', 'newest'),
                    'is_available' => $request->get('is_available'),
                ],
                'userBookmarks' => [],
            ]);
        }

        // Build query for bookmarked rooms
        $query = Room::with(['owner', 'images', 'facilities'])
            ->whereIn('id', $bookmarkedRoomIds);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")  // Fix: use 'name' not 'rooms.title'
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        // Apply price filters
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));  // Fix: remove 'rooms.' prefix
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));  // Fix: remove 'rooms.' prefix
        }

        // Apply availability filter
        if ($request->filled('is_available')) {
            $query->where('is_available', $request->boolean('is_available'));  // Fix: remove 'rooms.' prefix
        }

        // Apply facility filters
        if ($request->filled('facilities')) {
            $facilities = $request->get('facilities');
            if (is_array($facilities) && count($facilities) > 0) {
                $query->whereHas('facilities', function ($q) use ($facilities) {
                    $q->whereIn('name', $facilities);
                }, '>=', count($facilities));
            }
        }

        // Apply sorting - THIS IS THE KEY FIX
        $sortBy = $request->get('sort_by', 'newest');
        switch ($sortBy) {
            case 'oldest':
                // Use subquery instead of join to preserve relationships
                $query->orderByRaw('(SELECT created_at FROM bookmarks WHERE room_id = rooms.id AND user_id = ?) ASC', [$user->id]);
                break;
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->withCount('bookmarks')->orderBy('bookmarks_count', 'desc');
                break;
            case 'newest':
            default:
                // Use subquery instead of join to preserve relationships
                $query->orderByRaw('(SELECT created_at FROM bookmarks WHERE room_id = rooms.id AND user_id = ?) DESC', [$user->id]);
                break;
        }

        // Paginate results
        $rooms = $query->paginate(12)->appends($request->query());

        // Transform the data to match what RoomCard expects
        $rooms->getCollection()->transform(function ($room) {
            return [
                'id' => $room->id,
                'name' => $room->name,
                'price' => $room->price,
                'address' => $room->address,
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
                'availableTours' => $room->getAvailableTourSlots(),
                'primary_image' => $room->images->where('is_primary', true)->first()?->url,
                'size' => $room->size,
                'max_occupancy' => $room->max_occupancy,
                'is_available' => $room->is_available,
            ];
        });

        // Debug: Check transformed data
        Log::info('Transformed room data', [
            'first_room' => $rooms->first() ?: 'No rooms found'
        ]);

        // Get all facilities for filter sidebar
        $facilities = Facility::orderBy('name')->get();

        return Inertia::render('bookmarked-rooms-page', [
            'rooms' => $rooms,
            'facilities' => $facilities,
            'filters' => [
                'search' => $request->get('search', ''),
                'min_price' => $request->get('min_price'),
                'max_price' => $request->get('max_price'),
                'facilities' => $request->get('facilities', []),
                'sort_by' => $sortBy,
                'is_available' => $request->get('is_available'),
            ],
            'userBookmarks' => $bookmarkedRoomIds,
        ]);
    }

    public function toggle(Request $request)
    {
        Log::info('Bookmark toggle request received', ['request_data' => $request->all()]);

        try {
            $request->validate([
                'room_id' => 'required|exists:rooms,id',
            ]);

            $userId = $request->user()->id; // Change this line
            $roomId = $request->room_id;

            Log::info('Bookmark toggle for user', ['user_id' => $userId, 'room_id' => $roomId]);

            $bookmark = Bookmark::where('user_id', $userId)
                ->where('room_id', $roomId)
                ->first();

            if ($bookmark) {
                $bookmark->delete();
                Log::info('Bookmark removed');
                $message = 'Bookmark removed';
                $bookmarked = false;
            } else {
                Bookmark::create([
                    'user_id' => $userId,
                    'room_id' => $roomId,
                ]);
                Log::info('Bookmark added');
                $message = 'Bookmark added';
                $bookmarked = true;
            }

            // Return JSON response for AJAX requests
            if ($request->wantsJson()) {
                return response()->json([
                    'is_bookmarked' => $bookmarked,
                    'message' => $message
                ]);
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Bookmark toggle error', ['error' => $e->getMessage()]);
            
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Failed to toggle bookmark'], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to toggle bookmark']);
        }
    }

    public function getUserBookmarks(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json(['bookmarks' => []], 401);
            }

            $bookmarks = $user->bookmarks()
                ->with('room.images')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json(['bookmarks' => $bookmarks]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch user bookmarks', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch bookmarks'], 500);
        }
    }
}
