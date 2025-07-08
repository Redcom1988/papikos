<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index()
    {
        $authId = Auth::id();
        
        $userIds = Message::where('sender', $authId)
            ->orWhere('receiver', $authId)
            ->get(['sender', 'receiver'])
            ->flatMap(function ($message) use ($authId) {
                return [$message->sender, $message->receiver];
            })
            ->unique()
            ->filter(function ($id) use ($authId) {
                return $id !== $authId;
            });

        $users = User::whereIn('id', $userIds)
            ->select('id', 'name', 'email')
            ->get();

        return Inertia::render('dashboard/messages-page', [
            'users' => $users
        ]);
    }

    public function getChatUsers()
    {
        try {
            $authId = Auth::id();
            
            $userIds = Message::where('sender', $authId)
                ->orWhere('receiver', $authId)
                ->get(['sender', 'receiver'])
                ->flatMap(function ($message) use ($authId) {
                    return [$message->sender, $message->receiver];
                })
                ->unique()
                ->filter(function ($id) use ($authId) {
                    return $id !== $authId;
                });

            $users = User::whereIn('id', $userIds)
                ->select('id', 'name', 'email')
                ->get();

            return response()->json($users);
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch chat users: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch users'], 500);
        }
    }

    public function getAllUsers()
    {
        try {
            $authId = Auth::id();
            
            $users = User::where('id', '!=', $authId)
                ->select('id', 'name', 'email')
                ->orderBy('name')
                ->get();

            return response()->json($users);
            
        } catch (\Exception $e) {
            Log::error('Failed to fetch all users: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch users'], 500);
        }
    }
}