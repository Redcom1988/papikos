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
            // Keep using getRoomDetails as you originally had
            $room = Room::getRoomDetails($roomId);
            
            // Add the missing user bookmarks functionality
            $userBookmarks = [];
            if (Auth::check()) {
                $userBookmarks = Bookmark::where('user_id', Auth::id())
                    ->pluck('room_id')
                    ->toArray();
            }

            $reports = [];
            if (isset($room['reports']) && is_array($room['reports'])) {
                $reports = collect($room['reports'])->map(function ($report) {
                    return [
                        'id' => $report['id'],
                        'type' => $report['type'],
                        'description' => $report['description'],
                        'status' => $report['status'],
                        'owner_response' => $report['owner_response'],
                        'owner_response_action' => $report['owner_response_action'],
                        'owner_responded_at' => $report['owner_responded_at'],
                        'created_at' => \Carbon\Carbon::parse($report['created_at'])->format('M j, Y'),
                        'reporter' => [
                            'name' => $report['reporter']['name'],
                        ],
                        'images' => collect($report['images'])->map(function ($image) {
                            return [
                                'id' => $image['id'],
                                'url' => $image['url'],
                            ];
                        }),
                    ];
                });
            }

            return Inertia::render('room-details-page', [
                'room' => $room,
                'userBookmarks' => $userBookmarks,
                'reports' => $reports
            ]);
        } catch (\Exception $e) {
            abort(404, 'Room not found');
        }
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

        return Inertia::render('room-reports', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'address' => $room->address,
            ],
            'reports' => $reports
        ]);
    }
}
