import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Filter, Search, SlidersHorizontal } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import BookmarkButton from '@/components/ui/bookmark-button';
import RoomImage from '@/components/ui/room-image';

interface Room {
    id: number;
    title: string;
    price: number;
    location: string;
    rating: number;
    reviewCount: number;
    images: string[];
    facilities: string[];
    description: string;
    availableTours: string[];
    primary_image: string | null;
    size: number;
    max_occupancy: number;
}

interface PaginationLinks {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
}

interface PaginatedRooms {
    data: Room[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLinks;
}

interface Facility {
    id: number;
    name: string;
}

interface PageProps extends SharedData {
    rooms: PaginatedRooms;
    facilities: Facility[];
    filters: {
        search: string;
        min_price: number;
        max_price: number;
        facilities: string[];
        rating: number;
        sort_by: string;
    };
    userBookmarks?: number[];
}

export default function RoomListings() {
    const { auth, rooms, facilities, filters: initialFilters, userBookmarks = [] } = usePage<PageProps>().props;
    const [filters, setFilters] = useState({
        search: initialFilters.search || '',
        minPrice: initialFilters.min_price || 0,
        maxPrice: initialFilters.max_price || 10000000,
        facilities: initialFilters.facilities || [],
        rating: initialFilters.rating || 0,
        sortBy: initialFilters.sort_by || 'newest'
    });
    const [loading, setLoading] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Use the bookmark hook
    const { bookmarkedRooms, bookmarkLoading, handleBookmark, isBookmarked } = useBookmarks(userBookmarks);

    const applyFilters = (page = 1) => {
        setLoading(true);
        router.get('/rooms', {
            search: filters.search,
            min_price: filters.minPrice,
            max_price: filters.maxPrice,
            facilities: filters.facilities,
            rating: filters.rating,
            sort_by: filters.sortBy,
            page: page,
        }, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleSearchChange = (value: string) => {
        setFilters(prev => ({ ...prev, search: value }));
    };

    const handleFacilityToggle = (facility: string) => {
        setFilters(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facility)
                ? prev.facilities.filter(f => f !== facility)
                : [...prev.facilities, facility]
        }));
    };

    const handlePriceRangeChange = (min: number, max: number) => {
        setFilters(prev => ({
            ...prev,
            minPrice: min,
            maxPrice: max
        }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            minPrice: 0,
            maxPrice: 10000000,
            facilities: [],
            rating: 0,
            sortBy: 'newest'
        });
    };

    const handlePageChange = (page: number) => {
        applyFilters(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Immediate filter application
    useEffect(() => {
        applyFilters();
    }, [filters.facilities, filters.rating, filters.sortBy]);

    // Price filter with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 800);
        return () => clearTimeout(timer);
    }, [filters.minPrice, filters.maxPrice]);

    const priceRanges = [
        { label: 'Below 500k', min: 0, max: 500000 },
        { label: '500k - 900k', min: 500000, max: 900000 },
        { label: '1M - 1.5M', min: 1000000, max: 1500000 },
        { label: '1.5M - 2M', min: 1500000, max: 2000000 },
        { label: 'Above 2M', min: 2000000, max: 10000000 },
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Highest Rated' },
        { value: 'popular', label: 'Most Popular' },
    ];

