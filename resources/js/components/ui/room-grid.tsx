import type { Room } from '@/types';
import RoomCard from './room-card';
import LoadingSpinner from './loading-spinner';

interface RoomGridProps {
    rooms: Room[];
    loading: boolean;
    isBookmarked: (roomId: number) => boolean;
    bookmarkLoading: number | null;
    onBookmark: (roomId: number) => void;
    onClearFilters: () => void;
}

export default function RoomGrid({ 
    rooms, 
    loading, 
    isBookmarked, 
    bookmarkLoading, 
    onBookmark, 
    onClearFilters 
}: RoomGridProps) {
    if (loading) {
        return <LoadingSpinner />;
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-muted-foreground text-lg">No rooms found matching your criteria</div>
                <button
                    onClick={onClearFilters}
                    className="mt-4 text-primary hover:text-primary/80 font-medium"
                >
                    Clear filters
                </button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map(room => (
                <RoomCard
                    key={room.id}
                    room={room}
                    isBookmarked={isBookmarked(room.id)}
                    isLoading={bookmarkLoading === room.id}
                    onBookmark={onBookmark}
                />
            ))}
        </div>
    );
}