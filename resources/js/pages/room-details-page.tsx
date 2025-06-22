import { type SharedData } from '@/types';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import ImageGallery from '@/components/image-gallery';

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
    facilities: string[];
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
}

export default function RoomDetailsPage() {
    const { auth, room } = usePage<PageProps>().props;
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

    const handleReportListing = async () => {
        if (!reportType) {
            alert('Please select a report type');
            return;
        }

        try {
            // This would be a new route for reporting listings
            alert(`Report submitted: ${reportType}\nDescription: ${reportDescription}`);
            setShowReportModal(false);
            setReportType('');
            setReportDescription('');
        } catch (error) {
            console.error('Error reporting listing:', error);
            alert('Error submitting report');
        }
    };

    const handleRent = () => {
        if (!auth.user) {
            router.visit(route('login'));
            return;
        }
        alert(`Rent request for ${room.title} - Payment integration coming soon!`);
    };

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

    return (
        <>
            <Head title={`${room.title} - Papikos`}>
                <meta name="csrf-token" content={document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''} />
            </Head>
            
            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center">
                                <Link href={route('landing.page')} className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-600 rounded mr-3 flex items-center justify-center">
                                        <span className="text-white text-xs">🏠</span>
                                    </div>
                                    <span className="text-xl font-semibold text-gray-800">papikos</span>
                                </Link>
                            </div>

                            <nav className="flex items-center space-x-6">
                                {auth.user ? (
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm text-gray-700">{auth.user.name}</span>
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span className="text-xs font-medium">{auth.user.name?.charAt(0)}</span>
                                        </div>
                                    </div>
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

                {/* Breadcrumb */}
                <div className="bg-gray-50 py-3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center text-sm">
                            <button onClick={() => router.visit(route('landing.page'))} className="text-gray-500 hover:text-gray-700 flex items-center">
                                <span className="mr-2">✕</span> {room.location}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div>
                        {/* Image Gallery - Now using the component */}
                        <div className="mb-6 h-128 overflow-hidden">
                            <ImageGallery images={room.images} className="h-full" />
                        </div>
                        
                        {/* Room Info with Action Buttons */}
                        <div className="mb-8">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Kos {room.title}</h1>
                                    <div className="flex items-center space-x-4">
                                        <span className="text-xl font-bold text-gray-900">{formatPrice(room.price)}/bulan</span>
                                        <span className="text-sm text-gray-600">Tidak termasuk listrik</span>
                                    </div>
                                </div>
                                
                                {/* Right side content - stacked vertically */}
                                <div className="flex flex-col items-end space-y-3">
                                    {/* Icons Row */}
                                    <div className="flex items-center space-x-3">
                                        <button className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                                            <span className="text-red-500 text-sm">♥</span>
                                        </button>
                                        <div className="flex items-center space-x-1">
                                            <span className="text-yellow-400 text-lg">★</span>
                                            <span className="font-medium">{room.rating}</span>
                                            <span className="text-gray-500 text-sm">({room.reviewCount} reviews)</span>
                                        </div>
                                        <button 
                                            onClick={() => setShowReportModal(true)}
                                            className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                            title="Report this listing"
                                        >
                                            <span className="text-red-500 text-sm">🚩</span>
                                        </button>
                                    </div>

                                    {/* Action Buttons - Smaller buttons */}
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleRent}
                                            className="bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center"
                                        >
                                            Apply for Rent
                                            <span className="ml-1 text-xs">→</span>
                                        </button>
                                        <button
                                            onClick={() => setShowScheduleModal(true)}
                                            className="bg-white border border-blue-600 text-blue-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
                                        >
                                            Schedule A Survey
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Room Highlights */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Room Highlights</h3>
                            <div className="grid grid-cols-3 gap-6">
                                {/* Left Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 text-gray-600">🚗</div>
                                        <div>
                                            <div className="font-medium text-sm">Parking</div>
                                            <div className="text-xs text-gray-500">20+ Motor</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 text-gray-600">🏠</div>
                                        <div>
                                            <div className="font-medium text-sm">Outdoor</div>
                                            <div className="text-xs text-gray-500">Gazebo</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 text-gray-600">❄️</div>
                                        <div>
                                            <div className="font-medium text-sm">AC</div>
                                            <div className="text-xs text-gray-500">Tersedia</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 text-gray-600">🛏️</div>
                                        <div>
                                            <div className="font-medium text-sm">Kamar Mandi Dalam</div>
                                            <div className="text-xs text-gray-500">Tersedia</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 text-gray-600">📺</div>
                                        <div>
                                            <div className="font-medium text-sm">Luas</div>
                                            <div className="text-xs text-gray-500">6x6x4 Meter</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-6 h-6 text-gray-600">🔧</div>
                                        <div>
                                            <div className="font-medium text-sm">Built in</div>
                                            <div className="text-xs text-gray-500">2024</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Listing Owner */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Listing Owner</h3>
                            <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium">{room.owner.name.charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium">{room.owner.name}</h4>
                                    <p className="text-sm text-gray-600 mb-3">Owner</p>
                                    
                                    <div className="mb-4">
                                        <h5 className="font-medium mb-2">Overview</h5>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {room.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-50 flex items-center justify-center">
                                        <span className="text-blue-600">💬</span>
                                    </button>
                                    <button className="w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-50 flex items-center justify-center">
                                        <span className="text-blue-600">📞</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Location Map */}
                        {room.embedded_map_link && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-4">Location on Maps</h3>
                                <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
                                    <iframe
                                        src={room.embedded_map_link}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                    {/* Blue marker overlay */}
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-lg">📍</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-blue-600 mt-2 flex items-center">
                                    <span className="text-gray-400 mr-2">🚗</span>
                                    ~mins to Commute Destination
                                </p>
                            </div>
                        )}

                        {/* Leave Review */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-6">Leave A Review!</h3>
                            <div className="grid grid-cols-4 gap-6 mb-6">
                                {Object.entries({
                                    cleanliness: 'Cleanliness Rating',
                                    security: 'Security Rating',
                                    comfort: 'Comfort Rating',
                                    value: 'Value Rating'
                                }).map(([key, label]) => (
                                    <div key={key} className="text-center">
                                        <p className="text-sm font-medium mb-3">{label}</p>
                                        <div className="flex justify-center space-x-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRatingClick(key, star)}
                                                    className={`text-2xl transition-colors ${
                                                        star <= reviewRatings[key as keyof typeof reviewRatings]
                                                            ? 'text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                >
                                                    ★
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                <div className="col-span-4">
                                    <label className="block text-sm font-medium mb-2">Message (optional)</label>
                                    <textarea
                                        value={reviewMessage}
                                        onChange={(e) => setReviewMessage(e.target.value)}
                                        placeholder="Enter message"
                                        className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                        rows={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Schedule Survey Modal */}
                {showScheduleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Schedule A Survey</h3>
                                <button 
                                    onClick={() => setShowScheduleModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                Schedule a tour to see if the place is the right one for you.
                            </p>

                            <div className="mb-6">
                                <h4 className="font-medium mb-3">Select a preferred time</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {timeSlots.map((slot, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedTimeSlot(`${slot.label} ${slot.time}`)}
                                            className={`p-3 text-left border rounded-lg text-sm transition-colors ${
                                                selectedTimeSlot === `${slot.label} ${slot.time}`
                                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            <div className="font-medium">{slot.label}</div>
                                            <div className="text-xs text-gray-500">{slot.time}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Message (optional)</label>
                                <textarea
                                    value={surveyMessage}
                                    onChange={(e) => setSurveyMessage(e.target.value)}
                                    placeholder="Enter message"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={3}
                                />
                            </div>

                            <div className="mb-6">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={wantFinancingInfo}
                                        onChange={(e) => setWantFinancingInfo(e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm">I want financing information</span>
                                </label>
                            </div>

                            <button
                                onClick={handleScheduleSurvey}
                                disabled={!selectedTimeSlot}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Request this time
                            </button>
                        </div>
                    </div>
                )}

                {/* Report Listing Modal */}
                {showReportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Report This Listing</h3>
                                <button 
                                    onClick={() => setShowReportModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-6">
                                Report this listing for untrustworthy behavior. Thank you for taking your time to do so.
                            </p>

                            <div className="mb-6">
                                <h4 className="font-medium mb-3">Select a Report Type</h4>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {['Inappropriate Content', 'Fake Listing', 'Spam', 'Other'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setReportType(type)}
                                            className={`p-3 text-center border rounded-lg text-sm transition-colors ${
                                                reportType === type
                                                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={reportDescription}
                                    onChange={(e) => setReportDescription(e.target.value)}
                                    placeholder="Enter message"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                    rows={4}
                                />
                            </div>

                            <button
                                onClick={handleReportListing}
                                disabled={!reportType}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Submit Report
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="bg-white border-t border-gray-200 py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-600 rounded mr-3 flex items-center justify-center">
                                    <span className="text-white text-xs">🏠</span>
                                </div>
                                <span className="font-medium">Logo</span>
                            </div>
                            <div>
                                <span className="text-sm text-gray-600">Company</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                                <select className="border-none bg-transparent text-sm">
                                    <option>English</option>
                                </select>
                                <span>© 2022 Brand, Inc. • Privacy • Terms • Sitemap</span>
                                <span>🌐</span>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}