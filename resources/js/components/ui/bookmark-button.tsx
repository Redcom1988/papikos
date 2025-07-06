import { Bookmark } from 'lucide-react';
import IconButton from './icon-button';
import { cn } from '@/lib/utils';

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

    return (
        <IconButton
            onClick={(e) => onBookmark(roomId, e)}
            disabled={isLoading}
            className={cn(
                isBookmarked 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                    : '',
                className
            )}
            size={size}
        >
            {isLoading ? (
                <div className={cn('animate-spin rounded-full border-2 border-current border-t-transparent', iconSizes[size])} />
            ) : (
                <Bookmark
                    className={cn(
                        iconSizes[size], 
                        'transition-all duration-200',
                        isBookmarked 
                            ? 'fill-current text-blue-600 dark:text-blue-400 drop-shadow-lg' 
                            : 'text-foreground hover:text-blue-600 hover:drop-shadow-lg dark:hover:text-blue-400'
                    )} 
                />
            )}
        </IconButton>
    );
}