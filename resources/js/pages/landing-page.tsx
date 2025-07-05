import type { LandingPageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';
import { useFilters } from '@/hooks/use-filters';
import AppBar from '@/components/ui/appbar';
import HeroSection from '@/components/ui/hero-section';
import FilterSidebar from '@/components/ui/filter-sidebar';
import RoomGrid from '@/components/ui/room-grid';
import MobileChat from '@/components/ui/mobile-chat';

export default function LandingPage() {
    const { auth, rooms, heroRoom, facilities, filters: initialFilters, userBookmarks = [] } = usePage<LandingPageProps>().props;

    // Use the bookmark hook
    const { bookmarkLoading, handleBookmark, isBookmarked } = useBookmarks(userBookmarks);

    // Use the filters hook
    const { filters, setFilters, loading, clearFilters } = useFilters({
        initialFilters: {
            minPrice: initialFilters.min_price,
            maxPrice: initialFilters.max_price,
            facilities: initialFilters.facilities,
            search: '',
            sortBy: 'price_low'
        },
        route: route('landing.page'), // or '/' depending on your route name
        debounceMs: 500
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

    return (
        <>
            <Head title="Papikos - Find Your Perfect Room">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-background text-foreground">
                <AppBar auth={auth} />
                
                <HeroSection room={heroRoom} />

                <section className="bg-muted/50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    Find The Right One For You:<br />
                                    Explore Our Current Listings!
                                </h2>
                                <p className="text-muted-foreground">
                                    {rooms.length}+ Kos Di Jambaran, Bolong
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href={route('rooms.index')}
                                    className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium hover:bg-primary/90 flex items-center"
                                >
                                    More property
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Link>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-1">
                                <FilterSidebar
                                    variant="simple"
                                    facilities={facilities}
                                    selectedFacilities={filters.facilities}
                                    onFacilityToggle={handleFacilityToggle}
                                    minPrice={filters.minPrice}
                                    maxPrice={filters.maxPrice}
                                    onPriceRangeChange={handlePriceRangeChange}
                                />
                            </div>

                            <div className="lg:col-span-3">
                                <RoomGrid
                                    rooms={rooms}
                                    loading={loading}
                                    isBookmarked={isBookmarked}
                                    bookmarkLoading={bookmarkLoading}
                                    onBookmark={handleBookmark}
                                    onClearFilters={clearFilters}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Mobile Chat Component */}
                <MobileChat />
            </div>
        </>
    );
}