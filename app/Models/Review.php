<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'payment_id',
        'user_id',
        'room_id',
        'cleanliness_rating',
        'security_rating',
        'comfort_rating',
        'value_rating',
        'overall_rating',
        'comment',
    ];

    protected function casts(): array
    {
        return [
            'cleanliness_rating' => 'decimal:1',
            'security_rating' => 'decimal:1',
            'comfort_rating' => 'decimal:1',
            'value_rating' => 'decimal:1',
            'overall_rating' => 'decimal:1',
        ];
    }

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function images()
    {
        return $this->hasMany(ReviewImage::class);
    }

    // Auto-calculate overall rating when saving
    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($review) {
            $review->overall_rating = (
                $review->cleanliness_rating + 
                $review->security_rating + 
                $review->comfort_rating + 
                $review->value_rating
            ) / 4;
        });
    }
}