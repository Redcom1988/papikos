<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        // Add auth check
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'room_id' => 'required|exists:rooms,id',
            'type' => 'required|in:inappropriate_content,fake_listing,fraud,safety_concern,other',
            'description' => 'required|string|max:1000',
            'images.*' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048', // Max 2MB per image
        ]);

        // Create the report
        $report = Report::create([
            'reporter_id' => Auth::id(), 
            'room_id' => $request->room_id,
            'type' => $request->type,
            'description' => $request->description,
            'status' => 'pending',
        ]);

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                // Generate unique filename
                $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
                
                // Store the image in public/storage/report-images
                $path = $image->storeAs('report-images', $filename, 'public');
                
                // Save image record with full URL
                ReportImage::create([
                    'report_id' => $report->id,
                    'url' => Storage::url($path), // This creates /storage/report-images/filename.jpg
                ]);
            }
        }

        return response()->json([
            'message' => 'Report submitted successfully',
            'report_id' => $report->id
        ]);
    }

    public function index(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        $query = Report::with(['reporter', 'room', 'images']);
        
        // If owner, only show reports about their rooms
        if ($user->isOwner()) {
            $query->whereHas('room', function($q) use ($user) {
                $q->where('owner_id', $user->id);
            });
        }
        // TODO: Add admin check for viewing all reports
        
        $reports = $query->orderBy('created_at', 'desc')->paginate(15);
        
        return response()->json($reports);
    }

    public function show(Report $report)
    {
        $user = $report->user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        // Check if user can view this report
        if ($user->isOwner() && $report->room->owner_id !== $user->id) {
            abort(403, 'Unauthorized');
        }
        
        $report->load(['reporter', 'room', 'images']);
        
        return response()->json($report);
    }

    public function update(Request $request, Report $report)
    {
        $user = Auth::user();
        
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
        
        // Only allow status updates for now
        $request->validate([
            'status' => 'required|in:pending,investigating,resolved,dismissed',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $report->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
        ]);

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report->fresh(['reporter', 'room', 'images'])
        ]);
    }

    // Add method for owner responses
    public function respond(Request $request, Report $report)
    {
        $user = $request->user();
        
        if (!$user || !$user->isOwner()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if user owns the reported room
        if ($report->room->owner_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
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

        return response()->json([
            'message' => 'Response submitted successfully',
            'report' => $report->fresh(['reporter', 'room', 'images'])
        ]);
    }
}