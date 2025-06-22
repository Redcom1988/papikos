import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ChevronRight, Star } from 'lucide-react';
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

interface Facility {
    id: number;
    name: string;
}

interface PageProps extends SharedData {
    rooms: Room[];
    facilities: Facility[]; // Changed from string[] to Facility[]
    filters: {
        min_price: number;
        max_price: number;
        facilities: string[];
    };
    userBookmarks?: number[];
}

export default function LandingPage() {
    const { auth, rooms, facilities, filters: initialFilters, userBookmarks = [] } = usePage<PageProps>().props;
    const [filters, setFilters] = useState({
        minPrice: initialFilters.min_price,
        maxPrice: initialFilters.max_price,
        facilities: initialFilters.facilities
    });
    const [loading, setLoading] = useState(false);

    // Calculate random room index only once when component mounts or rooms change
    const [randomRoomIndex] = useState(() => 
        rooms.length > 0 ? Math.floor(Math.random() * rooms.length) : 0
    );

    // Use the bookmark hook
    const { bookmarkedRooms, bookmarkLoading, handleBookmark, isBookmarked } = useBookmarks(userBookmarks);

    const applyFilters = () => {
        setLoading(true);
        router.get('/', {
            min_price: filters.minPrice,
            max_price: filters.maxPrice,
            facilities: filters.facilities,
        }, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleFacilityToggle = (facilityName: string) => {
        setFilters(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facilityName)
                ? prev.facilities.filter(f => f !== facilityName)
                : [...prev.facilities, facilityName]
        }));
    };

    const clearFilters = () => {
        setFilters({
            minPrice: 0,
            maxPrice: 10000000,
            facilities: []
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters();
        }, 500);

        return () => clearTimeout(timer);
    }, [filters.minPrice, filters.maxPrice]);

    useEffect(() => {
        applyFilters();
    }, [filters.facilities]);

    return (
        <>
            <Head title="Papikos - Find Your Perfect Room">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>
            
            <div className="min-h-screen bg-background text-foreground">
                {/* Header */}
                <header className="bg-background border-b border-border">
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

                {/* Hero Section */}
                <section className="bg-background py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Full Width Hero Image with overlaid content */}
                        <div className="relative h-128 rounded-lg overflow-hidden">
                            {rooms.length > 0 ? (
                                <RoomImage
                                    src={rooms[randomRoomIndex]?.primary_image}
                                    alt="Featured room"
                                    className="h-full w-full"
                                    objectFit="cover"
                                    loadingSize="lg"
                                />
                            ) : (
                                <div className="bg-muted h-full"></div>
                            )}
                            
                            {/* Dark overlay for better text readability */}
                            <div className="absolute inset-0 bg-black/40"></div>
                            
                            {/* Main title - Top center */}
                            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center"> {/* Changed from top-8 to top-6 */}
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                                    Find the Perfect Temporary<br />
                                    Housing for You
                                </h1>
                            </div>
                            
                            {/* "We are here for you" - Bottom left */}
                            <div className="absolute bottom-6 left-6"> {/* Changed from bottom-8 left-8 to bottom-6 left-6 */}
                                <h3 className="text-2xl font-bold text-white">
                                    We are Here<br />
                                    For You.
                                </h3>
                            </div>
                            
                            {/* Stats - Bottom right */}
                            <div className="absolute right-6 bottom-6 space-y-4"> {/* Changed from right-8 bottom-8 to right-6 bottom-6 */}
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-white">
                                        {rooms.length || '12,550'}+
                                    </div>
                                    <div className="text-white/80">Property Available</div>
                                </div>
                                
                                <div className="text-right">
                                    <div className="text-4xl font-bold text-white">500+</div>
                                    <div className="text-white/80">Total Owners</div>
                                </div>
                            </div>
                            
                            {/* Fallback content when no image */}
                            {rooms.length === 0 && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg mx-auto mb-4"></div>
                                        <h1 className="text-4xl font-bold text-foreground mb-4">
                                            Find the Perfect Temporary<br />
                                            Housing for You
                                        </h1>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Listings Section */}
                <section className="bg-muted/50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-foreground mb-2">
                                    Find The Right One For You:<br />
                                    Explore Our Current Listings!
                                </h2>
                                <p className="text-muted-foreground">150+ Kos Di Jambaran, Bolong</p>
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

                        {/* Filters Sidebar and Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Filters Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                                    <h3 className="font-semibold text-card-foreground mb-4">Fasilitas</h3>
                                    
                                    {/* Facilities - Updated to use facility objects */}
                                    <div className="space-y-3 mb-6">
                                        {facilities.slice(0, 6).map((facility) => (
                                            <label key={`landing-facility-${facility.id}`} className="flex items-center">
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

                                    <h3 className="font-semibold text-card-foreground mb-4">Price</h3>
                                    
                                    {/* Price Ranges */}
                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-primary border-border rounded" />
                                            <span className="ml-3 text-sm text-muted-foreground">Below 500k</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-primary border-border rounded" />
                                            <span className="ml-3 text-sm text-muted-foreground">From 500k-900k</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-primary border-border rounded" />
                                            <span className="ml-3 text-sm text-muted-foreground">From 1000k-1500k</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-primary border-border rounded" />
                                            <span className="ml-3 text-sm text-muted-foreground">Above 2000k</span>
                                        </label>
                                    </div>

                                    <h3 className="font-semibold text-card-foreground mb-4">Reviews</h3>
                                    
                                    {/* Reviews */}
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-primary border-border rounded" />
                                            <span className="ml-3 text-sm text-muted-foreground">4.0+ rating</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-primary border-border rounded" />
                                            <span className="ml-3 text-sm text-muted-foreground">3.5+ rating</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-primary border-border rounded" />
                                            <span className="ml-3 text-sm text-muted-foreground">3.0+ rating</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Room Listings - Updated with RoomImage component */}
                            <div className="lg:col-span-3">
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {rooms.map(room => (
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
                                                    
                                                    {/* Use the BookmarkButton component */}
                                                    <BookmarkButton
                                                        roomId={room.id}
                                                        isBookmarked={isBookmarked(room.id)}
                                                        isLoading={bookmarkLoading === room.id}
                                                        onBookmark={handleBookmark}
                                                        className="absolute top-3 right-3"
                                                    />
                                                    
                                                    {/* Optional: Add a subtle overlay on hover */}
                                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none z-10"></div>
                                                </div>

                                                <div className="p-4">
                                                    {/* Location */}
                                                    <p className="text-sm text-muted-foreground mb-1">{room.location}</p>
                                                    
                                                    {/* Room Title */}
                                                    <Link href={`/rooms/${room.id}`} className="block">
                                                        <h3 className="font-semibold text-lg text-card-foreground mb-2 hover:text-primary transition-colors">
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
                                                            ({room.reviewCount} reviews)
                                                        </span>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-card-foreground">
                                                                {Math.floor(room.price / 1000)}k<span className="text-sm font-normal">/month</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!loading && rooms.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="text-muted-foreground text-lg">No rooms found matching your criteria</div>
                                        <button
                                            onClick={clearFilters}
                                            className="mt-4 text-primary hover:text-primary/80 font-medium"
                                        >
                                            Clear filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}