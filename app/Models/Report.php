<?php
// File: app/Models/Report.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    protected $fillable = [
        'reporter_id',
        'room_id',
        'type',
        'description',
        'status',
        'admin_notes',
    ];

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function getOwnerAttribute()
    {
        return $this->room?->owner;
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReportImage::class);
    }
}