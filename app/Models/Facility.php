<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Facility extends Model
{
    protected $fillable = ['name', 'description'];

    public function rooms(): BelongsToMany
    {
        return $this->belongsToMany(Room::class, 'room_facilities');
    }
}
