import type { RoomDetailsPageProps, Report } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    Flag, 
    ArrowRight, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/ui/icon-button';
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
import MobileChat, { type MobileChatRef } from '@/components/ui/mobile-chat';

export default function RoomDetailsPage() {
    const { auth, room, userBookmarks = [] } = usePage<RoomDetailsPageProps>().props;
    const mobileChatRef = useRef<MobileChatRef>(null);
    
    // Use the bookmark hook
    const { bookmarkedRooms, bookmarkLoading, handleBookmark, isBookmarked } = useBookmarks(userBookmarks);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
    const [surveyMessage, setSurveyMessage] = useState('');
    const [reportType, setReportType] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportImages, setReportImages] = useState<File[]>([]);

    console.log('Room details page loaded with room:', room);

    const handleScheduleSurvey = async () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }

        if (!selectedTimeSlot) {
            alert('Please select a time slot');
            return;
        }

        // Format the datetime properly for Laravel
        const formattedDateTime = selectedTimeSlot.includes(':00') 
            ? selectedTimeSlot 
            : selectedTimeSlot + ':00';

        console.log('Scheduling survey with data:', {
            room_id: room.id,
            scheduled_at: formattedDateTime,
            notes: surveyMessage,
        });

        try {
            router.post(route('appointments.store'), {
                room_id: room.id,
                scheduled_at: formattedDateTime,
                notes: surveyMessage,
            }, {
                onSuccess: () => {
                    alert('Survey scheduled successfully!');
                    setShowScheduleDialog(false);
                    setSelectedTimeSlot('');
                    setSurveyMessage('');
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                    if (errors.message) {
                        alert(errors.message);
                    } else {
                        const errorMessages = Object.values(errors).flat();
                        alert('Validation errors:\n' + errorMessages.join('\n'));
                    }
                }
            });
        } catch (error) {
            console.error('Error scheduling survey:', error);
            alert('Error scheduling survey. Please try again.');
        }
    };

    const handleSurveySchedule = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        setShowScheduleDialog(true);
    }

    const handleReportClick = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        setShowReportDialog(true);
    };

    const handleSubmitReport = async () => {
        if (!reportType) {
            alert('Please select a report type');
            return;
        }
        
        if (!reportDescription.trim()) {
            alert('Please provide a description');
            return;
        }

        // Show confirmation for serious reports
        if (['fraud', 'safety_concern'].includes(reportType)) {
            const confirmed = confirm(
                'This is a serious report. Are you sure you want to proceed? ' +
                'False reports may result in account restrictions.'
            );
            if (!confirmed) return;
        }

        try {
            const formData = new FormData();
            formData.append('room_id', room.id.toString());
            formData.append('type', reportType);
            formData.append('description', reportDescription);

            // Append files to formData
            reportImages.forEach((file, index) => {
                formData.append(`images[${index}]`, file);
            });

            // Use Inertia's router for form submission
            router.post(route('reports.store'), formData, {
                onSuccess: (page) => {
                    alert('Report submitted successfully. Thank you for helping keep our community safe.');
                    setShowReportDialog(false);
                    setReportType('');
                    setReportDescription('');
                    setReportImages([]);
                },
                onError: (errors) => {
                    if (errors.message) {
                        alert(errors.message);
                    } else {
                        const errorMessages = Object.values(errors).flat().join('\n');
                        alert('Validation errors:\n' + errorMessages);
                    }
                },
                onFinish: () => {
                    // Any cleanup if needed
                }
            });

        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Network error. Please check your connection and try again.');
        }
    };
        const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleMessageOwner = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        
        // Open mobile chat with the owner
        mobileChatRef.current?.openChatWithUser({
            id: room.owner.id,
            name: room.owner.name,
            email: room.owner.email
        });
    };

    return (
        <>
            <Head title={`${room.name} - Papikos`}>
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
                        { title: room.name, href: route('room.show', room.id) }
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
                            <div className="flex justify-between items-start gap-6 mb-6">
                                <div className="flex-1 min-w-0">
                                    {/* Location */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-muted-foreground font-medium">{room.address}</span>
                                    </div>
                                    
                                    {/* Room Name */}
                                    <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">{room.name}</h1>
                                    
                                    {/* Price */}
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-bold text-primary">Rp {formatPrice(room.price)}</span>
                                        <span className="text-lg text-muted-foreground font-medium">/month</span>
                                    </div>
                                    
                                    {/* Room Details */}
                                    <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                                        {room.size && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                                </svg>
                                                <span>{room.size} m²</span>
                                            </div>
                                        )}
                                        {room.max_occupancy && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                <span>Max {room.max_occupancy} person{room.max_occupancy > 1 ? 's' : ''}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${room.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className={room.is_available ? 'text-green-600' : 'text-red-300'}>
                                                {room.is_available ? 'Available' : 'Not Available'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right side content - Action buttons and icons */}
                                <div className="flex flex-col items-end gap-4">
                                    {/* Icons Row */}
                                    <div className="flex items-center gap-3">
                                        {/* Report Button */}
                                        <IconButton
                                            onClick={handleReportClick}
                                            disabled={!auth.user}
                                            title={auth.user ? "Report this listing" : "Login to report this listing"}
                                            className="hover:bg-muted/70 hover:border-border"
                                            size="ml"
                                        >
                                            <Flag className="w-5 h-5 text-muted-foreground hover:text-red-600 dark:hover:text-red-400" />
                                        </IconButton>

                                        <BookmarkButton
                                            roomId={room.id}
                                            isBookmarked={isBookmarked(room.id)}
                                            isLoading={bookmarkLoading === room.id}
                                            onBookmark={handleBookmark}
                                            size="ml"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3">                                        
                                        <Button 
                                            onClick={handleSurveySchedule}
                                            size="lg"
                                            disabled={!room.is_available || room.available_tours.length === 0}
                                            className="min-w-[160px] shadow-lg"
                                        >
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            Schedule Survey
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

                        {/* Room Description */}
                        {room.description && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Description</h3>
                                <div className="bg-muted/50 border border-border rounded-lg p-6">
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                                        {room.description}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Listing Owner */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Listing Owner</h3>
                            <OwnerCard 
                                owner={room.owner}
                                onMessageClick={handleMessageOwner}
                            />
                        </div>

                        {/* Recent Reports Section */}
                        {room.reports && room.reports.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Reports & Responses</h3>
                                <div className="bg-muted/50 border border-border rounded-lg p-6">
                                    <div className="space-y-6">
                                        {room.reports.map((report: Report) => (
                                            <div key={report.id} className="bg-background border border-border rounded-lg p-4">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-foreground capitalize">
                                                            {report.type.replace('_', ' ')}
                                                        </span>
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                            report.status === 'resolved' 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                                : report.status === 'investigating'
                                                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {report.status}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {report.created_at}
                                                    </span>
                                                </div>
                                                
                                                <div className="mb-3">
                                                    <p className="text-sm text-foreground mb-2">
                                                        <span className="font-medium">Report:</span> {report.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Reported by {report.reporter.name}
                                                    </p>
                                                </div>

                                                {/* Report Images */}
                                                {report.images && report.images.length > 0 && (
                                                    <div className="mb-3">
                                                        <div className="flex gap-2 overflow-x-auto">
                                                            {report.images.map((image) => (
                                                                <img
                                                                    key={image.id}
                                                                    src={image.url}
                                                                    alt="Report evidence"
                                                                    className="w-16 h-16 object-cover rounded border border-border flex-shrink-0"
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Owner Response */}
                                                {report.owner_response && (
                                                    <div className="bg-muted/50 border border-border rounded-lg p-3 mt-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-medium text-primary">
                                                                Owner Response
                                                            </span>
                                                            {report.owner_responded_at && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(report.owner_responded_at).toLocaleDateString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-foreground mb-2">
                                                            {report.owner_response}
                                                        </p>
                                                        {report.owner_response_action && (
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-xs text-muted-foreground">Action taken:</span>
                                                                <span className="text-xs font-medium text-foreground capitalize">
                                                                    {report.owner_response_action.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* View More Reports Link */}
                                    <div className="mt-6 pt-4 border-t border-border text-center">
                                        <Link 
                                            href={`/rooms/${room.id}/reports`}
                                            className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1"
                                        >
                                            View all reports
                                            <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                    placeholder="Any specific questions or requests?"
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleScheduleSurvey}
                                disabled={!selectedTimeSlot}
                                className="w-full"
                            >
                                Schedule Survey
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
                                    {[
                                        { value: 'inappropriate_content', label: 'Inappropriate Content' },
                                        { value: 'fake_listing', label: 'Fake Listing' },
                                        { value: 'fraud', label: 'Fraud/Scam' },
                                        { value: 'safety_concern', label: 'Safety Concern' },
                                        { value: 'other', label: 'Other' }
                                    ].map((type) => (
                                        <Button
                                            key={type.value}
                                            variant={reportType === type.value ? "default" : "outline"}
                                            onClick={() => setReportType(type.value)}
                                            className="text-center w-full min-h-[44px] px-3 py-2 text-sm leading-tight break-words"
                                        >
                                            {type.label}
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

                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Evidence (Optional)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setReportImages(files.slice(0, 3)); // Max 3 images
                                    }}
                                    className="w-full p-2 border border-border rounded-lg"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    Upload up to 3 images as evidence (optional)
                                </p>
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

                {/* Mobile Chat Component */}
                <MobileChat ref={mobileChatRef} />
            </div>
        </>
    );
}