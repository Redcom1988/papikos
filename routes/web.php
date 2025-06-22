<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Home/Landing page
Route::get('/', [HomeController::class, 'index'])->name('landing.page');

// Room routes
Route::get('/rooms/{room}', [RoomController::class, 'show'])->name('room.show');
Route::get('/api/rooms/{room}', [RoomController::class, 'getRoomDetails'])->name('room.details');
Route::post('/api/tours/book', [RoomController::class, 'bookTour'])->name('tour.book')->middleware('auth');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    // Settings routes
    Route::prefix('settings')->group(function () {
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
        
        Route::get('/password', [PasswordController::class, 'edit'])->name('password.edit');
        Route::put('/password', [PasswordController::class, 'update'])->name('password.update');
        
        Route::get('/appearance', function () {
            return Inertia::render('settings/appearance');
        })->name('appearance.edit');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
