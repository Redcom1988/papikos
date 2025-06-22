<?php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Appointment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
    public function show(Request $request, $roomId): Response
    {
        try {
            $roomDetails = Room::getRoomDetails($roomId);
            
            return Inertia::render('room-details-page', [
                'room' => $roomDetails,
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
}
