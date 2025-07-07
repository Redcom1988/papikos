<?php
// Create: app/Http/Controllers/Dashboard/AppointmentController.php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AppointmentController extends Controller
{
    public function index()
    {
        $appointments = Appointment::whereHas('room', function ($query) {
                $query->where('owner_id', Auth::id());
            })
            ->with(['room.images', 'user'])
            ->orderBy('scheduled_at', 'desc')
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'scheduled_at' => $appointment->scheduled_at->toISOString(),
                    'status' => $appointment->status,
                    'notes' => $appointment->notes,
                    'created_at' => $appointment->created_at->toDateString(),
                    'user' => [
                        'id' => $appointment->user->id,
                        'name' => $appointment->user->name,
                        'email' => $appointment->user->email,
                        'phone' => $appointment->user->phone ?? null,
                    ],
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

        return Inertia::render('dashboard/appointments-owner-page', [
            'appointments' => $appointments
        ]);
    }

    public function cancel(Appointment $appointment)
    {
        // Check if user owns the room for this appointment
        if ($appointment->room->owner_id !== Auth::id()) {
            abort(403);
        }

        // Only allow cancellation of scheduled appointments
        if ($appointment->status !== 'scheduled') {
            return back()->withErrors([
                'message' => 'This appointment cannot be cancelled.'
            ]);
        }

        $appointment->update(['status' => 'cancelled']);

        return back()->with('success', 'Appointment cancelled successfully.');
    }

    public function complete(Appointment $appointment)
    {
        // Check if user owns the room for this appointment
        if ($appointment->room->owner_id !== Auth::id()) {
            abort(403);
        }

        // Only allow completion of scheduled appointments
        if ($appointment->status !== 'scheduled') {
            return back()->withErrors([
                'message' => 'This appointment cannot be completed.'
            ]);
        }

        $appointment->update(['status' => 'completed']);

        return back()->with('success', 'Appointment marked as completed.');
    }
}