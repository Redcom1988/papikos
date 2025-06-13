<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomFacility extends Model
{
    protected $fillable = ['room_id', 'name', 'description'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}