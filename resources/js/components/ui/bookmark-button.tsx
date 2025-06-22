import { Bookmark } from 'lucide-react';
import IconButton from './icon-button';

interface BookmarkButtonProps {
    roomId: number;
    isBookmarked: boolean;
    isLoading: boolean;
    onBookmark: (roomId: number, event: React.MouseEvent) => void;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export default function BookmarkButton({
    roomId,
    isBookmarked,
    isLoading,
    onBookmark,
    className = '',
    size = 'md'
}: BookmarkButtonProps) {
    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        onBookmark(roomId, event);
    };

    return (
        <IconButton
            onClick={handleClick}
            title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            variant={isBookmarked ? 'bookmarked' : 'default'}
            disabled={isLoading}
            className={className}
            size={size}
        >
            {isLoading ? (
                <div className={`${iconSizes[size]} border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin`}></div>
            ) : (
                <Bookmark 
                    className={`${iconSizes[size]} transition-colors ${
                        isBookmarked 
                            ? 'text-primary fill-primary dark:text-primary dark:fill-primary' 
                            : 'text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary'
                    }`}
                />
            )}
        </IconButton>
    );
}