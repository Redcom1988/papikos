import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Flag, 
    ArrowRight, 
    ChevronRight, 
    Star, 
    BarChart3, 
    Home, 
    Globe 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageGallery from '@/components/ui/image-gallery';
import Modal from '@/components/ui/modal';
import OwnerCard from '@/components/ui/owner-card';
import { useBookmarks } from '@/hooks/use-bookmarks';
import BookmarkButton from '@/components/ui/bookmark-button';
import IconButton from '@/components/ui/icon-button';

// Update the RoomDetails interface
interface RoomDetails {
    id: number;
    title: string;
    description: string;
    price: number;
    location: string;
    embedded_map_link?: string;
    size: number;
    max_occupancy: number;
    rating: number;
    reviewCount: number;
    images: Array<{
        id: number;
        url: string;
        caption: string;
        is_primary: boolean;
    }>;
    // Updated facilities to be objects instead of strings
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
    reviews: Array<{
        id: number;
        user_name: string;
        overall_rating: number;
        cleanliness_rating: number;
        security_rating: number;
        comfort_rating: number;
        value_rating: number;
        comment: string;
        created_at: string;
        images: string[];
    }>;
    available_tours: string[];
}

interface PageProps extends SharedData {
    room: RoomDetails;
    userBookmarks?: number[]; // Add this
}

