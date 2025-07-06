import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Flag, Calendar, User, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AppBar from '@/components/ui/appbar';
import { Breadcrumbs } from '@/components/breadcrumbs';
import type { SharedData, Report } from '@/types';

interface RoomReportsPageProps extends SharedData {
    room: {
        id: number;
        title: string;
        address: string;
    };
    reports: {
        data: Report[];
        links: any[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}

export default function RoomReportsPage() {
    const { auth, room, reports } = usePage<RoomReportsPageProps>().props;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'investigating':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'pending':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'fraud':
            case 'safety_concern':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'fake_listing':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'inappropriate_content':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <>
            <Head title={`Reports for ${room.title} - Papikos`} />
            
            <div className="min-h-screen bg-background text-foreground">
                <AppBar auth={auth} />

                {/* Breadcrumbs */}
                <div className="bg-muted/50 py-3">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <Breadcrumbs
                            breadcrumbs={[
                                { title: 'Home', href: route('landing.page') },
                                { title: 'Room Listings', href: route('rooms.index') },
                                { title: room.title, href: route('room.show', room.id) },
                                { title: 'Reports', href: route('room.reports', room.id) }
                            ]}
                        />
                    </div>
                </div>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Flag className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground mb-2">Reports for {room.title}</h1>
                                <p className="text-muted-foreground mb-1">{room.address}</p>
                                <p className="text-sm text-muted-foreground">
                                    {reports.meta.total} {reports.meta.total === 1 ? 'report' : 'reports'} found
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reports List */}
                    {reports.data.length > 0 ? (
                        <div className="space-y-6">
                            {reports.data.map((report) => (
                                <div key={report.id} className="bg-card border border-border rounded-lg p-6">
                                    {/* Report Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline" className={getTypeColor(report.type)}>
                                                {report.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </Badge>
                                            <Badge variant="outline" className={getStatusColor(report.status)}>
                                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            {report.created_at}
                                        </div>
                                    </div>

                                    {/* Report Content */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-foreground mb-2">Report Description</h3>
                                        <p className="text-foreground leading-relaxed">{report.description}</p>
                                    </div>

                                    {/* Reporter Info */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            Reported by <span className="font-medium">{report.reporter.name}</span>
                                        </span>
                                    </div>

                                    {/* Report Images */}
                                    {report.images && report.images.length > 0 && (
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Evidence</span>
                                            </div>
                                            <div className="flex gap-3 overflow-x-auto pb-2">
                                                {report.images.map((image) => (
                                                    <img
                                                        key={image.id}
                                                        src={image.url}
                                                        alt="Report evidence"
                                                        className="w-24 h-24 object-cover rounded-lg border border-border flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                                        onClick={() => window.open(image.url, '_blank')}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Owner Response */}
                                    {report.owner_response ? (
                                        <div className="bg-muted/30 border border-border rounded-lg p-4 mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-semibold text-primary">Owner Response</h4>
                                                {report.owner_responded_at && (
                                                    <span className="text-xs text-muted-foreground">
                                                        {new Date(report.owner_responded_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-foreground mb-3 leading-relaxed">
                                                {report.owner_response}
                                            </p>
                                            {report.owner_response_action && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">Action taken:</span>
                                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        {report.owner_response_action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                    </Badge>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-muted/20 border border-dashed border-border rounded-lg p-4 mt-4 text-center">
                                            <p className="text-muted-foreground text-sm">No response from owner yet</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Flag className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">No Reports Found</h3>
                            <p className="text-muted-foreground">
                                This room has no reports or all reports have been dismissed.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {reports.meta.last_page > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center gap-2">
                                {reports.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 rounded-md text-sm ${
                                            link.active
                                                ? 'bg-primary text-primary-foreground'
                                                : link.url
                                                ? 'bg-background border border-border text-foreground hover:bg-muted'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}