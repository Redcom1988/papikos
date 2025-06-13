<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    protected $fillable = [
        'payment_id',
        'payout_method_id',
        'amount',
        'reference_id',
        'status',
        'failure_reason',
        'processed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'processed_at' => 'datetime',
        ];
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function payoutMethod()
    {
        return $this->belongsTo(PayoutMethod::class);
    }
}
