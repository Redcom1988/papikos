<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, 'room_facilities');
    }

    public function images(): HasMany
    {
        return $this->hasMany(RoomImage::class);
    }

    public function primaryImage(): HasOne
    {
        return $this->hasOne(RoomImage::class)->where('is_primary', true);
    }

    public function bookmarks(): HasMany
    {
        return $this->hasMany(Bookmark::class);
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function averageRating()
    {
        return $this->reviews()->avg('overall_rating') ?? 0;
    }

    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public static function getAvailableRooms($filters = [])
    {
        $query = self::with(['facilities', 'images', 'primaryImage', 'reviews'])
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
            });
        }

        return $query->latest()->take(6)->get()->map(function ($room) {
            return [
                'id' => $room->id,
                'title' => $room->name,
                'price' => $room->price,
                'location' => $room->address,
                'rating' => round($room->averageRating(), 1),
                'reviewCount' => $room->reviews->count(),
                'images' => $room->images->pluck('url')->toArray(),
                // Updated to return facility objects
                'facilities' => $room->facilities->map(function ($facility) {
                    return [
                        'id' => $facility->id,
                        'name' => $facility->name,
                        'description' => $facility->description,
                        'icon' => $facility->icon,
                    ];
                })->toArray(),
                'description' => $room->description,
                'availableTours' => ['09:00', '14:00', '16:00', '18:00'],
                'primary_image' => $room->primaryImage?->url,
                'size' => $room->size,
                'max_occupancy' => $room->max_occupancy,
            ];
        });
    }

    public static function getRoomDetails($roomId)
    {
        $room = self::with(['facilities', 'images', 'reviews.user', 'reviews.images', 'owner'])
            ->findOrFail($roomId);

        return [
            'id' => $room->id,
            'title' => $room->name,
            'description' => $room->description,
            'price' => $room->price,
            'location' => $room->address,
            'embedded_map_link' => $room->embedded_map_link,
            'size' => $room->size,
            'max_occupancy' => $room->max_occupancy,
            'rating' => round($room->averageRating(), 1),
            'reviewCount' => $room->reviews->count(),
            'images' => $room->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => $image->url,
                    'caption' => $image->caption,
                    'is_primary' => $image->is_primary,
                ];
            })->toArray(),
            // Updated to return facility objects instead of just names
            'facilities' => $room->facilities->map(function ($facility) {
                return [
                    'id' => $facility->id,
                    'name' => $facility->name,
                    'description' => $facility->description,
                    'icon' => $facility->icon,
                ];
            })->toArray(),
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
        return \App\Models\Facility::select('id', 'name')->get()->toArray();
    }
}
