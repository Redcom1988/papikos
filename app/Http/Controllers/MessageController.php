<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MessageController extends Controller
{
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'message' => 'required|string|max:1000',
                'receiver' => 'required|exists:users,id',
            ]);

            $message = Message::create([
                'message' => $validated['message'],
                'sender' => Auth::id(),
                'receiver' => $validated['receiver'],
            ]);

            return response()->json($message);
            
        } catch (\Exception $e) {
            Log::error('Failed to store message: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to send message'], 500);
        }
    }
}