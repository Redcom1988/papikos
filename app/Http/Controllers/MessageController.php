<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
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

    public function store(Request $request)
    {
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
    }

    public function getMessages($userId)
    {
        $authId = Auth::id();
        
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
    }

    public function getChatUsers()
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

        return response()->json($users);
    }

    public function getAllUsers()
    {
        $authId = Auth::id();
        
        $users = User::where('id', '!=', $authId)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }
}