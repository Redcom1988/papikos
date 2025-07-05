import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import type { FilterState, UseFiltersProps } from '@/types';
import { NO_LIMIT_PRICE } from '@/constants';
import { DEFAULTFILTER } from '@/constants';

export function useFilters({ 
    initialFilters, 
    route, 
    debounceMs = 500 
}: UseFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        search: initialFilters.search || '',
        minPrice: initialFilters.minPrice || 0,
        maxPrice: initialFilters.maxPrice || NO_LIMIT_PRICE,
        facilities: initialFilters.facilities || [],
        sortBy: initialFilters.sortBy || 'newest',
        isAvailable: initialFilters.isAvailable || false,
    });
    
    const [loading, setLoading] = useState(false);

    const applyFilters = (page = 1) => {
        setLoading(true);

        const params: any = {};

        if (filters.search !== DEFAULTFILTER.search) params.search = filters.search;
        if (filters.minPrice !== DEFAULTFILTER.minPrice) params.min_price = filters.minPrice;
        if (filters.maxPrice !== DEFAULTFILTER.maxPrice) params.max_price = filters.maxPrice;
        if (filters.facilities.length > 0) params.facilities = filters.facilities;
        if (filters.sortBy !== DEFAULTFILTER.sortBy) params.sort_by = filters.sortBy;
        if (filters.isAvailable === true) params.is_available = true;
        if (page !== DEFAULTFILTER.page) params.page = page;

        router.get(route, Object.keys(params).length ? params : undefined, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const clearFilters = () => {
        setFilters({
            ...DEFAULTFILTER
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, debounceMs);
        
        return () => clearTimeout(timer);
    }, [filters.search, filters.minPrice, filters.maxPrice]);

    // Immediate effect for other filters
    useEffect(() => {
        applyFilters();
    }, [filters.facilities, filters.sortBy, filters.isAvailable]);

    return {
        filters,
        setFilters,
        loading,
        applyFilters,
        clearFilters
    };
}