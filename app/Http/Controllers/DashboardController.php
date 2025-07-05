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
            return app(RoomListingsController::class)->index($request);
        }
    }

    private function ownerDashboard($user): Response
    {
        return Inertia::render('owner-dashboard', [
            'rooms' => Room::where('owner_id', $user->id)->get(),
            'appointments' => Appointment::where('room_id', $user->rooms->pluck('id'))->get(),
            'bookmarks' => Bookmark::where('user_id', $user->id)->get(),
        ]);

        // Implement actual owner dashboard functionality like adding listings, edit listings, etc
    }
}