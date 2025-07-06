import type { RoomDetailsPageProps, Report } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { 
    Flag, 
    ArrowRight, 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
    const [wantFinancingInfo, setWantFinancingInfo] = useState(false);
    const [reportType, setReportType] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportImages, setReportImages] = useState<File[]>([]);

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
                                    <h1 className="text-3xl font-semibold text-foreground mb-2">{room.title}</h1>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xl font-semibold text-muted-foreground">{formatPrice(room.price)}/month</span>
                                    </div>
                                </div>
                                
                                {/* Right side content - stacked vertically */}
                                <div className="flex flex-col items-end space-y-3">
                                    {/* Icons Row */}
                                    <div className="flex items-center space-x-3">
                                        {/* Report Button */}
                                        <IconButton
                                            onClick={handleReportClick}
                                            disabled={!auth.user}
                                            title={auth.user ? "Report this listing" : "Login to report this listing"}
                                        >
                                            <Flag className="w-4 h-4 transition-all duration-200 text-foreground hover:text-red-600 hover:drop-shadow-lg dark:hover:text-red-400" />
                                        </IconButton>

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