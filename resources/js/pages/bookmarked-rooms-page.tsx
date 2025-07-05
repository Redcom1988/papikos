import type { BookmarkedRoomsPageProps } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { SlidersHorizontal, ChevronDown, Bookmark, Heart } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useFilters } from '@/hooks/use-filters';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { 
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppBar from '@/components/ui/appbar';
import SearchBar from '@/components/ui/search-bar';
import FilterSidebar from '@/components/ui/filter-sidebar';
import RoomCard from '@/components/ui/room-card';
import Pagination from '@/components/ui/pagination';
import LoadingSpinner from '@/components/ui/loading-spinner';
import MobileChat from '@/components/ui/mobile-chat';

export default function BookmarkedRooms() {
    const { auth, rooms, facilities, filters: initialFilters, userBookmarks = [] } = usePage<BookmarkedRoomsPageProps>().props;
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const { bookmarkedRooms, bookmarkLoading, handleBookmark, isBookmarked } = useBookmarks(userBookmarks);

    const { filters, setFilters, loading, applyFilters, clearFilters } = useFilters({
        initialFilters: {
            search: initialFilters.search,
            minPrice: initialFilters.min_price,
            maxPrice: initialFilters.max_price,
            facilities: initialFilters.facilities,
            sortBy: initialFilters.sort_by
        },
        route: route('bookmarks.index')
    });

    const handleFacilityToggle = (facilityName: string) => {
        setFilters(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facilityName)
                ? prev.facilities.filter(f => f !== facilityName)
                : [...prev.facilities, facilityName]
        }));
    };

    const handlePriceRangeChange = (min: number, max: number) => {
        setFilters(prev => ({
            ...prev,
            minPrice: min,
            maxPrice: max
        }));
    };

    const handlePageChange = (page: number) => {
        applyFilters(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sortOptions = [
        { value: 'newest', label: 'Recently Bookmarked' },
        { value: 'oldest', label: 'Oldest Bookmarks' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' }
    ];

    return (
        <>
            <Head title="Bookmarked Rooms - Papikos">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-background text-foreground">
                <AppBar auth={auth} sticky />

                <div className="bg-muted/50 py-3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Breadcrumbs
                            breadcrumbs={[
                                { title: 'Home', href: route('landing.page') },
                                { title: 'Bookmarked Rooms', href: route('bookmarks.index') }
                            ]}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Bookmark className="w-8 h-8 text-primary fill-primary" />
                            <h1 className="text-3xl font-bold text-foreground">My Bookmarked Rooms</h1>
                        </div>
                        <p className="text-muted-foreground">
                            {rooms.total} bookmarked properties • Showing {rooms.from || 0}-{rooms.to || 0} of {rooms.total}
                        </p>
                    </div>

                    {/* Search and Sort Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* Search */}
                        <SearchBar
                            value={filters.search}
                            onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
                            placeholder="Search your bookmarked rooms..."
                            className="flex-1"
                        />

                        {/* Sort By and Mobile Filter */}
                        <div className="flex items-center space-x-4">
                            {/* Sort By Label and Dropdown */}
                            <div className="flex items-center space-x-2">
                                <label className="text-sm font-medium text-foreground whitespace-nowrap">
                                    Sort by:
                                </label>
                                
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="h-10 px-3 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary flex items-center gap-2 hover:bg-muted transition-colors">
                                            <span className="text-sm">
                                                {sortOptions.find(option => option.value === filters.sortBy)?.label || 'Select...'}
                                            </span>
                                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent align="end">
                                        {sortOptions.map(option => (
                                            <DropdownMenuItem
                                                key={option.value}
                                                onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                                                className={`cursor-pointer ${
                                                    filters.sortBy === option.value 
                                                        ? 'bg-primary/10 text-primary font-medium' 
                                                        : ''
                                                }`}
                                            >
                                                {option.label}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="lg:hidden flex items-center space-x-2 h-10 px-4 border border-border bg-background text-foreground rounded-lg hover:bg-muted transition-colors"
                            >
                                <SlidersHorizontal className="w-4 h-4" />
                                <span>Filters</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <div className={`lg:col-span-1 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                            <FilterSidebar
                                variant="complex"
                                facilities={facilities}
                                selectedFacilities={filters.facilities}
                                onFacilityToggle={handleFacilityToggle}
                                minPrice={filters.minPrice}
                                maxPrice={filters.maxPrice}
                                onPriceRangeChange={handlePriceRangeChange}
                                isAvailable={filters.isAvailable}
                                onIsAvailableToggle={(val) => setFilters(prev => ({ ...prev, isAvailable: val}))}
                                onClearFilters={clearFilters}
                            />
                        </div>

                        {/* Room Listings */}
                        <div className="lg:col-span-3">
                            {loading ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    {rooms.data && rooms.data.length > 0 ? (
                                        <>
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                                                {rooms.data.map(room => (
                                                    <RoomCard
                                                        key={room.id}
                                                        room={room}
                                                        isBookmarked={isBookmarked(room.id)}
                                                        isLoading={bookmarkLoading === room.id}
                                                        onBookmark={handleBookmark}
                                                    />
                                                ))}
                                            </div>

                                            {/* Pagination */}
                                            <Pagination
                                                currentPage={rooms.current_page}
                                                lastPage={rooms.last_page}
                                                onPageChange={handlePageChange}
                                            />
                                        </>
                                    ) : (
                                        /* Empty State */
                                        <div className="text-center py-12">
                                            <div className="max-w-md mx-auto">
                                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                                                    <Heart className="w-10 h-10 text-muted-foreground" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-foreground mb-3">
                                                    No bookmarked rooms yet
                                                </h3>
                                                <p className="text-muted-foreground mb-4">
                                                    Start exploring and bookmark your favorite rooms to see them here.
                                                </p>
                                                <a
                                                    href={route('rooms.index')}
                                                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                                >
                                                    <Bookmark className="w-4 h-4" />
                                                    Browse Rooms
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* No Search Results */}
                            {!loading && rooms.total > 0 && rooms.data.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-muted-foreground text-lg mb-4">
                                        No bookmarked rooms found matching your criteria
                                    </div>
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

                {/* Mobile Chat Component */}
                <MobileChat />
            </div>
        </>
    );
}