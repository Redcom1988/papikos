<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::where('user_id', Auth::id())
            ->with(['room.images'])
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(function ($appointment) {
                // Add logging to see what room data we're getting
                Log::info('Room data for appointment', [
                    'appointment_id' => $appointment->id,
                    'room_data' => $appointment->room->toArray()
                ]);

                return [
                    'id' => $appointment->id,
                    'scheduled_at' => $appointment->scheduled_at->toISOString(),
                    'status' => $appointment->status,
                    'notes' => $appointment->notes,
                    'created_at' => $appointment->created_at->toDateString(),
                    'room' => [
                        'id' => $appointment->room->id,
                        'name' => $appointment->room->name,
                        'address' => $appointment->room->address,
                        'price' => $appointment->room->price,
                        'formatted_price' => 'Rp ' . number_format($appointment->room->price, 0, ',', '.'),
                        'images' => $appointment->room->images->map(function ($image) {
                            return [
                                'id' => $image->id,
                                'url' => $image->url,
                                'is_primary' => $image->is_primary,
                            ];
                        })->toArray(),
                    ],
                ];
            });

        Log::info('Final appointments data', ['appointments' => $appointments->toArray()]);

        return Inertia::render('appointments-page', [
            'appointments' => $appointments
        ]);
    }

    public function store(Request $request)
    {
        Log::info('Appointment store request', [
            'user_id' => Auth::id(),
            'request_data' => $request->all()
        ]);

        // First, let's fix the datetime format issue
        $scheduledAt = $request->input('scheduled_at');
        
        // If the format is "YYYY-MM-DD HH:MM", add seconds
        if ($scheduledAt && !preg_match('/:\d{2}:\d{2}$/', $scheduledAt)) {
            $scheduledAt = $scheduledAt . ':00';
        }

        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'notes' => 'nullable|string|max:500',
        ], [
            'room_id.required' => 'Room selection is required.',
            'room_id.exists' => 'Selected room does not exist.',
            'notes.max' => 'Notes cannot exceed 500 characters.',
        ]);

        // Manually validate the datetime
        try {
            $appointmentTime = Carbon::createFromFormat('Y-m-d H:i:s', $scheduledAt);
            
            // Check if the appointment is in the future
            if ($appointmentTime->isPast()) {
                return back()->withErrors([
                    'message' => 'Appointment must be scheduled for a future time.'
                ]);
            }
            
            Log::info('Appointment time parsed', ['appointment_time' => $appointmentTime->toISOString()]);
        } catch (\Exception $e) {
            Log::error('Date parsing error', ['error' => $e->getMessage(), 'date' => $scheduledAt]);
            return back()->withErrors([
                'message' => 'Invalid date format provided. Please select a valid date and time.'
            ]);
        }

        Log::info('Validation passed', ['validated_data' => $validated, 'scheduled_at' => $appointmentTime]);

        // Verify the room exists and get room details
        $room = Room::find($validated['room_id']);
        if (!$room) {
            Log::error('Room not found', ['room_id' => $validated['room_id']]);
            return back()->withErrors([
                'message' => 'Room not found.'
            ]);
        }

        Log::info('Room found', ['room_id' => $room->id, 'room_name' => $room->name]); // Changed from room_title to room_name

        // Check if user already has a pending appointment for this room
        $existingAppointment = Appointment::where('user_id', Auth::id())
            ->where('room_id', $validated['room_id'])
            ->whereIn('status', ['scheduled']) // Changed from 'pending' to 'scheduled'
            ->first();

        if ($existingAppointment) {
            Log::info('Existing appointment found', ['appointment_id' => $existingAppointment->id]);
            return back()->withErrors([
                'message' => 'You already have a scheduled appointment for this room.'
            ]);
        }

        // Check if the selected time slot is still available
        $conflictingAppointment = Appointment::where('room_id', $validated['room_id'])
            ->where('scheduled_at', $appointmentTime)
            ->whereIn('status', ['scheduled']) // Changed from 'pending' to 'scheduled'
            ->first();

        if ($conflictingAppointment) {
            Log::info('Conflicting appointment found', ['appointment_id' => $conflictingAppointment->id]);
            return back()->withErrors([
                'message' => 'This time slot is no longer available. Please select another time.'
            ]);
        }

        // Create the appointment
        try {
            $appointmentData = [
                'user_id' => Auth::id(),
                'room_id' => $validated['room_id'],
                'scheduled_at' => $appointmentTime,
                'notes' => $validated['notes'],
                'status' => 'scheduled', // Changed from 'pending' to 'scheduled'
            ];

            Log::info('Creating appointment with data', ['appointment_data' => $appointmentData]);

            $appointment = Appointment::create($appointmentData);

            Log::info('Appointment created successfully', ['appointment_id' => $appointment->id]);

            return back()->with('success', 'Survey scheduled successfully!');
        } catch (\Exception $e) {
            Log::error('Error creating appointment', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'appointment_data' => $appointmentData ?? null
            ]);
            return back()->withErrors([
                'message' => 'Failed to schedule appointment. Please try again. Error: ' . $e->getMessage()
            ]);
        }
    }

    public function destroy(Appointment $appointment)
    {
        // Check if user owns this appointment
        if ($appointment->user_id !== Auth::id()) {
            abort(403);
        }

        // Only allow cancellation of scheduled appointments
        if (!in_array($appointment->status, ['scheduled'])) {
            return back()->withErrors([
                'message' => 'This appointment cannot be cancelled.'
            ]);
        }

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Appointment cancelled successfully.');
    }
}