import type { Room } from '@/types';
import { Link } from '@inertiajs/react';
import { Star } from 'lucide-react';
import BookmarkButton from './bookmark-button';
import RoomImage from './room-image';
import Tag from './tag';

interface RoomCardProps {
    room: Room;
    isBookmarked: boolean;
    isLoading: boolean;
    onBookmark: (roomId: number) => void;
    className?: string;
}

export default function RoomCard({ 
    room, 
    isBookmarked, 
    isLoading, 
    onBookmark,
    className = ""
}: RoomCardProps) {
    // Show only first 3 facilities as tags
    const displayFacilities = room.facilities?.slice(0, 3) || [];
    const remainingCount = (room.facilities?.length || 0) - displayFacilities.length;

    return (
        <div className={`bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow ${className}`}>
            {/* Room Image */}
            <div className="h-48 bg-muted relative group">
                <Link href={`/rooms/${room.id}`} className="absolute inset-0 z-0">
                    <RoomImage
                        src={room.primary_image}
                        alt={room.title}
                        className="h-full transition-transform duration-300 group-hover:scale-105"
                        objectFit="cover"
                    />
                </Link>
                
                <BookmarkButton
                    roomId={room.id}
                    isBookmarked={isBookmarked}
                    isLoading={isLoading}
                    onBookmark={onBookmark}
                    className="absolute top-3 right-3"
                />
                
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none z-10"></div>
            </div>

            <div className="p-4">
                {/* Location */}
                <p className="text-sm text-muted-foreground mb-1">{room.location}</p>
                
                {/* Room Title */}
                <Link href={`/rooms/${room.id}`} className="block">
                    <h3 className="font-semibold text-lg text-card-foreground mb-2 hover:text-primary transition-colors line-clamp-2">
                        {room.title}
                    </h3>
                </Link>
                
                {/* Room Details */}
                <p className="text-sm text-muted-foreground mb-3">
                    {room.size}m² • {room.max_occupancy} person
                </p>

                {/* Facility Tags */}
                {displayFacilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                        {displayFacilities.map((facility, index) => (
                            <Tag
                                key={facility.id}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                {facility.name}
                            </Tag>
                        ))}
                        {remainingCount > 0 && (
                            <Tag
                                variant="default"
                                size="sm"
                                className="text-xs"
                            >
                                +{remainingCount}
                            </Tag>
                        )}
                    </div>
                )}

                {/* Price */}
                <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-card-foreground">
                        {Math.floor(room.price / 1000)}k<span className="text-sm font-normal">/month</span>
                    </div>
                </div>
            </div>
        </div>
    );
}