    return (
        <>
            <Head title="Room Listings - Papikos">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-background text-foreground">
                {/* Header - Same as landing page */}
                <header className="bg-background border-b border-border sticky top-0 z-40 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Logo */}
                            <div className="flex items-center">
                                <Link href={route('landing.page')} className="flex items-center">
                                    <img 
                                        src="/logo.png" 
                                        alt="Papikos Logo" 
                                        className="w-8 h-8 mr-3"
                                    />
                                    <span className="text-xl font-semibold text-foreground">papikos</span>
                                </Link>
                            </div>

                            {/* Navigation */}
                            <nav className="flex items-center space-x-6">
                                {auth.user ? (
                                    <div className="flex items-center space-x-2">
                                        {/* Profile Button */}
                                        <button 
                                            onClick={() => router.visit(route('profile.edit'))}
                                            className="flex items-center space-x-2 bg-background border border-border text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                                            title="Profile"
                                        >
                                            <span>{auth.user.name}</span>
                                            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-muted-foreground">{auth.user.name?.charAt(0)}</span>
                                            </div>
                                        </button>
                                        {/* Dashboard Button */}
                                        <button
                                            onClick={() => router.visit(route('dashboard'))}
                                            className="flex items-center space-x-2 bg-background border border-border text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                                            title="Dashboard"
                                        >
                                            <span>Dashboard</span>
                                            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                                                <span className="text-xs font-medium text-muted-foreground">📊</span>
                                            </div>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        {/* Login Button */}
                                        <button
                                            onClick={() => router.visit(route('login'))}
                                            className="bg-background border border-border text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                                        >
                                            Log in
                                        </button>
                                        
                                        {/* Register Button */}
                                        <button
                                            onClick={() => router.visit(route('register'))}
                                            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            Sign up
                                        </button>
                                    </div>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Breadcrumb */}
                <div className="bg-muted/50 py-3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center text-sm">
                            <Link href={route('landing.page')} className="text-muted-foreground hover:text-foreground transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                            <span className="text-foreground font-medium">Room Listings</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">Room Listings</h1>
                        <p className="text-muted-foreground">
                            {rooms.total} properties available • Showing {rooms.from}-{rooms.to} of {rooms.total}
                        </p>
                    </div>

                    {/* Search and Sort Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search rooms, locations..."
                                value={filters.search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        {/* Sort */}
                        <div className="flex items-center space-x-4">
                            <select
                                value={filters.sortBy}
                                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                                className="px-4 py-2 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-border bg-background text-foreground rounded-lg hover:bg-muted transition-colors"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                            <div className="bg-card border border-border p-6 rounded-lg shadow-sm sticky top-24">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-card-foreground">Filters</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-primary hover:text-primary/80 font-medium"
                                    >
                                        Clear all
                                    </button>
                                </div>

                                {/* Price Range */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-card-foreground mb-3">Price Range</h4>
                                    <div className="space-y-2">
                                        {priceRanges.map((range, index) => (
                                            <label key={index} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="priceRange"
                                                    checked={filters.minPrice === range.min && filters.maxPrice === range.max}
                                                    onChange={() => handlePriceRangeChange(range.min, range.max)}
                                                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                                                />
                                                <span className="ml-3 text-sm text-muted-foreground">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Facilities */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-card-foreground mb-3">Facilities</h4>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {facilities.map(facility => (
                                            <label key={`facility-${facility.id}`} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.facilities.includes(facility.name)}
                                                    onChange={() => handleFacilityToggle(facility.name)}
                                                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                                                />
                                                <span className="ml-3 text-sm text-muted-foreground">{facility.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="mb-6">
                                    <h4 className="font-medium text-card-foreground mb-3">Minimum Rating</h4>
                                    <div className="space-y-2">
                                        {[4, 3.5, 3, 0].map(rating => (
                                            <label key={rating} className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    checked={filters.rating === rating}
                                                    onChange={() => setFilters(prev => ({ ...prev, rating }))}
                                                    className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                                                />
                                                <span className="ml-3 text-sm text-muted-foreground">
                                                    {rating === 0 ? 'Any rating' : `${rating}+ stars`}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Listings */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <div className="flex justify-center items-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Results Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                        {rooms.data.map(room => (
                                            <div key={room.id} className="bg-card border border-border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                                {/* Room Image - Updated with RoomImage component */}
                                                <div className="h-48 bg-muted relative group">
                                                    <Link href={`/rooms/${room.id}`} className="absolute inset-0 z-0">
                                                        <RoomImage
                                                            src={room.primary_image}
                                                            alt={room.title}
                                                            className="h-full transition-transform duration-300 group-hover:scale-105"
                                                            objectFit="cover"
                                                        />
                                                    </Link>
                                                    
                                                    {/* Bookmark Button */}
                                                    <BookmarkButton
                                                        roomId={room.id}
                                                        isBookmarked={isBookmarked(room.id)}
                                                        isLoading={bookmarkLoading === room.id}
                                                        onBookmark={handleBookmark}
                                                        className="absolute top-3 right-3"
                                                    />
                                                    
                                                    {/* Hover overlay */}
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

                                                    {/* Rating */}
                                                    <div className="flex items-center mb-3">
                                                        <div className="flex text-yellow-400 mr-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star 
                                                                    key={i} 
                                                                    className={`w-4 h-4 ${
                                                                        i < Math.floor(room.rating) 
                                                                            ? 'fill-current text-yellow-400' 
                                                                            : 'text-muted-foreground/30'
                                                                    }`} 
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium text-card-foreground">
                                                            {room.rating.toFixed(1)}
                                                        </span>
                                                        <span className="text-sm text-muted-foreground ml-1">
                                                            ({room.reviewCount})
                                                        </span>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-lg font-bold text-card-foreground">
                                                            {Math.floor(room.price / 1000)}k<span className="text-sm font-normal">/month</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {rooms.last_page > 1 && (
                                        <div className="flex justify-center items-center space-x-2">
                                            {/* Previous Button */}
                                            <button
                                                onClick={() => handlePageChange(rooms.current_page - 1)}
                                                disabled={rooms.current_page === 1}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronLeft className="w-4 h-4 mr-1" />
                                                Previous
                                            </button>

                                            {/* Page Numbers */}
                                            <div className="flex space-x-1">
                                                {(() => {
                                                    const pages = [];
                                                    const showPages = 5;
                                                    let startPage = Math.max(1, rooms.current_page - Math.floor(showPages / 2));
                                                    let endPage = Math.min(rooms.last_page, startPage + showPages - 1);
                                                    
                                                    if (endPage - startPage + 1 < showPages) {
                                                        startPage = Math.max(1, endPage - showPages + 1);
                                                    }

                                                    for (let i = startPage; i <= endPage; i++) {
                                                        pages.push(
                                                            <button
                                                                key={i}
                                                                onClick={() => handlePageChange(i)}
                                                                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                                    i === rooms.current_page
                                                                        ? 'bg-primary text-primary-foreground'
                                                                        : 'text-muted-foreground bg-card border border-border hover:bg-muted'
                                                                }`}
                                                            >
                                                                {i}
                                                            </button>
                                                        );
                                                    }
                                                    return pages;
                                                })()}
                                            </div>

                                            {/* Next Button */}
                                            <button
                                                onClick={() => handlePageChange(rooms.current_page + 1)}
                                                disabled={rooms.current_page === rooms.last_page}
                                                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                Next
                                                <ChevronRight className="w-4 h-4 ml-1" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* No Results */}
                            {!loading && rooms.data.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-muted-foreground text-lg mb-4">No rooms found matching your criteria</div>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}