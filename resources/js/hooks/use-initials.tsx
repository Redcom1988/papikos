import { useCallback } from 'react';

export function useInitials() {
    return useCallback((name: string | undefined | null): string => {
        if (!name || typeof name !== 'string') {
            return '?';
        }
        
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }, []);
}
