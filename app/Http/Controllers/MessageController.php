<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\User;

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

    public function getMessages($userId)
    {
        try {
            $authId = Auth::id();
            
            // Validate that userId is numeric
            if (!is_numeric($userId)) {
                return response()->json(['error' => 'Invalid user ID'], 400);
            }
            
            // Check if the user exists
            $userExists = User::where('id', $userId)->exists();
            if (!$userExists) {
                return response()->json(['error' => 'User not found'], 404);
            }
            
            $messages = Message::where(function ($query) use ($authId, $userId) {
                $query->where('sender', $authId)
                    ->where('receiver', $userId);
            })->orWhere(function ($query) use ($authId, $userId) {
                $query->where('sender', $userId)
                    ->where('receiver', $authId);
            })
            ->orderBy('created_at', 'asc')
            ->get();

            return response()->json($messages);
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch messages: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch messages'], 500);
        }
    }
}