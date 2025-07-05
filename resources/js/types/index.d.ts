import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_owner: boolean;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    avatar?: string; // This might be computed/appended in Laravel
}

// Room and listings related interfaces
export interface Room {
    id: number;
    title: string;
    price: number;
    location: string;
    reviewCount: number;
    images: string[];
    facilities: string[];
    description: string;
    availableTours: string[];
    primary_image: string | null;
    size: number;
    max_occupancy: number;
}

export interface RoomDetails {
    id: number;
    title: string;
    description: string;
    price: number;
    location: string;
    embedded_map_link?: string;
    size: number;
    max_occupancy: number;
    reviewCount: number;
    images: Array<{
        id: number;
        url: string;
        caption: string;
        is_primary: boolean;
    }>;
    facilities: Array<{
        id: number;
        name: string;
        description?: string;
        icon?: string;
    }>;
    owner: {
        id: number;
        name: string;
        phone: string;
    };
    available_tours: Array<{
        datetime: string;
        label: string;
        display_time: string;
    }>;
}

export interface HeroRoom {
    id: number;
    title: string;
    price: number;
    location: string;
    primary_image: string | null;
    description: string;
}

export interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

export interface PaginatedRooms {
    data: Room[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLinks;
}

export interface Facility {
    id: number;
    name: string;
    icon?: string;
}

// Filter related interfaces
export interface FilterState {
    search: string;
    minPrice: number;
    maxPrice: number;
    facilities: string[];
    sortBy: string;
    isAvailable: boolean;
}

export interface UseFiltersProps {
    initialFilters: Partial<FilterState>;
    route: string;
    debounceMs?: number;
}

export interface FilterSidebarProps {
    variant?: 'simple' | 'complex';
    facilities: Facility[];
    selectedFacilities: string[];
    onFacilityToggle: (facilityName: string) => void;
    
    // Complex variant props (filtering only)
    minPrice?: number;
    maxPrice?: number;
    onPriceRangeChange?: (min: number, max: number) => void;
    isAvailable?: boolean;
    onIsAvailableToggle?: (boolean) => void;
    onClearFilters?: () => void;
}

export interface PriceRange {
    label: string;
    min: number;
    max: number;
}

// Page props interfaces
export interface LandingPageProps extends SharedData {
    rooms: Room[];
    heroRoom: HeroRoom | null;
    facilities: Facility[];
    filters: {
        min_price: number;
        max_price: number;
        facilities: string[];
    };
    userBookmarks?: number[];
}

export interface RoomListingsPageProps extends SharedData {
    rooms: PaginatedRooms;
    facilities: Facility[];
    filters: {
        search: string;
        min_price: number;
        max_price: number;
        facilities: string[];
        sort_by: string;
    };
    userBookmarks?: number[];
}

export interface RoomDetailsPageProps extends SharedData {
    room: RoomDetails;
    userBookmarks?: number[];
}