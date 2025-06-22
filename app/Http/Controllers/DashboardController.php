<?php
// File: app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Payment;
use App\Models\Appointment;
use App\Models\Bookmark;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isOwner()) {
            return $this->ownerDashboard($user);
        } else {
            return $this->renterDashboard($user);
        }
    }

    private function ownerDashboard($user): Response
    {
        // Get owner statistics
        $stats = [
            'total_rooms' => $user->ownedRooms()->count(),
            'active_bookings' => Payment::where('owner_id', $user->id)
                ->where('payment_status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->count(),
            'monthly_revenue' => Payment::where('owner_id', $user->id)
                ->where('payment_status', 'paid')
                ->whereMonth('created_at', now()->month)
                ->sum('owner_amount'),
            'pending_payments' => Payment::where('owner_id', $user->id)
                ->where('transfer_status', 'pending')
                ->count(),
        ];

        // Get recent bookings
        $recent_bookings = Payment::with(['user', 'room'])
            ->where('owner_id', $user->id)
            ->where('payment_status', 'paid')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'room_name' => $payment->room->name,
                    'user_name' => $payment->user->name,
                    'amount' => $payment->amount,
                    'status' => $payment->payment_status,
                    'created_at' => $payment->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('dashboard/owner', [
            'stats' => $stats,
            'recent_bookings' => $recent_bookings,
        ]);
    }

    private function renterDashboard($user): Response
    {
        // Get bookmarked rooms
        $bookmarked_rooms = $user->bookmarks()
            ->with(['room.primaryImage'])
            ->latest()
            ->limit(6)
            ->get()
            ->map(function ($bookmark) {
                return [
                    'id' => $bookmark->room->id,
                    'name' => $bookmark->room->name,
                    'price' => $bookmark->room->price,
                    'address' => $bookmark->room->address,
                    'primary_image' => $bookmark->room->primaryImage?->url,
                ];
            });

        // Get recent appointments
        $recent_appointments = $user->appointments()
            ->with('room')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($appointment) {
                return [
                    'id' => $appointment->id,
                    'room_name' => $appointment->room->name,
                    'scheduled_at' => $appointment->scheduled_at->toISOString(),
                    'status' => $appointment->status,
                ];
            });

        // Get recent payments
        $recent_payments = $user->payments()
            ->with('room')
            ->where('payment_status', 'paid')
            ->latest()
            ->limit(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'room_name' => $payment->room->name,
                    'amount' => $payment->amount,
                    'status' => $payment->payment_status,
                    'paid_at' => $payment->paid_at->format('M d, Y'),
                ];
            });

        return Inertia::render('dashboard/renter', [
            'bookmarked_rooms' => $bookmarked_rooms,
            'recent_appointments' => $recent_appointments,
            'recent_payments' => $recent_payments,
        ]);
    }
}