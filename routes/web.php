<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\RoomListingsController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\Dashboard\MessageController as DashboardMessageController;
use App\Http\Controllers\Dashboard\ReportController as DashboardReportController;
use App\Http\Controllers\Dashboard\RoomController as DashboardRoomController;
use App\Http\Controllers\Dashboard\AppointmentController as DashboardAppointmentController;
use Illuminate\Support\Facades\Route;

// Home/Landing page
Route::get('/', [HomeController::class, 'index'])->name('landing.page');

// Room listings page
Route::get('/rooms', [RoomListingsController::class, 'index'])->name('rooms.index');

// Individual room routes
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('room.show');
Route::get('/rooms/{room}/reports', [RoomController::class, 'showReports'])->name('room.reports');
Route::get('/api/rooms/{room}', [RoomController::class, 'getRoomDetails'])->name('room.details');
Route::post('/api/tours/book', [RoomController::class, 'bookTour'])->name('tour.book')->middleware('auth');

Route::middleware('auth')->group(function () {
    // Bookmarks routes
    Route::post('/bookmarks/toggle', [BookmarkController::class, 'toggle'])->name('bookmarks.toggle');
    Route::get('/bookmarks', [BookmarkController::class, 'index'])->name('bookmarks.index');

    // Appointment routes
    Route::post('/appointments', [AppointmentController::class, 'store'])->name('appointments.store');
    Route::get('/appointments', [AppointmentController::class, 'index'])->name('appointments.index');
    Route::delete('/appointments/{appointment}', [AppointmentController::class, 'destroy'])->name('appointments.destroy');

    // Report routes for users/renters
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/create/{room}', [ReportController::class, 'create'])->name('reports.create');
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');
    Route::get('/reports/{report}', [ReportController::class, 'show'])->name('reports.show');

    // API Message routes (for sending messages)
    Route::post('/messages', [MessageController::class, 'store'])->name('messages.store');
    
    // Mobile chat API routes
    Route::get('/api/chat-users', [DashboardMessageController::class, 'getChatUsers']);
    Route::get('/api/users', [DashboardMessageController::class, 'getAllUsers']);
    
    // Message fetching route (used by both dashboard and mobile chat)
    Route::get('/messages/{userId}', [DashboardMessageController::class, 'getMessages'])->name('messages.get');

});

// Dashboard routes
Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    // Dashboard main
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
    
    // Dashboard reports
    Route::get('/reports', [DashboardReportController::class, 'index'])->name('dashboard.reports');
    Route::get('/reports-status', [DashboardReportController::class, 'admin'])->name('dashboard.reports.status');
    Route::post('/reports/{report}/respond', [DashboardReportController::class, 'respond'])->name('dashboard.reports.respond');
    
    // Dashboard messages
    Route::get('/messages', [DashboardMessageController::class, 'index'])->name('dashboard.messages');
    Route::get('/messages/users', [DashboardMessageController::class, 'getChatUsers']);
    Route::get('/messages/all-users', [DashboardMessageController::class, 'getAllUsers']);
    Route::get('/messages/{userId}', [DashboardMessageController::class, 'getMessages']);

        // Owner appointment routes
    Route::get('/appointments', [DashboardAppointmentController::class, 'index'])->name('dashboard.appointments');
    Route::patch('/appointments/{appointment}/cancel', [DashboardAppointmentController::class, 'cancel'])->name('dashboard.appointments.cancel');
    Route::patch('/appointments/{appointment}/complete', [DashboardAppointmentController::class, 'complete'])->name('dashboard.appointments.complete');
    
    // Dashboard rooms
    Route::get('/rooms-owned', [DashboardRoomController::class, 'index'])->name('dashboard.rooms.owned');
    Route::get('/rooms-all', [DashboardRoomController::class, 'all'])->name('dashboard.rooms.all');
    Route::get('/rooms/create', [DashboardRoomController::class, 'create'])->name('dashboard.rooms.create');
    Route::post('/rooms', [DashboardRoomController::class, 'store'])->name('dashboard.rooms.store');
    Route::get('/rooms/{room}/edit', [DashboardRoomController::class, 'edit'])->name('dashboard.rooms.edit');
    Route::put('/rooms/{room}', [DashboardRoomController::class, 'update'])->name('dashboard.rooms.update');
    Route::delete('/rooms/{room}', [DashboardRoomController::class, 'destroy'])->name('dashboard.rooms.destroy');
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';