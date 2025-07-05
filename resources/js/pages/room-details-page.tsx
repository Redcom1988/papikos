import type { RoomDetailsPageProps } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Flag, 
    ArrowRight, 
    ChevronRight, 
    Star, 
    Home, 
    Globe 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import ImageGallery from '@/components/ui/image-gallery';
import OwnerCard from '@/components/ui/owner-card';
import { useBookmarks } from '@/hooks/use-bookmarks';
import BookmarkButton from '@/components/ui/bookmark-button';
import AppBar from '@/components/ui/appbar';
import Tag from '@/components/ui/tag';
import { Breadcrumbs } from '@/components/breadcrumbs';

export default function RoomDetailsPage() {
    const { auth, room, userBookmarks = [] } = usePage<RoomDetailsPageProps>().props;
    
    // Use the bookmark hook
    const { bookmarkedRooms, bookmarkLoading, handleBookmark, isBookmarked } = useBookmarks(userBookmarks);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [surveyMessage, setSurveyMessage] = useState('');
    const [wantFinancingInfo, setWantFinancingInfo] = useState(false);
    const [reportType, setReportType] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reviewMessage, setReviewMessage] = useState('');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleReviewSubmit = async () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        } else {
            alert('Review submitted successfully!'); // TODO: Implement actual review submission
        }
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
                setShowScheduleDialog(false);
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
        setShowScheduleDialog(true);
    }

    const handleSubmitReport = () => {
        if (!reportType) {
            alert('Please select a report type');
            return;
        }
        
        // TODO: Implement actual report submission
        alert('Report submitted successfully');
        setShowReportDialog(false);
        setReportType('');
        setReportDescription('');
    };

    // Also add scroll restoration when dialog close
    useEffect(() => {
        if (!showScheduleDialog && !showReportDialog) {
            document.body.style.overflow = 'auto';
        }
    }, [showScheduleDialog, showReportDialog]);

    return (
        <>
            <Head title={`${room.title} - Papikos`}>
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            </Head>
            
            <div className="min-h-screen bg-background text-foreground overflow-auto">
                {/* Header - Using AppBar component */}
                <AppBar auth={auth} />

                <div className="bg-muted/50 py-3">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                      breadcrumbs={[
                        { title: 'Home', href: route('landing.page') },
                        { title: 'Room Listings', href: route('rooms.index') },
                        { title: room.title, href: route('room.show', room.id) }
                      ]}
                    />
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
                                    {/* Icons Row */}
                                    <div className="flex items-center space-x-3">
                                        {/* Report Button */}
                                        <Button
                                            variant="icon"
                                            size="icon"
                                            onClick={() => setShowReportDialog(true)}
                                            title="Report this listing"
                                        >
                                            <Flag className="w-4 h-4" />
                                        </Button>
                                        
                                        <BookmarkButton
                                            roomId={room.id}
                                            isBookmarked={isBookmarked(room.id)}
                                            isLoading={bookmarkLoading === room.id}
                                            onBookmark={handleBookmark}
                                            size="md"
                                        />
                                        
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
                                            disabled={room.available_tours.length === 0}
                                            className="border-border text-foreground hover:bg-muted disabled:opacity-50"
                                        >
                                            Schedule A Survey
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Facilities */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Room Facilities</h3>
                            
                            {room.facilities && room.facilities.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {room.facilities.map((facility) => (
                                        <Tag
                                            key={facility.id}
                                            variant="primary"
                                            icon={facility.icon ? <span className="text-xs">{facility.icon}</span> : undefined}
                                        >
                                            {facility.name}
                                        </Tag>
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
                    </div>
                </main>

                {/* Schedule Survey Dialog */}
                <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
                    <DialogContent className="sm:max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Schedule A Survey</DialogTitle>
                            <DialogDescription>
                                Schedule a tour to see if the place is the right one for you.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-foreground mb-3">Select a preferred time</h4>
                                {room.available_tours.length > 0 ? (
                                    <div className="grid grid-cols-4 gap-3">
                                        {room.available_tours.map((slot, index) => (
                                            <Button
                                                key={index}
                                                variant={selectedTimeSlot === slot.datetime ? "default" : "outline"}
                                                onClick={() => setSelectedTimeSlot(slot.datetime)}
                                                className="h-auto py-3 px-2 text-left flex-col items-start w-full min-h-[70px]"
                                            >
                                                <div className="font-medium text-xs leading-tight break-words">{slot.label}</div>
                                                <div className="text-xs opacity-70 mt-1 break-words">{slot.display_time}</div>
                                            </Button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        Tours are not available for this room
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Message (optional)</label>
                                <Input
                                    value={surveyMessage}
                                    onChange={(e) => setSurveyMessage(e.target.value)}
                                    placeholder="Enter message"
                                    className="resize-none"
                                />
                            </div>

                            <div>
                                <label className="flex items-center">
                                    <Checkbox
                                        checked={wantFinancingInfo}
                                        onCheckedChange={(checked) => setWantFinancingInfo(checked === true)}
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
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Report Listing Dialog */}
                <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
                    <DialogContent className="sm:max-w-lg">
                        <DialogHeader>
                            <DialogTitle>Report This Listing</DialogTitle>
                            <DialogDescription>
                                Report this listing for untrustworthy behavior. Thank you for taking your time to do so.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-foreground mb-3">Select a Report Type</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Inappropriate Content', 'Fake Listing', 'Spam', 'Other'].map((type) => (
                                        <Button
                                            key={type}
                                            variant={reportType === type ? "default" : "outline"}
                                            onClick={() => setReportType(type)}
                                            className="text-center w-full min-h-[44px] px-3 py-2 text-sm leading-tight break-words"
                                        >
                                            {type}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div>
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
                                onClick={handleSubmitReport}
                                disabled={!reportType}
                                className="w-full"
                            >
                                Submit Report
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}