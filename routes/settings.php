<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware('auth')->group(function () {
    // Standalone settings (accessible to all users)
    Route::redirect('settings', 'settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
    Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance');

    // Dashboard settings (for users with dashboard access)
    Route::prefix('dashboard/settings')->middleware(['auth', 'verified'])->group(function () {
        Route::redirect('/', 'profile');

        Route::get('profile', [ProfileController::class, 'editDashboard'])->name('dashboard.profile.edit');
        Route::patch('profile', [ProfileController::class, 'update'])->name('dashboard.profile.update');
        Route::delete('profile', [ProfileController::class, 'destroy'])->name('dashboard.profile.destroy');

        Route::get('password', [PasswordController::class, 'editDashboard'])->name('dashboard.password.edit');
        Route::put('password', [PasswordController::class, 'update'])->name('dashboard.password.update');

        Route::get('appearance', function () {
            return Inertia::render('dashboard/settings/appearance');
        })->name('dashboard.appearance');
    });
});
