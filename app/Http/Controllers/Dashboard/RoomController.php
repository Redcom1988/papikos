<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Room;
use App\Models\Facility;
use App\Models\RoomImage;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RoomController extends Controller
{
    // For owners - show their rooms
    public function index()
    {
        $authId = Auth::id();
        
        // Use similar logic as Room::getAllRooms() but filter by owner
        $rooms = Room::with(['images', 'facilities'])
            ->where('owner_id', $authId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'title' => $room->name,
                    'location' => $room->address,
                    'description' => $room->description,
                    'price' => $room->price,
                    'formatted_price' => $room->formatted_price,
                    'size' => $room->size,
                    'max_occupancy' => $room->max_occupancy,
                    'is_available' => $room->is_available,
                    'images' => $room->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'is_primary' => $image->is_primary,
                        ];
                    })->toArray(),
                    'primary_image' => $room->images->where('is_primary', true)->first()?->url 
                        ?: $room->images->first()?->url,
                    'facilities' => $room->facilities->map(function ($facility) {
                        return [
                            'id' => $facility->id,
                            'name' => $facility->name,
                            'icon' => $facility->icon,
                        ];
                    })->toArray(),
                    'facilities_count' => $room->facilities->count(),
                    'availableTours' => $room->available_tour_times ?? [],
                    'created_at' => $room->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('dashboard/room-owned-page', [
            'rooms' => $rooms
        ]);
    }

    // For admins - show all rooms
    public function all()
    {
        $rooms = Room::with(['images', 'facilities', 'owner'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($room) {
                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'address' => $room->address,
                    'price' => $room->price,
                    'formatted_price' => $room->formatted_price,
                    'size' => $room->size,
                    'max_occupancy' => $room->max_occupancy,
                    'is_available' => $room->is_available,
                    'owner_name' => $room->owner->name,
                    'owner_email' => $room->owner->email,
                    'facilities_count' => $room->facilities->count(),
                    'images_count' => $room->images->count(),
                    'primary_image' => $room->images->where('is_primary', true)->first()?->url,
                    'created_at' => $room->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('dashboard/room-all-page', [
            'rooms' => $rooms
        ]);
    }

    // Show create form
    public function create()
    {
        $facilities = Facility::select('id', 'name', 'description', 'icon')->get();
        
        return Inertia::render('dashboard/room-form', [
            'facilities' => $facilities,
            'room' => null
        ]);
    }

    // Store new room
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string|max:500',
            'embedded_map_link' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'size' => 'required|numeric|min:1',
            'max_occupancy' => 'required|integer|min:1',
            'is_available' => 'boolean',
            'available_tour_times' => 'nullable|array',
            'max_advance_days' => 'required|integer|min:1|max:30',
            'facilities' => 'nullable|array',
            'facilities.*' => 'exists:facilities,id',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            $room = Room::create([
                'owner_id' => Auth::id(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'address' => $validated['address'],
                'embedded_map_link' => $validated['embedded_map_link'] ?? null,
                'price' => $validated['price'],
                'size' => $validated['size'],
                'max_occupancy' => $validated['max_occupancy'],
                'is_available' => $validated['is_available'] ?? true,
                'available_tour_times' => $validated['available_tour_times'] ?? [],
                'max_advance_days' => $validated['max_advance_days'],
            ]);

            // Attach facilities
            if (!empty($validated['facilities'])) {
                $room->facilities()->attach($validated['facilities']);
            }

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $image) {
                    $path = $image->store('room-images', 'public');
                    
                    RoomImage::create([
                        'room_id' => $room->id,
                        'url' => '/storage/' . $path,
                        'is_primary' => $index === 0, // First image is primary
                    ]);
                }
            }

            return redirect()->route('dashboard.rooms.owned')
                ->with('success', 'Room created successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create room: ' . $e->getMessage()]);
        }
    }

    // Show edit form
    public function edit(Room $room)
    {
        // Check if user owns this room or is admin
        if ($room->owner_id !== Auth::id() && !Auth::user()->is_admin) {
            abort(403);
        }

        $facilities = Facility::select('id', 'name', 'description', 'icon')->get();
        
        $roomData = [
            'id' => $room->id,
            'name' => $room->name,
            'description' => $room->description,
            'address' => $room->address,
            'embedded_map_link' => $room->embedded_map_link,
            'price' => $room->price,
            'size' => $room->size,
            'max_occupancy' => $room->max_occupancy,
            'is_available' => $room->is_available,
            'available_tour_times' => $room->available_tour_times ?? [],
            'max_advance_days' => $room->max_advance_days,
            'facilities' => $room->facilities->pluck('id')->toArray(),
            'images' => $room->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => $image->url,
                    'is_primary' => $image->is_primary,
                ];
            })->toArray(),
        ];

        return Inertia::render('dashboard/room-form', [
            'facilities' => $facilities,
            'room' => $roomData
        ]);
    }

    // Update room
    public function update(Request $request, Room $room)
    {
        // Check if user owns this room or is admin
        if ($room->owner_id !== Auth::id() && !Auth::user()->is_admin) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string|max:500',
            'embedded_map_link' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'size' => 'required|numeric|min:1',
            'max_occupancy' => 'required|integer|min:1',
            'is_available' => 'boolean',
            'available_tour_times' => 'nullable|array',
            'max_advance_days' => 'required|integer|min:1|max:30',
            'facilities' => 'nullable|array',
            'facilities.*' => 'exists:facilities,id',
            'new_images' => 'nullable|array',
            'new_images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'integer',
        ]);

        try {
            $room->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'address' => $validated['address'],
                'embedded_map_link' => $validated['embedded_map_link'] ?? null,
                'price' => $validated['price'],
                'size' => $validated['size'],
                'max_occupancy' => $validated['max_occupancy'],
                'is_available' => $validated['is_available'] ?? true,
                'available_tour_times' => $validated['available_tour_times'] ?? [],
                'max_advance_days' => $validated['max_advance_days'],
            ]);

            // Update facilities
            $room->facilities()->sync($validated['facilities'] ?? []);

            // Handle deleted images
            if (!empty($validated['deleted_images'])) {
                $imagesToDelete = RoomImage::whereIn('id', $validated['deleted_images'])->get();
                foreach ($imagesToDelete as $image) {
                    // Delete file from storage
                    $imagePath = str_replace('/storage/', '', $image->url);
                    Storage::disk('public')->delete($imagePath);
                    // Delete from database
                    $image->delete();
                }
            }

            // Handle new image uploads
            if ($request->hasFile('new_images')) {
                $existingImagesCount = $room->images()->count();
                foreach ($request->file('new_images') as $index => $image) {
                    $path = $image->store('room-images', 'public');
                    
                    RoomImage::create([
                        'room_id' => $room->id,
                        'url' => '/storage/' . $path,
                        'is_primary' => $existingImagesCount === 0 && $index === 0,
                    ]);
                }
            }

            return redirect()->route('dashboard.rooms.owned')
                ->with('success', 'Room updated successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update room: ' . $e->getMessage()]);
        }
    }

    // Delete room
    public function destroy(Room $room)
    {
        // Check if user owns this room or is admin
        if ($room->owner_id !== Auth::id() && !Auth::user()->is_admin) {
            abort(403);
        }

        try {
            // Delete all room images from storage
            foreach ($room->images as $image) {
                $imagePath = str_replace('/storage/', '', $image->url);
                Storage::disk('public')->delete($imagePath);
            }

            // Delete room (cascade will handle related records)
            $room->delete();

            return back()->with('success', 'Room deleted successfully!');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete room: ' . $e->getMessage()]);
        }
    }
}