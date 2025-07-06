<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Room;
use App\Models\Report;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function dashboard()
    {
        // Check if user is admin
        if (Auth::user()->role !== 'admin') {
            abort(403);
        }

        $stats = [
            'users' => $this->getUserStats(),
            'rooms' => $this->getRoomStats(),
            'reports' => $this->getReportStats(),
        ];

        return Inertia::render('dashboard/admin-dashboard', [
            'stats' => $stats
        ]);
    }

    private function getUserStats()
    {
        $total = User::count();
        $owners = User::where('role', 'owner')->count();
        $renters = User::where('role', 'renter')->count();
        $newThisMonth = User::where('created_at', '>=', Carbon::now()->startOfMonth())->count();

        return [
            'total' => $total,
            'owners' => $owners,
            'renters' => $renters,
            'new_this_month' => $newThisMonth,
        ];
    }

    private function getRoomStats()
    {
        $total = Room::count();
        $available = Room::where('is_available', true)->count();
        $occupied = Room::where('is_available', false)->count();
        $newThisMonth = Room::where('created_at', '>=', Carbon::now()->startOfMonth())->count();
        $totalValue = Room::sum('price');

        return [
            'total' => $total,
            'available' => $available,
            'occupied' => $occupied,
            'new_this_month' => $newThisMonth,
            'total_value' => $totalValue,
        ];
    }

    private function getReportStats()
    {
        $total = Report::count();
        $pending = Report::where('status', 'pending')->count();
        $investigating = Report::where('status', 'investigating')->count();
        $resolved = Report::where('status', 'resolved')->count();
        $unresolved = $pending + $investigating;

        return [
            'total' => $total,
            'pending' => $pending,
            'investigating' => $investigating,
            'resolved' => $resolved,
            'unresolved' => $unresolved,
        ];
    }
}