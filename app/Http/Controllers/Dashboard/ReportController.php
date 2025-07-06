<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user || !$user->isOwner()) {
            abort(403, 'Unauthorized');
        }
        
        // Get reports for rooms owned by the current user
        $reports = Report::with(['reporter', 'room', 'images'])
            ->whereHas('room', function($query) use ($user) {
                $query->where('owner_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        // Transform the data for Inertia
        $reports->getCollection()->transform(function ($report) {
            return [
                'id' => $report->id,
                'type' => $report->type,
                'description' => $report->description,
                'status' => $report->status,
                'admin_notes' => $report->admin_notes,
                'owner_response' => $report->owner_response,
                'owner_response_action' => $report->owner_response_action,
                'owner_responded_at' => $report->owner_responded_at?->toISOString(),
                'created_at' => $report->created_at->toISOString(),
                'reporter' => [
                    'id' => $report->reporter->id,
                    'name' => $report->reporter->name,
                    'email' => $report->reporter->email,
                ],
                'room' => [
                    'id' => $report->room->id,
                    'name' => $report->room->name,
                    'address' => $report->room->address,
                ],
                'images' => $report->images->map(function ($image) {
                    return [
                        'id' => $image->id,
                        'url' => $image->url,
                    ];
                })->toArray(),
            ];
        });

        return Inertia::render('dashboard/reports-page', [
            'reports' => $reports
        ]);
    }

    public function respond(Request $request, Report $report)
    {
        $user = $request->user();
        
        if (!$user || !$user->isOwner()) {
            abort(403, 'Unauthorized');
        }

        // Check if the user owns the room
        if ($report->room->owner_id !== $user->id) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'action' => 'required|in:issue_resolved,listing_updated,additional_info,dispute',
            'response' => 'required|string|max:1000',
        ]);

        $report->update([
            'owner_response' => $request->response,
            'owner_response_action' => $request->action,
            'owner_responded_at' => now(),
            'status' => $request->action === 'issue_resolved' ? 'resolved' : $report->status,
        ]);

        return back()->with('success', 'Response submitted successfully.');
    }
}