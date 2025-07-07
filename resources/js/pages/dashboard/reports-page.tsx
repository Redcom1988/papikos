import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Pagination from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle, Clock, Image as ImageIcon, MapPin, MessageSquare, User, Calendar } from 'lucide-react';
import { useState } from 'react';
import ReportImage from '@/components/ui/report-image';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/dashboard/reports' },
];

interface ReportImage {
    id: number;
    url: string;
}

interface Report {
    id: number;
    type: string;
    description: string;
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
    admin_notes?: string;
    owner_response?: string;
    owner_response_action?: string;
    owner_responded_at?: string;
    created_at: string;
    reporter: {
        id: number;
        name: string;
        email: string;
    };
    room: {
        id: number;
        name: string;
        address: string;
    };
    images: ReportImage[];
}

interface ReportsPageProps {
    reports: {
        data: Report[];
        current_page: number;
        last_page: number;
        total: number;
        from: number;
        to: number;
    };
    [key: string]: any; 
}

export default function ReportsPage() {
    const { reports } = usePage<ReportsPageProps>().props;
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        action: '',
        response: '',
    });

    const handleRespond = (report: Report) => {
        setSelectedReport(report);
        setIsDialogOpen(true);
        reset();
    };

    const submitResponse = () => {
        if (!selectedReport) return;

        post(`/dashboard/reports/${selectedReport.id}/respond`, {
            onSuccess: () => {
                setIsDialogOpen(false);
                setSelectedReport(null);
                reset();
            },
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4" />;
            case 'investigating':
                return <MessageSquare className="w-4 h-4" />;
            case 'resolved':
                return <CheckCircle className="w-4 h-4" />;
            case 'dismissed':
                return <AlertCircle className="w-4 h-4" />;
            default:
                return <AlertCircle className="w-4 h-4" />;
        }
    };

    const getStatusVariant = (status: string): "default" | "warning" | "destructive" | "outline" | "secondary" => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'investigating':
                return 'outline';
            case 'resolved':
                return 'default';
            case 'dismissed':
                return 'destructive';
            default:
                return 'secondary';
        }
    };

    const getTypeLabel = (type: string) => {
        const types = {
            inappropriate_content: 'Inappropriate Content',
            fake_listing: 'Fake Listing',
            fraud: 'Fraud',
            safety_concern: 'Safety Concern',
            other: 'Other'
        };
        return types[type as keyof typeof types] || type;
    };

    const getActionLabel = (action: string) => {
        const actions = {
            issue_resolved: 'Issue Resolved',
            listing_updated: 'Listing Updated',
            additional_info: 'Additional Information Provided',
            dispute: 'Dispute Response'
        };
        return actions[action as keyof typeof actions] || action;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports - Owner Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Reports</h1>
                        <p className="text-muted-foreground">
                            Manage reports for your properties
                        </p>
                    </div>
                </div>

                {/* Reports List */}
                <div className="space-y-6">
                    {reports.data.length > 0 ? (
                        reports.data.map((report) => (
                            <div
                                key={report.id}
                                className="bg-card border rounded-lg p-6 space-y-4"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-lg">{getTypeLabel(report.type)}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                <span className="font-medium">{report.room.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                <span>Reported by: {report.reporter.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>{new Date(report.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Badge
                                        variant={getStatusVariant(report.status)}
                                        className="min-h-[2rem] flex items-center"
                                    >
                                        {getStatusIcon(report.status)}
                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                    </Badge>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">Report Description:</h4>
                                    <p className="text-muted-foreground">{report.description}</p>
                                </div>

                                {/* Report Images */}
                                {report.images && report.images.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4" />
                                            <h4 className="font-medium">Evidence ({report.images.length} image{report.images.length > 1 ? 's' : ''})</h4>
                                        </div>
                                        <div className="flex gap-2 flex-wrap">
                                            {report.images.map((image) => (
                                                <ReportImage
                                                    key={image.id}
                                                    src={image.url}
                                                    alt="Report evidence"
                                                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:scale-105 transition-transform"
                                                    loadingSize="sm"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Owner Response */}
                                {report.owner_response && (
                                    <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">Your Response:</h4>
                                            <Badge variant="outline">
                                                {getActionLabel(report.owner_response_action || '')}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground">{report.owner_response}</p>
                                        <p className="text-xs text-muted-foreground">
                                            Responded on: {new Date(report.owner_responded_at!).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {/* Admin Notes */}
                                {report.admin_notes && (
                                    <div className="space-y-2 bg-muted/30 border border-blue-500/20 p-4 rounded-lg">
                                        <h4 className="font-medium text-blue-600 dark:text-blue-400">Admin Notes:</h4>
                                        <p className="text-muted-foreground">{report.admin_notes}</p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-sm text-muted-foreground">
                                        Reported: {new Date(report.created_at).toLocaleDateString()}
                                    </p>
                                    {(report.status === 'pending' || report.status === 'investigating') && !report.owner_response && (
                                        <Button onClick={() => handleRespond(report)}>
                                            Respond to Report
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
                            <p className="text-muted-foreground">
                                You haven't received any reports for your properties.
                            </p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {reports.last_page > 1 && (
                    <Pagination
                        currentPage={reports.current_page}
                        lastPage={reports.last_page}
                        onPageChange={(page) => window.location.href = `?page=${page}`}
                    />
                )}

                {/* Response Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Respond to Report</DialogTitle>
                            <DialogDescription>
                                Provide a response to this report from {selectedReport?.reporter.name}
                            </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Report Type: {selectedReport && getTypeLabel(selectedReport.type)}</h4>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                    {selectedReport?.description}
                                </p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Response Action</label>
                                <Select value={data.action} onValueChange={(value) => setData('action', value)}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select how you've addressed this report" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="issue_resolved">Issue Resolved</SelectItem>
                                        <SelectItem value="listing_updated">Listing Updated</SelectItem>
                                        <SelectItem value="additional_info">Additional Information</SelectItem>
                                        <SelectItem value="dispute">Dispute Report</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.action && (
                                    <p className="text-sm text-destructive mt-1">{errors.action}</p>
                                )}
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Your Response</label>
                                <Input
                                    as="textarea"
                                    rows={4}
                                    value={data.response}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('response', e.target.value)}
                                    placeholder="Explain how you've addressed this report or provide additional context..."
                                    className="mt-1"
                                    maxLength={1000}
                                />
                                {errors.response && (
                                    <p className="text-sm text-destructive mt-1">{errors.response}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button 
                                onClick={submitResponse} 
                                disabled={processing || !data.response.trim() || !data.action}
                            >
                                {processing ? 'Submitting...' : 'Submit Response'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}