export default function RoomDetailsPage() {
    const { auth, room, userBookmarks = [] } = usePage<PageProps>().props;
    
    // Use the bookmark hook
    const { bookmarkedRooms, bookmarkLoading, handleBookmark, isBookmarked } = useBookmarks(userBookmarks);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [surveyMessage, setSurveyMessage] = useState('');
    const [wantFinancingInfo, setWantFinancingInfo] = useState(false);
    const [reportType, setReportType] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reviewRatings, setReviewRatings] = useState({
        cleanliness: 3,
        security: 3,
        comfort: 3,
        value: 3
    });
    const [reviewMessage, setReviewMessage] = useState('');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleScheduleSurvey = async () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }

        if (!selectedTimeSlot) {
            alert('Please select a time slot');
            return;
        }

        try {
            const response = await fetch(route('tour.book'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    room_id: room.id,
                    time_slot: selectedTimeSlot,
                    message: surveyMessage,
                    want_financing_info: wantFinancingInfo,
                }),
            });

            const result = await response.json();
            
            if (response.ok) {
                alert(`Survey scheduled successfully for ${selectedTimeSlot}`);
                setShowScheduleModal(false);
                setSelectedTimeSlot('');
                setSurveyMessage('');
                setWantFinancingInfo(false);
            } else {
                alert(result.error || 'Error scheduling survey');
            }
        } catch (error) {
            console.error('Error scheduling survey:', error);
            alert('Error scheduling survey');
        }
    };

    const handleRent = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        alert(`Rent request for ${room.title} - Payment integration coming soon!`);
    };

    const handleSurveySchedule = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        setShowScheduleModal(true);
    }

    const handleRatingClick = (category: string, rating: number) => {
        setReviewRatings(prev => ({
            ...prev,
            [category]: rating
        }));
    };

    const timeSlots = [
        { label: 'Min, Jul 2', time: '11:00 Wita - 1:00 Wita' },
        { label: 'Rab, Jul 5', time: '2:00 Wita - 4:00 Wita' },
        { label: 'Rab, Jul 5', time: '2:00 Wita - 4:00 Wita' },
        { label: 'Rab, Jul 5', time: '2:00 Wita - 4:00 Wita' },
    ];

    // Ensure page can scroll
    useEffect(() => {
        // Force restore scroll on component mount
        document.body.style.overflow = 'auto';
        
        // Cleanup on unmount
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // Also add scroll restoration when modals close
    useEffect(() => {
        if (!showScheduleModal && !showReportModal) {
            document.body.style.overflow = 'auto';
        }
    }, [showScheduleModal, showReportModal]);

    return (
        <>
            <Head title={`${room.title} - Papikos`}>
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            </Head>
            
            <div className="min-h-screen bg-background text-foreground overflow-auto">
                {/* Header */}
                <header className="bg-background border-b border-border">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
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
                                        {/* Dashboard Button - Updated with BarChart3 icon */}
                                        <button
                                            onClick={() => router.visit(route('dashboard'))}
                                            className="flex items-center space-x-2 bg-background border border-border text-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                                            title="Dashboard"
                                        >
                                            <span>Dashboard</span>
                                            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                                                <BarChart3 className="w-3 h-3 text-muted-foreground" />
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

                {/* Breadcrumb - Updated to match room listings style */}
                <div className="bg-muted/50 py-3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center text-sm">
                            <Link href={route('landing.page')} className="text-muted-foreground hover:text-foreground transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                            <Link href={route('rooms.index')} className="text-muted-foreground hover:text-foreground transition-colors">
                                Room Listings
                            </Link>
                            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
                            <span className="text-foreground font-medium">{room.title}</span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div>
                        {/* Image Gallery */}
                        <div className="mb-6 h-128 overflow-hidden">
                            <ImageGallery images={room.images} className="h-full" />
                        </div>
                        
                        {/* Room Info with Action Buttons */}
                        <div className="mb-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-semibold text-foreground mb-2">Kos {room.title}</h1>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xl font-bold text-foreground">{formatPrice(room.price)}/month</span>
                                        <span className="text-sm text-muted-foreground">Tidak termasuk listrik</span>
                                    </div>
                                </div>
                                
                                {/* Right side content - stacked vertically */}
                                <div className="flex flex-col items-end space-y-3">
                                    {/* Icons Row - Updated with consistent styling */}
                                    <div className="flex items-center space-x-3">
                                        {/* Report Button - Now matches bookmark styling */}
                                        <IconButton
                                            onClick={() => setShowReportModal(true)}
                                            title="Report this listing"
                                        >
                                            <Flag className="w-4 h-4 text-red-500" />
                                        </IconButton>
                                        
                                        {/* Bookmark Button */ }
                                        <BookmarkButton
                                            roomId={room.id}
                                            isBookmarked={isBookmarked(room.id)}
                                            isLoading={bookmarkLoading === room.id}
                                            onBookmark={handleBookmark}
                                            size="md"
                                        />
                                        
                                        {/* Rating Display - Updated with Star icon */}
                                        <div className="flex items-center space-x-1 bg-card border border-border rounded-full px-3 shadow-sm h-8 min-w-fit">
                                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                            <span className="font-medium text-sm text-card-foreground">{room.rating}</span>
                                            <span className="text-muted-foreground text-xs">({room.reviewCount})</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline" 
                                            onClick={handleRent}
                                            size="lg"
                                            className="border-border text-foreground hover:bg-muted"
                                        >
                                            Apply for Rent
                                            <ArrowRight className="w-3 h-3 ml-1" />
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={handleSurveySchedule}
                                            size="lg"
                                            className="border-border text-foreground hover:bg-muted"
                                        >
                                            Schedule A Survey
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Highlights - Updated to handle facility objects */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Room Highlights</h3>
                            
                            {room.facilities && room.facilities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {room.facilities.map((facility) => (
                                        <span 
                                            key={facility.id}
                                            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                        >
                                            {facility.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
                                    <div className="text-muted-foreground">No facilities information available</div>
                                </div>
                            )}
                        </div>

                        {/* Listing Owner */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Listing Owner</h3>
                            <OwnerCard 
                                owner={room.owner}
                                description={room.description}
                                onMessageClick={() => alert('Message feature coming soon!')}
                                onCallClick={() => window.open(`tel:${room.owner.phone}`)}
                            />
                        </div>

                        {/* Location Map */}
                        {room.embedded_map_link && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Location on Maps</h3>
                                <div className="relative h-128 rounded-lg overflow-hidden bg-muted">
                                    <iframe
                                        src={room.embedded_map_link}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {/* Leave Review */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-foreground mb-6">Leave A Review!</h3>
                            <div className="grid grid-cols-4 gap-6 mb-6">
                                {Object.entries({
                                    cleanliness: 'Cleanliness Rating',
                                    security: 'Security Rating',
                                    comfort: 'Comfort Rating',
                                    value: 'Value Rating'
                                }).map(([key, label]) => (
                                    <div key={key} className="text-center">
                                        <p className="text-sm font-medium text-foreground mb-3">{label}</p>
                                        <div className="flex justify-center space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRatingClick(key, star)}
                                                    className={`transition-colors hover:scale-110 ${
                                                        star <= reviewRatings[key as keyof typeof reviewRatings]
                                                            ? 'text-yellow-400'
                                                            : 'text-muted-foreground/30'
                                                    }`}
                                                >
                                                    <Star className={`w-6 h-6 ${
                                                        star <= reviewRatings[key as keyof typeof reviewRatings]
                                                            ? 'fill-current'
                                                            : ''
                                                    }`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="col-span-4">
                                    <label className="block text-sm font-medium text-foreground mb-2">Message (optional)</label>
                                    <textarea
                                        value={reviewMessage}
                                        onChange={(e) => setReviewMessage(e.target.value)}
                                        placeholder="Enter message"
                                        className="w-full p-4 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Schedule Survey Modal */}
                <Modal
                    isOpen={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    title="Schedule A Survey"
                >
                    <p className="text-sm text-muted-foreground mb-6">
                        Schedule a tour to see if the place is the right one for you.
                    </p>

                    <div className="mb-6">
                        <h4 className="font-medium text-foreground mb-3">Select a preferred time</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {timeSlots.map((slot, index) => (
                                <Button
                                    key={index}
                                    variant={selectedTimeSlot === `${slot.label} ${slot.time}` ? "default" : "outline"}
                                    onClick={() => setSelectedTimeSlot(`${slot.label} ${slot.time}`)}
                                    className="h-auto p-3 text-left flex-col items-start"
                                >
                                    <div className="font-medium">{slot.label}</div>
                                    <div className="text-xs opacity-70">{slot.time}</div>
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-foreground mb-2">Message (optional)</label>
                        <textarea
                            value={surveyMessage}
                            onChange={(e) => setSurveyMessage(e.target.value)}
                            placeholder="Enter message"
                            className="w-full p-3 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            rows={3}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={wantFinancingInfo}
                                onChange={(e) => setWantFinancingInfo(e.target.checked)}
                                className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
                            />
                            <span className="ml-2 text-sm text-foreground">I want financing information</span>
                        </label>
                    </div>

                    <Button
                        onClick={handleScheduleSurvey}
                        disabled={!selectedTimeSlot}
                        className="w-full"
                    >
                        Request this time
                    </Button>
                </Modal>

                {/* Report Listing Modal */}
                <Modal
                    isOpen={showReportModal}
                    onClose={() => setShowReportModal(false)}
                    title="Report This Listing"
                >
                    <p className="text-sm text-muted-foreground mb-6">
                        Report this listing for untrustworthy behavior. Thank you for taking your time to do so.
                    </p>

                    <div className="mb-6">
                        <h4 className="font-medium text-foreground mb-3">Select a Report Type</h4>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            {['Inappropriate Content', 'Fake Listing', 'Spam', 'Other'].map((type) => (
                                <Button
                                    key={type}
                                    variant={reportType === type ? "default" : "outline"}
                                    onClick={() => setReportType(type)}
                                    className="text-center"
                                >
                                    {type}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                        <textarea
                            value={reportDescription}
                            onChange={(e) => setReportDescription(e.target.value)}
                            placeholder="Enter message"
                            className="w-full p-3 border border-border bg-background text-foreground rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                            rows={4}
                        />
                    </div>

                    <Button
                        onClick={handleRent}
                        disabled={!reportType}
                        className="w-full"
                    >
                        Submit Report
                    </Button>
                </Modal>

                {/* Footer - Updated with Lucide icons */}
                <footer className="bg-background border-t border-border py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-primary rounded mr-3 flex items-center justify-center">
                                    <Home className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <span className="font-medium text-foreground">Logo</span>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Company</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                                <select className="border-none bg-transparent text-sm text-muted-foreground">
                                    <option>English</option>
                                </select>
                                <span>© 2022 Brand, Inc. • Privacy • Terms • Sitemap</span>
                                <Globe className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}