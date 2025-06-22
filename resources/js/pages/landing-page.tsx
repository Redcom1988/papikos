import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';

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

interface PageProps extends SharedData {
    rooms: Room[];
    facilities: string[];
    filters: {
        min_price: number;
        max_price: number;
        facilities: string[];
    };
}

export default function LandingPage() {
    const { auth, rooms, facilities, filters: initialFilters } = usePage<PageProps>().props;
    const [filters, setFilters] = useState({
        minPrice: initialFilters.min_price,
        maxPrice: initialFilters.max_price,
        facilities: initialFilters.facilities
    });
    const [loading, setLoading] = useState(false);

    const applyFilters = () => {
        setLoading(true);
        router.get(route('landing.page'), {
            min_price: filters.minPrice,
            max_price: filters.maxPrice,
            facilities: filters.facilities,
        }, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    const handleFacilityToggle = (facility: string) => {
        setFilters(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facility)
                ? prev.facilities.filter(f => f !== facility)
                : [...prev.facilities, facility]
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
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            </Head>
            
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="bg-white border-b border-gray-100">
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
                                    <span className="text-xl font-semibold text-gray-800">papikos</span>
                                </Link>
                            </div>

                            {/* Navigation */}
                            <nav className="flex items-center space-x-6">
                                {auth.user ? (
                                    <>
                                        <span className="text-sm text-gray-700">{auth.user.name}</span>
                                        <Link
                                            href={route('dashboard')}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                                        >
                                            Dashboard
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="text-gray-600 hover:text-gray-900 text-sm"
                                        >
                                            Log in
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-900"
                                        >
                                            Sign up
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="bg-white py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                Find the Perfect Temporary<br />
                                Housing for You
                            </h1>
                        </div>
                        
                        {/* Hero Content with Stats */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left side - Image */}
                            <div className="relative">
                                <div className="bg-gray-100 rounded-lg h-80 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gray-300 rounded-lg mx-auto mb-4"></div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            We are Here<br />
                                            For You.
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Right side - Stats */}
                            <div className="space-y-8">
                                <div className="text-center lg:text-right">
                                    <div className="text-4xl font-bold text-gray-900">
                                        {rooms.length || '12,550'}+
                                    </div>
                                    <div className="text-gray-600">Property Available</div>
                                </div>
                                
                                <div className="text-center lg:text-right">
                                    <div className="text-4xl font-bold text-gray-900">500+</div>
                                    <div className="text-gray-600">Total Owners</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Listings Section */}
                <section className="bg-gray-50 py-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Find The Right One For You:<br />
                                    Explore Our Current Listings!
                                </h2>
                                <p className="text-gray-600">150+ Kos Di Jambaran, Bolong</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="#"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center"
                                >
                                    More property
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            </div>
                        </div>

                        {/* Filters Sidebar and Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Filters Sidebar */}
                            <div className="lg:col-span-1">
                                <div className="bg-white p-6 rounded-lg shadow-sm border">
                                    <h3 className="font-semibold text-gray-900 mb-4">Fasilitas</h3>
                                    
                                    {/* Facilities */}
                                    <div className="space-y-3 mb-6">
                                        {facilities.slice(0, 6).map(facility => (
                                            <label key={facility} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filters.facilities.includes(facility)}
                                                    onChange={() => handleFacilityToggle(facility)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{facility}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <h3 className="font-semibold text-gray-900 mb-4">Price</h3>
                                    
                                    {/* Price Ranges */}
                                    <div className="space-y-3 mb-6">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                            <span className="ml-3 text-sm text-gray-700">Below 500k</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                            <span className="ml-3 text-sm text-gray-700">From 500k-900k</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                            <span className="ml-3 text-sm text-gray-700">From 1000k-1500k</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                            <span className="ml-3 text-sm text-gray-700">Above 2000k</span>
                                        </label>
                                    </div>

                                    <h3 className="font-semibold text-gray-900 mb-4">Reviews</h3>
                                    
                                    {/* Reviews */}
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                            <span className="ml-3 text-sm text-gray-700">4.0+ rating</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                            <span className="ml-3 text-sm text-gray-700">3.5+ rating</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                                            <span className="ml-3 text-sm text-gray-700">3.0+ rating</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Room Listings */}
                            <div className="lg:col-span-3">
                                {loading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {rooms.map(room => (
                                            <div key={room.id} className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
                                                {/* Room Image */}
                                                <Link href={route('room.show', room.id)} className="block">
                                                    <div className="h-48 bg-gray-200 relative">
                                                        {room.primary_image ? (
                                                            <img 
                                                                src={room.primary_image} 
                                                                alt={room.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-20"></div>
                                                        )}
                                                        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm hover:shadow-md">
                                                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </Link>

                                                <div className="p-4">
                                                    {/* Location */}
                                                    <p className="text-sm text-gray-500 mb-1">{room.location}</p>
                                                    
                                                    {/* Room Title */}
                                                    <Link href={route('room.show', room.id)} className="block">
                                                        <h3 className="font-semibold text-lg text-gray-900 mb-2 hover:text-blue-600">
                                                            {room.title}
                                                        </h3>
                                                    </Link>
                                                    
                                                    {/* Room Details */}
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        {room.size}m² • {room.max_occupancy} person • 1 guest rated these
                                                    </p>

                                                    {/* Rating */}
                                                    <div className="flex items-center mb-3">
                                                        <div className="flex text-yellow-400 mr-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg key={i} className="w-4 h-4" fill={i < Math.floor(room.rating) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {room.rating.toFixed(1)}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-1">
                                                            ({room.reviewCount} reviews)
                                                        </span>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-gray-900">
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
                                        <div className="text-gray-400 text-lg">No rooms found matching your criteria</div>
                                        <button
                                            onClick={clearFilters}
                                            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
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