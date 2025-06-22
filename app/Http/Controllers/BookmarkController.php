<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Bookmark;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class BookmarkController extends Controller
{
    public function toggle(Request $request)
    {
        Log::info('Bookmark toggle request received', ['request_data' => $request->all()]);

        try {
            $request->validate([
                'room_id' => 'required|exists:rooms,id',
            ]);

            $userId = Auth::id();
            $roomId = $request->room_id;

            Log::info('Bookmark toggle for user', ['user_id' => $userId, 'room_id' => $roomId]);

            $bookmark = Bookmark::where('user_id', $userId)
                ->where('room_id', $roomId)
                ->first();

            if ($bookmark) {
                $bookmark->delete();
                Log::info('Bookmark removed');
                $message = 'Bookmark removed';
                $bookmarked = false;
            } else {
                Bookmark::create([
                    'user_id' => $userId,
                    'room_id' => $roomId,
                ]);
                Log::info('Bookmark added');
                $message = 'Bookmark added';
                $bookmarked = true;
            }

            return back()->with('success', $message);
        } catch (\Exception $e) {
            Log::error('Bookmark toggle error', ['error' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to toggle bookmark']);
        }
    }

    public function index()
    {
        try {
            $bookmarks = Bookmark::where('user_id', Auth::id())
                ->with('room')
                ->get();

            // For AJAX requests, return JSON
            if (request()->wantsJson()) {
                return response()->json(['bookmarks' => $bookmarks]);
            }

            // For regular page requests, you can create a bookmarks page later
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Failed to fetch bookmarks', ['error' => $e->getMessage()]);
            
            if (request()->wantsJson()) {
                return response()->json(['error' => 'Failed to fetch bookmarks'], 500);
            }
            
            return back()->withErrors(['error' => 'Failed to fetch bookmarks']);
        }
    }
}
