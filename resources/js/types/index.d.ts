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
    role: 'admin' | 'owner' | 'renter'; 
    email_verified_at: string | null;
    created_at: string;
}

// Room and listings related interfaces
export interface Room {
    id: number;
    name: string;
    price: number;
    address: string;
    images: string[];
    facilities: Facility[];
    description: string;
    availableTours: string[];
    primary_image: string | null;
    size: number;
    max_occupancy: number;
}

export interface ReportImage {
    id: number;
    url: string;
}

export interface Report {
    id: number;
    type: string;
    description: string;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    owner_response?: string;
    owner_response_action?: string;
    owner_responded_at?: string;
    created_at: string;
    reporter: {
        name: string;
    };
    images: ReportImage[];
}

export interface RoomDetails {
    id: number;
    name: string;
    description: string;
    size: number;
    max_occupancy: number;
    is_available: boolean;
    price: number;
    address: string;
    embedded_map_link?: string;
    available_tours: TourSlot[];
    images: RoomImage[];
    owner: Owner;
    facilities: Facility[];
    reports?: Report[]; 
}

export interface HeroRoom {
    id: number;
    name: string;
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

export interface BookmarkedRoomsPageProps extends SharedData {
    auth: {
        user: User;
    };
    rooms: PaginatedRooms;
    facilities: Facility[];
    filters: {
        search: string;
        min_price: number;
        max_price: number;
        facilities: string[];
        sort_by: string;
    };
    userBookmarks: number[];
}