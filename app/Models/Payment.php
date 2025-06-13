<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'user_id',
        'owner_id',
        'room_id',
        'amount',
        'platform_fee',
        'owner_amount',
        'doku_invoice_id',
        'doku_transaction_id',
        'payment_status',
        'paid_at',
        'transfer_status',
        'transferred_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'platform_fee' => 'integer',
            'owner_amount' => 'integer',
            'paid_at' => 'datetime',
            'transferred_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }
}