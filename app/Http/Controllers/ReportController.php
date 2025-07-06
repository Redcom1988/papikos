<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportImage;
use App\Models\Room;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ReportController extends Controller
{
    /**
     * Show report form for a specific room
     */
    public function create(Room $room)
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        return Inertia::render('reports/create', [
            'room' => [
                'id' => $room->id,
                'name' => $room->name,
                'address' => $room->address,
                'owner' => [
                    'name' => $room->owner->name,
                ],
            ]
        ]);
    }

    /**
     * Store a new report (for renters/users)
     */
    public function store(Request $request)
    {
        if (!Auth::check()) {
            return redirect()->route('login')->with('error', 'You must be logged in to submit a report');
        }

        $validated = $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'type' => 'required|in:inappropriate_content,fake_listing,fraud,safety_concern,other',
            'description' => 'required|string|max:1000',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        try {
            // Create the report
            $report = Report::create([
                'reporter_id' => Auth::id(),
                'room_id' => $validated['room_id'],
                'type' => $validated['type'],
                'description' => $validated['description'],
                'status' => 'pending',
            ]);

            // Handle image uploads
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $filename = Str::random(40) . '.' . $image->getClientOriginalExtension();
                    $path = $image->storeAs('reports', $filename, 'public');
                    
                    ReportImage::create([
                        'report_id' => $report->id,
                        'url' => '/storage/' . $path,
                    ]);
                }
            }

            return back()->with('success', 'Report submitted successfully. We will review it shortly.');

        } catch (\Exception $e) {
            Log::error('Error creating report: ' . $e->getMessage());
            return back()->withErrors(['message' => 'An error occurred while submitting your report. Please try again.']);
        }
    }

    /**
     * Show user's own reports
     */
    public function index()
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $reports = Report::with(['room', 'images'])
            ->where('reporter_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('reports/index', [
            'reports' => $reports
        ]);
    }

    /**
     * Show specific report details
     */
    public function show(Report $report)
    {
        if (!Auth::check() || $report->reporter_id !== Auth::id()) {
            abort(403);
        }

        return Inertia::render('reports/show', [
            'report' => $report->load(['room', 'images'])
        ]);
    }
}