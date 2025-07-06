<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomListingsController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\Dashboard\ReportsController;
use App\Http\Controllers\ReportController;
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

    // Report routes for users/renters
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/create/{room}', [ReportController::class, 'create'])->name('reports.create');
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');
    Route::get('/reports/{report}', [ReportController::class, 'show'])->name('reports.show');

    // Message routes - Keep original for mobile chat compatibility
    Route::prefix('messages')->group(function () {
        Route::get('/{userId}', [MessageController::class, 'getMessages'])->name('messages.get');
        Route::post('/', [MessageController::class, 'store'])->name('messages.store');
    });

    // Dashboard message routes - Add dashboard-specific route
    Route::get('/dashboard/messages', [MessageController::class, 'index'])->name('dashboard.messages.index');

    // Mobile chat API
    Route::get('/api/chat-users', [MessageController::class, 'getChatUsers']);
    Route::get('/api/users', [MessageController::class, 'getAllUsers']);
});

// Individual room routes
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('room.show');
Route::get('/rooms/{room}/reports', [RoomController::class, 'showReports'])->name('room.reports');
Route::get('/api/rooms/{room}', [RoomController::class, 'getRoomDetails'])->name('room.details');
Route::post('/api/tours/book', [RoomController::class, 'bookTour'])->name('tour.book')->middleware('auth');

// Dashboard routes for owners
Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::get('/reports', [ReportsController::class, 'index'])->name('dashboard.reports');
    Route::post('/reports/{report}/respond', [ReportsController::class, 'respond'])->name('dashboard.reports.respond');
});

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';