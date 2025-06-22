<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomFacility extends Model
{
    protected $fillable = ['room_id', 'facility_id'];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function facility()
    {
        return $this->belongsTo(Facility::class);
    }
}