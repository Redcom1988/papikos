<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayoutMethod extends Model
{
    protected $fillable = [
        'owner_id',
        'type',
        'account_identifier',
        'account_name',
        'bank_code',
        'is_primary',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function transfers()
    {
        return $this->hasMany(Transfer::class);
    }
}