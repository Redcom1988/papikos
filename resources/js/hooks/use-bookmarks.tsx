import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';

interface UseBookmarksReturn {
    bookmarkedRooms: number[];
    bookmarkLoading: number | null;
    handleBookmark: (roomId: number, event?: React.MouseEvent) => Promise<void>;
    isBookmarked: (roomId: number) => boolean;
}

export function useBookmarks(initialBookmarks: number[] = []): UseBookmarksReturn {
    const { auth } = usePage().props as any;
    const [bookmarkedRooms, setBookmarkedRooms] = useState<number[]>(initialBookmarks);
    const [bookmarkLoading, setBookmarkLoading] = useState<number | null>(null);

    // Update bookmarked rooms when initial bookmarks change
    useEffect(() => {
        setBookmarkedRooms(initialBookmarks);
    }, [initialBookmarks]);

    const handleBookmark = async (roomId: number, event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }

        setBookmarkLoading(roomId);

        router.post(route('bookmarks.toggle'), {
            room_id: roomId,
        }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                // Toggle the bookmark state
                setBookmarkedRooms(prev => 
                    prev.includes(roomId)
                        ? prev.filter(id => id !== roomId)
                        : [...prev, roomId]
                );
                setBookmarkLoading(null);
            },
            onError: (errors) => {
                console.error('Failed to toggle bookmark:', errors);
                setBookmarkLoading(null);
            },
            onFinish: () => {
                setBookmarkLoading(null);
            }
        });
    };

    const isBookmarked = (roomId: number): boolean => {
        return bookmarkedRooms.includes(roomId);
    };

    return {
        bookmarkedRooms,
        bookmarkLoading,
        handleBookmark,
        isBookmarked,
    };
}