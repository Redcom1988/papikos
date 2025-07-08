<?php

use App\Http\Controllers\{
    DashboardController,
    BookmarkController,
    HomeController,
    RoomController,
    RoomListingsController,
    MessageController,
    ReportController,
    AppointmentController
};
use App\Http\Controllers\Dashboard\{
    MessageController as DashboardMessageController,
    ReportController as DashboardReportController,
    RoomController as DashboardRoomController,
    AppointmentController as DashboardAppointmentController,
    UserController as DashboardUserController
};
use Illuminate\Support\Facades\Route;

// Public Routes
Route::get('/', [HomeController::class, 'index'])->name('landing.page');
Route::get('/rooms', [RoomListingsController::class, 'index'])->name('rooms.index');
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('room.show');
Route::get('/rooms/{room}/reports', [RoomController::class, 'showReports'])->name('room.reports');
Route::get('/api/rooms/{room}', [RoomController::class, 'getRoomDetails'])->name('room.details');
Route::post('/api/tours/book', [RoomController::class, 'bookTour'])->name('tour.book')->middleware('auth');

// Authenticated User Routes
Route::middleware('auth')->group(function () {
    // Bookmarks
    Route::controller(BookmarkController::class)->group(function () {
        Route::post('/bookmarks/toggle', 'toggle')->name('bookmarks.toggle');
        Route::get('/bookmarks', 'index')->name('bookmarks.index');
    });

    // Appointments
    Route::controller(AppointmentController::class)->group(function () {
        Route::post('/appointments', 'store')->name('appointments.store');
        Route::get('/appointments', 'index')->name('appointments.index');
        Route::delete('/appointments/{appointment}', 'destroy')->name('appointments.destroy');
    });

    // Reports
    Route::controller(ReportController::class)->group(function () {
        Route::get('/reports', 'index')->name('reports.index');
        Route::get('/reports/create/{room}', 'create')->name('reports.create');
        Route::post('/reports', 'store')->name('reports.store');
        Route::get('/reports/{report}', 'show')->name('reports.show');
    });

    // Messages (public/user)
    Route::controller(MessageController::class)->group(function () {
        Route::post('/messages', 'store')->name('messages.store');
        Route::get('/messages/{userId}', 'getMessages')->name('messages.get');
    });

    // API Chat Users (for mobile chat)
    Route::prefix('api')->group(function () {
        Route::get('/chat-users', [DashboardMessageController::class, 'getChatUsers']);
        Route::get('/users', [DashboardMessageController::class, 'getAllUsers']);
    });
});

Route::middleware(['auth', 'verified'])->prefix('dashboard')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
});

// Dashboard Routes (shared)
Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    

    // Dashboard messages
    Route::controller(DashboardMessageController::class)->prefix('messages')->group(function () {
        Route::get('/', 'index')->name('');
        Route::get('/users', 'getChatUsers');
        Route::get('/all-users', 'getAllUsers');
        Route::get('/{userId}', 'getMessages');
    });

    // Dashboard rooms
    Route::controller(DashboardRoomController::class)->prefix('rooms')->group(function () {
        Route::get('/create', 'create')->name('rooms.create');
        Route::post('/', 'store')->name('rooms.store');
        Route::get('/{room}/edit', 'edit')->name('rooms.edit');
        Route::put('/{room}', 'update')->name('rooms.update');
        Route::delete('/{room}', 'destroy')->name('rooms.destroy');
    });
});

// Owner Dashboard Routes
Route::middleware(['auth', 'verified', 'role:owner'])->prefix('dashboard')->name('dashboard.')->group(function () {
    // Reports
    Route::controller(DashboardReportController::class)->group(function () {
        Route::get('/reports', 'index')->name('reports');
        Route::post('/reports/{report}/respond', 'respond')->name('reports.respond');
    });

    // Appointments
    Route::controller(DashboardAppointmentController::class)->group(function () {
        Route::get('/appointments', 'index')->name('appointments');
        Route::patch('/appointments/{appointment}/cancel', 'cancel')->name('appointments.cancel');
        Route::patch('/appointments/{appointment}/complete', 'complete')->name('appointments.complete');
    });

    // Owned Rooms
    Route::get('/rooms-owned', [DashboardRoomController::class, 'index'])->name('rooms.owned');
});

// Admin Dashboard Routes
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('dashboard')->name('dashboard.')->group(function () {
    // Reports
    Route::controller(DashboardReportController::class)->group(function () {
        Route::get('/reports-admin', 'admin')->name('reports.admin');
        Route::patch('/reports/{report}/status', 'updateStatus')->name('reports.updateStatus');
    });

    // All Rooms
    Route::get('/rooms-all', [DashboardRoomController::class, 'all'])->name('rooms.all');

    // Users
    Route::controller(DashboardUserController::class)->prefix('users')->group(function () {
        Route::get('/', 'index')->name('users');
        Route::get('/{user}/edit', 'edit')->name('users.edit');
        Route::put('/{user}', 'update')->name('users.update');
        Route::delete('/{user}', 'destroy')->name('users.destroy');
        Route::post('/', 'store')->name('users.store');
    });
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';