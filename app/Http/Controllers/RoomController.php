<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Appointment;
use App\Models\Bookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function show(Request $request, $roomId): Response
    {
        try {
            // Load the room with all relationships including reports
            $room = Room::with([
                'owner', 
                'images', 
                'facilities',
                'reports' => function($query) {
                    $query->with(['reporter', 'images'])
                          ->where('status', '!=', 'dismissed')
                          ->orderBy('created_at', 'desc')
                          ->limit(5);
                }
            ])->findOrFail($roomId);

            // Add the missing user bookmarks functionality
            $userBookmarks = [];
            if (Auth::check()) {
                $userBookmarks = Bookmark::where('user_id', Auth::id())
                    ->pluck('room_id')
                    ->toArray();
            }

            // Generate available tour slots (you might need to implement this method)
            $availableTours = $this->generateAvailableTourSlots();

            return Inertia::render('room-details-page', [
                'room' => [
                    'id' => $room->id,
                    'title' => $room->name,
                    'description' => $room->description,
                    'price' => $room->price,
                    'address' => $room->address,
                    'embedded_map_link' => $room->embedded_map_link,
                    'available_tours' => $availableTours,
                    'images' => $room->images->map(function ($image) {
                        return [
                            'id' => $image->id,
                            'url' => $image->url,
                            'alt' => 'Room image',
                        ];
                    }),
                    'owner' => [
                        'id' => $room->owner->id,
                        'name' => $room->owner->name,
                        'email' => $room->owner->email,
                        'phone' => $room->owner->phone ?? null,
                        'avatar' => $room->owner->avatar ?? null,
                    ],
                    'facilities' => $room->facilities->map(function ($facility) {
                        return [
                            'id' => $facility->id,
                            'name' => $facility->name,
                            'icon' => $facility->icon ?? null,
                        ];
                    }),
                    'reports' => $room->reports->map(function ($report) {
                        return [
                            'id' => $report->id,
                            'type' => $report->type,
                            'description' => $report->description,
                            'status' => $report->status,
                            'owner_response' => $report->owner_response,
                            'owner_response_action' => $report->owner_response_action,
                            'owner_responded_at' => $report->owner_responded_at,
                            'created_at' => $report->created_at->format('M j, Y'),
                            'reporter' => [
                                'name' => $report->reporter->name,
                            ],
                            'images' => $report->images->map(function ($image) {
                                return [
                                    'id' => $image->id,
                                    'url' => $image->url,
                                ];
                            }),
                        ];
                    }),
                ],
                'userBookmarks' => $userBookmarks,
            ]);
        } catch (\Exception $e) {
            abort(404, 'Room not found');
        }
    }

    private function generateAvailableTourSlots()
    {
        // Implement your tour slot generation logic here
        // For now, returning empty array
        return [];
    }

    public function getRoomDetails(Request $request, $roomId)
    {
        try {
            $roomDetails = Room::getRoomDetails($roomId);
            return response()->json($roomDetails);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Room not found'], 404);
        }
    }

    public function bookTour(Request $request)
    {
        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'scheduled_at' => 'required|date|after:now',
            'notes' => 'nullable|string|max:500',
        ]);

        if (!Auth::check()) {
            return response()->json(['error' => 'Authentication required'], 401);
        }

        // Check if user already has an appointment for this room
        $existingAppointment = Appointment::where('user_id', Auth::id())
            ->where('room_id', $request->room_id)
            ->where('status', 'pending')
            ->first();

        if ($existingAppointment) {
            return response()->json(['error' => 'You already have a pending appointment for this room'], 400);
        }

        $appointment = Appointment::create([
            'user_id' => Auth::id(),
            'room_id' => $request->room_id,
            'scheduled_at' => $request->scheduled_at,
            'status' => 'pending',
            'notes' => $request->notes,
        ]);

        return response()->json([
            'message' => 'Tour appointment booked successfully',
            'appointment' => $appointment,
        ]);
    }

    public function showReports(Room $room)
    {
        $reports = $room->reports()
            ->with(['reporter', 'images'])
            ->where('status', '!=', 'dismissed')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('room-reports-page', [
            'room' => [
                'id' => $room->id,
                'title' => $room->name,
                'address' => $room->address,
            ],
            'reports' => [
                'data' => $reports->items(),
                'links' => $reports->linkCollection()->toArray(),
                'meta' => [
                    'current_page' => $reports->currentPage(),
                    'last_page' => $reports->lastPage(),
                    'per_page' => $reports->perPage(),
                    'total' => $reports->total(),
                ]
            ]
        ]);
    }
}
