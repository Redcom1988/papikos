<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'sender', 
        'receiver', 
        'message'
    ];

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender');
    }
    
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver');
    }
}
