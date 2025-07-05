<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

        protected $visible = [
        'id',
        'name', 
        'email',
        'role', 
        'email_verified_at',
        'created_at',
        'updated_at'
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN->value;
    }

    public function isOwner(): bool
    {
        return $this->role === UserRole::OWNER->value;
    }

    public function isRenter(): bool
    {
        return $this->role === UserRole::RENTER->value;
    }

    public function rooms()
    {
        return $this->hasMany(Room::class, 'owner_id');
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function bookmarkedRooms()
    {
        return $this->belongsToMany(Room::class, 'bookmarks');
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }
}