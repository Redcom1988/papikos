<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomListingsController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home/Landing page
Route::get('/', [HomeController::class, 'index'])->name('landing.page');

// Room listings page
Route::get('/rooms', [RoomListingsController::class, 'index'])->name('rooms.index');

Route::middleware('auth')->group(function () {
    // Bookmarks routes
    Route::post('/bookmarks/toggle', [BookmarkController::class, 'toggle'])->name('bookmarks.toggle');
    Route::get('/bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');

    // Report routes
    Route::prefix('reports')->group(function () {
        Route::post('/', [App\Http\Controllers\ReportController::class, 'store'])->name('reports.store');
        Route::get('/', [App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('/{report}', [App\Http\Controllers\ReportController::class, 'show'])->name('reports.show');
        Route::patch('/{report}', [App\Http\Controllers\ReportController::class, 'update'])->name('reports.update');
        Route::post('/{report}/respond', [App\Http\Controllers\ReportController::class, 'respond'])->name('reports.respond');
    });

    // Message routes
    Route::prefix('messages')->group(function () {
        Route::get('/', [MessageController::class, 'index'])->name('messages.index');
        Route::get('/{userId}', [MessageController::class, 'getMessages'])->name('messages.get');
        Route::post('/', [MessageController::class, 'store'])->name('messages.store');
    });

    // Mobile chat API
    Route::get('/api/chat-users', [MessageController::class, 'getChatUsers']);
    Route::get('/api/users', [MessageController::class, 'getAllUsers']);
});

// Individual room routes - kept in RoomController for room-specific operations
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('room.show');
Route::get('/api/rooms/{room}', [RoomController::class, 'getRoomDetails'])->name('room.details');
Route::post('/api/tours/book', [RoomController::class, 'bookTour'])->name('tour.book')->middleware('auth');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';