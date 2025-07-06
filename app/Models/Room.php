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
        'available_tour_times',
        'max_advance_days',
    ];

    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'price' => 'integer',
            'size' => 'integer',
            'max_occupancy' => 'integer',
            'max_advance_days' => 'integer',
            'available_tour_times' => 'array',
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

    public function bookmarks()
    {
        return $this->hasMany(Bookmark::class);
    }

    public function bookmarkedByUsers()
    {
        return $this->belongsToMany(User::class, 'bookmarks');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function getFormattedPriceAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public static function getRandomRoomForHero()
    {
        $room = self::with(['primaryImage', 'images'])
            ->where('is_available', true)
            ->inRandomOrder()
            ->first();

        if (!$room) {
            return null;
        }

        return [
            'id' => $room->id,
            'name' => $room->name,
            'price' => $room->price,
            'address' => $room->address,
            'primary_image' => $room->primaryImage?->url,
            'description' => $room->description,
        ];
    }

    public static function getAllRooms($filters = [])
    {
        $query = self::with(['facilities', 'images', 'primaryImage']);

        if (!empty($filters['is_available'])) {
            $query->where('is_available', true);
        }

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

        // Apply search filter
        if (!empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', "%{$searchTerm}%")
                  ->orWhere('description', 'like', "%{$searchTerm}%")
                  ->orWhere('address', 'like', "%{$searchTerm}%");
            });
        }

        // Apply sorting
        $sortBy = $filters['sort_by'] ?? 'newest';
        switch ($sortBy) {
            case 'newest':
                $query->latest(); // Orders by created_at DESC
                break;
            case 'oldest':
                $query->oldest(); // Orders by created_at ASC
                break;
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'popular':
                $query->withCount('bookmarks')
                      ->orderBy('bookmarks_count', 'desc');
                break;
            default:
                $query->latest();
                break;
        }

        // For paginated results, don't use take()
        if (isset($filters['paginate']) && $filters['paginate']) {
            return $query->paginate($filters['per_page'] ?? 24)
                ->through(function ($room) {
                    return [
                        'id' => $room->id,
                        'title' => $room->name,
                        'price' => $room->price,
                        'address' => $room->address,
                        'images' => $room->images->pluck('url')->toArray(),
                        'facilities' => $room->facilities->map(function ($facility) {
                            return [
                                'id' => $facility->id,
                                'name' => $facility->name,
                                'description' => $facility->description,
                                'icon' => $facility->icon,
                            ];
                        })->toArray(),
                        'description' => $room->description,
                        'availableTours' => $room->getAvailableTourSlots(),
                        'primary_image' => $room->primaryImage?->url,
                        'size' => $room->size,
                        'max_occupancy' => $room->max_occupancy,
                    ];
                });
        }

        // For landing page, limit to 6
        return $query->take(6)->get()->map(function ($room) {
            return [
                'id' => $room->id,
                'title' => $room->name,
                'price' => $room->price,
                'address' => $room->address,
                'images' => $room->images->pluck('url')->toArray(),
                'facilities' => $room->facilities->map(function ($facility) {
                    return [
                        'id' => $facility->id,
                        'name' => $facility->name,
                        'description' => $facility->description,
                        'icon' => $facility->icon,
                    ];
                })->toArray(),
                'description' => $room->description,
                'availableTours' => $room->getAvailableTourSlots(),
                'primary_image' => $room->primaryImage?->url,
                'size' => $room->size,
                'max_occupancy' => $room->max_occupancy,
            ];
        });
    }

    public static function getRoomDetails($roomId)
    {
        $room = self::with(['facilities', 'images', 'owner'])
            ->findOrFail($roomId);

        return [
            'id' => $room->id,
            'title' => $room->name,
            'description' => $room->description,
            'price' => $room->price,
            'address' => $room->address,
            'embedded_map_link' => $room->embedded_map_link,
            'size' => $room->size,
            'max_occupancy' => $room->max_occupancy,
            'images' => $room->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'url' => $image->url,
                    'caption' => $image->caption,
                    'is_primary' => $image->is_primary,
                ];
            })->toArray(),
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
            'available_tours' => $room->getAvailableTourSlots(),
        ];
    }

    public static function getAllFacilities()
    {
        return Facility::select('id', 'name')->get()->toArray();
    }

    public function getAvailableTourSlots()
    {
        if (!$this->available_tour_times || empty($this->available_tour_times)) {
            return [];
        }

        $slots = [];
        $today = now();
        
        for ($i = 1; $i <= $this->max_advance_days; $i++) {
            $date = $today->copy()->addDays($i);
            
            foreach ($this->available_tour_times as $time) {
                $dateTime = $date->format('Y-m-d') . ' ' . $time;
                
                $isBooked = $this->appointments()
                    ->whereDate('scheduled_at', $date->format('Y-m-d'))
                    ->whereTime('scheduled_at', $time)
                    ->where('status', '!=', 'cancelled')
                    ->exists();
                    
                if (!$isBooked) {
                    $slots[] = [
                        'datetime' => $dateTime,
                        'label' => $date->format('D, M j'),
                        'display_time' => $time,
                    ];
                }
            }
        }
        
        return $slots;
    }
}
