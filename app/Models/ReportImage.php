<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportImage extends Model
{
    protected $fillable = [
        'report_id',
        'url',
    ];

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    // Helper to get full URL if needed
    public function getFullUrlAttribute(): string
    {
        // If URL is already full URL, return as is
        if (str_starts_with($this->url, 'http')) {
            return $this->url;
        }
        
        // Otherwise, prepend app URL
        return url($this->url);
    }
}