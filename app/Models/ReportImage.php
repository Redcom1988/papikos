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
}