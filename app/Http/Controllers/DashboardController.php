<?php
// File: app/Http/Controllers/DashboardController.php

namespace App\Http\Controllers;

use App\Models\Room;
use App\Models\Appointment;
use App\Models\User;
use App\Models\Report;
use App\Enums\UserRole;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            return $this->adminDashboard();
        } elseif ($user->isOwner()) {
            return $this->ownerDashboard($user);
        } else {
            return app(RoomListingsController::class)->index($request);
        }
    }

    private function adminDashboard(): Response
    {
        $allUsers = User::all();
        $owners = User::where('role', UserRole::OWNER)->get();
        $renters = User::where('role', UserRole::RENTER)->get();
        $allRooms = Room::all();

        $reports = Report::with(['reporter', 'room'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'user_name' => $report->reporter->name,
                    'room_name' => $report->room->name,
                    'type' => $report->type,
                    'status' => $report->status,
                    'description' => $report->description,
                    'created_at' => $report->created_at,
                ];
            });

        return Inertia::render('dashboard/admin-dashboard', [
            'stats' => [
                'users' => [
                    'total' => $allUsers->count(),
                    'owners' => $owners->count(),
                    'renters' => $renters->count(),
                    'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
                ],
                'rooms' => [
                    'total' => $allRooms->count(),
                    'available' => $allRooms->where('is_available', true)->count(),
                    'occupied' => $allRooms->where('is_available', false)->count(),
                    'new_this_month' => Room::where('created_at', '>=', now()->startOfMonth())->count(),
                    'total_value' => $allRooms->sum('price'),
                ],
                'reports' => [
                    'total' => Report::count(),
                    'pending' => Report::where('status', 'pending')->count(),
                    'investigating' => Report::where('status', 'investigating')->count(),
                    'resolved' => Report::where('status', 'resolved')->count(),
                    'unresolved' => Report::whereIn('status', ['pending', 'investigating'])->count(),
                ],
            ],
            'reports' => $reports,
            'owners' => $owners->map(function ($owner) {
                return [
                    'id' => $owner->id,
                    'name' => $owner->name,
                    'email' => $owner->email,
                    'role' => $owner->role,
                    'created_at' => $owner->created_at,
                    'rooms_count' => $owner->rooms()->count(),
                ];
            }),
            'renters' => $renters->map(function ($renter) {
                return [
                    'id' => $renter->id,
                    'name' => $renter->name,
                    'email' => $renter->email,
                    'role' => $renter->role,
                    'created_at' => $renter->created_at,
                    'appointments_count' => $renter->appointments()->count(),
                ];
            }),
        ]);
    }

    private function ownerDashboard($user): Response
    {
        $rooms = Room::where('owner_id', $user->id)->get();
        $roomIds = $rooms->pluck('id');
        $appointments = $roomIds->isNotEmpty() 
            ? Appointment::whereIn('room_id', $roomIds)
                ->with(['user', 'room'])
                ->orderBy('scheduled_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($appointment) {
                    return [
                        'id' => $appointment->id,
                        'user_name' => $appointment->user->name,
                        'room_name' => $appointment->room->name,
                        'scheduled_at' => $appointment->scheduled_at,
                        'status' => $appointment->status,
                        'notes' => $appointment->notes,
                    ];
                })
            : collect([]);
        
        return Inertia::render('dashboard/owner-dashboard', [
            'stats' => [
                'total_rooms' => $rooms->count(),
                'available_rooms' => $rooms->where('is_available', true)->count(),
                'occupied_rooms' => $rooms->where('is_available', false)->count(),
                'upcoming_appointments' => $appointments->where('status', 'scheduled')->count(),
            ],
            'appointments' => $appointments,
        ]);
    }
}