<?php
// File: app/Models/Report.php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_id',
        'room_id',
        'type',
        'description',
        'status',
        'admin_notes',
        'owner_response',
        'owner_response_action',
        'owner_responded_at',
    ];

    protected function casts(): array
    {
        return [
            'owner_responded_at' => 'datetime',
        ];
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReportImage::class);
    }

    public function getOwnerAttribute()
    {
        return $this->room->owner;
    }

    // Helper methods
    public function hasOwnerResponse(): bool
    {
        return !empty($this->owner_response);
    }

    public function isResolved(): bool
    {
        return $this->status === 'resolved';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}