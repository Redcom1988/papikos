<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'address',
        'embedded_map_link',
        'price',
        'size',
        'max_occupancy',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'price' => 'integer',
            'size' => 'integer',
            'max_occupancy' => 'integer',
        ];
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function facilities()
    {
        return $this->hasMany(RoomFacility::class);
    }

    public function images()
    {
        return $this->hasMany(RoomImage::class);
    }

    public function primaryImage()
    {
        return $this->hasOne(RoomImage::class)->where('is_primary', true);
    }

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function averageRating()
    {
        return $this->reviews()->avg('overall_rating');
    }

    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public static function getAvailableRooms($filters = [])
    {
        $query = self::with([
            'facilities', 
            'images', 
            'primaryImage', 
            'reviews'
        ])
        ->where('is_available', true);

        // Apply price filters
        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }

        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        // Apply facility filters
        if (!empty($filters['facilities']) && is_array($filters['facilities'])) {
            $query->whereHas('facilities', function ($q) use ($filters) {
                $q->whereIn('name', $filters['facilities']);
            }, '=', count($filters['facilities']));
        }

        return $query->latest()->get()->map(function ($room) {
            return [
                'id' => $room->id,
                'title' => $room->name,
                'price' => $room->price,
                'location' => $room->address,
                'rating' => round($room->averageRating() ?? 0, 1),
                'reviewCount' => $room->reviews->count(),
                'images' => $room->images->pluck('url')->toArray(),
                'facilities' => $room->facilities->pluck('name')->toArray(),
                'description' => $room->description,
                'size' => $room->size,
                'max_occupancy' => $room->max_occupancy,
                'primary_image' => $room->primaryImage?->url,
                'available_tours' => ['09:00', '14:00', '16:00', '18:00'],
            ];
        });
    }

    public static function getRoomDetails($roomId)
    {
        $room = self::with([
            'facilities', 
            'images', 
            'reviews.user',
            'reviews.images',
            'owner'
        ])->findOrFail($roomId);

        return [
            'id' => $room->id,
            'title' => $room->name,
            'description' => $room->description,
            'price' => $room->price,
            'location' => $room->address,
            'embedded_map_link' => $room->embedded_map_link,
            'size' => $room->size,
            'max_occupancy' => $room->max_occupancy,
            'rating' => round($room->averageRating() ?? 0, 1),
            'reviewCount' => $room->reviews->count(),
            'images' => $room->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => $image->url,
                    'caption' => $image->caption,
                    'is_primary' => $image->is_primary,
                ];
            })->toArray(),
            'facilities' => $room->facilities->pluck('name')->toArray(),
            'owner' => [
                'id' => $room->owner->id,
                'name' => $room->owner->name,
                'phone' => $room->owner->phone ?? '',
            ],
            'reviews' => $room->reviews->map(function ($review) {
                return [
                    'id' => $review->id,
                    'user_name' => $review->user->name,
                    'overall_rating' => $review->overall_rating,
                    'cleanliness_rating' => $review->cleanliness_rating ?? 0,
                    'security_rating' => $review->security_rating ?? 0,
                    'comfort_rating' => $review->comfort_rating ?? 0,
                    'value_rating' => $review->value_rating ?? 0,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at->format('M d, Y'),
                    'images' => $review->images->pluck('url')->toArray(),
                ];
            })->toArray(),
            'available_tours' => ['09:00', '14:00', '16:00', '18:00'],
        ];
    }

    public static function getAllFacilities()
    {
        return RoomFacility::distinct('name')->pluck('name')->toArray();
    }
}
