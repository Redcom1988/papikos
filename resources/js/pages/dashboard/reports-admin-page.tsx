import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Eye, Filter, Save, Users, House, Calendar } from 'lucide-react';
import { useState } from 'react';
import ReportImage from '@/components/ui/report-image';

interface Report {
    id: number;
    type: string;
    description: string;
    status: string;
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
        primary_image?: string;
    };
    owner: {
        id: number;
        name: string;
        email: string;
    };
    images: Array<{
        id: number;
        url: string;
    }>;
}

interface ReportsStatusPageProps {
    reports: {
        data: Report[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        status: string;
    };
}

export default function ReportsStatusPage({ reports, filters }: ReportsStatusPageProps) {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data, setData, patch, processing, reset } = useForm({
        status: '',
        admin_notes: '',
    });

    const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | 'warning' => {
        switch (status) {
            case 'resolved':
                return "default";
            case 'investigating':
                return "secondary";
            case 'dismissed':
                return "destructive";
            case 'pending':
                return "warning";
            default:
                return "outline";
        }
    };

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
        setData({
            status: report.status,
            admin_notes: report.admin_notes || '',
        });
        setDialogOpen(true);
    };

    const handleUpdateReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedReport) return;

        patch(`/dashboard/reports/${selectedReport.id}/status`, {
            onSuccess: () => {
                setDialogOpen(false);
                reset();
                setSelectedReport(null);
            }
        });
    };

    const handleFilterChange = (status: string) => {
        router.get('/dashboard/reports-admin', { status }, {
            preserveState: true,
            replace: true,
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Reports', href: '/dashboard/reports-admin' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Report Management" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Report Management</h1>
                        <p className="text-muted-foreground">
                            Review and manage user reports
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{reports.total} Total Reports</span>
                    </div>
                </div>

                {/* Reports Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Reports</CardTitle>
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <Select value={filters.status} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-48 h-10">
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Reports</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="dismissed">Dismissed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Report</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {reports.data.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {report.images && report.images.length > 0 && (
                                                    <ReportImage
                                                        src={report.images[0].url}
                                                        alt="Report evidence"
                                                        className="w-8 h-8 rounded"
                                                        loadingSize="sm"
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium capitalize">{report.type.replace('_', ' ')}</div>
                                                    <div className="text-sm text-muted-foreground truncate max-w-48">
                                                        {report.description}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <House className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium truncate max-w-32">{report.room.name}</div>
                                                    <div className="text-sm text-muted-foreground truncate max-w-32">
                                                        {report.room.address}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                {report.reporter.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={getStatusBadgeVariant(report.status)}>
                                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {report.created_at}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewReport(report)}
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {reports.last_page > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((reports.current_page - 1) * reports.per_page) + 1} to {Math.min(reports.current_page * reports.per_page, reports.total)} of {reports.total} reports
                                </div>
                                <div className="flex items-center gap-2">
                                    {reports.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={link.active ? "default" : "outline"}
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url)}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {reports.data.length === 0 && (
                            <div className="text-center py-8">
                                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                                <p className="text-muted-foreground">
                                    No reports match the current filter.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Report Detail Dialog */}
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Report Details</DialogTitle>
                        </DialogHeader>
                        {selectedReport && (
                            <div className="space-y-4">
                                {/* Report Info Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <Label className="font-medium text-xs text-muted-foreground">TYPE</Label>
                                        <p className="capitalize">{selectedReport.type.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <Label className="font-medium text-xs text-muted-foreground">STATUS</Label>
                                        <div className="mt-1">
                                            <Badge variant={getStatusBadgeVariant(selectedReport.status)}>
                                                {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="font-medium text-xs text-muted-foreground">REPORTER</Label>
                                        <p>{selectedReport.reporter.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedReport.reporter.email}</p>
                                    </div>
                                    <div>
                                        <Label className="font-medium text-xs text-muted-foreground">OWNER</Label>
                                        <p>{selectedReport.owner.name}</p>
                                        <p className="text-xs text-muted-foreground">{selectedReport.owner.email}</p>
                                    </div>
                                </div>

                                {/* Room */}
                                <div>
                                    <Label className="font-medium text-xs text-muted-foreground">ROOM</Label>
                                    <p className="text-sm">{selectedReport.room.name}</p>
                                    <p className="text-xs text-muted-foreground">{selectedReport.room.address}</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <Label className="font-medium text-xs text-muted-foreground">DESCRIPTION</Label>
                                    <p className="text-sm mt-1 p-2 bg-muted rounded text-foreground">{selectedReport.description}</p>
                                </div>

                                {/* Images */}
                                {selectedReport.images.length > 0 && (
                                    <div>
                                        <Label className="font-medium text-xs text-muted-foreground">EVIDENCE</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                                            {selectedReport.images.map((image) => (
                                                <img
                                                    key={image.id}
                                                    src={image.url}
                                                    alt="Evidence"
                                                    className="w-full h-20 object-cover rounded border"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Owner Response */}
                                {selectedReport.owner_response && (
                                    <div>
                                        <Label className="font-medium text-xs text-muted-foreground">OWNER RESPONSE</Label>
                                        <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedReport.owner_response}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {selectedReport.owner_responded_at}
                                        </p>
                                    </div>
                                )}

                                {/* Admin Form */}
                                <form onSubmit={handleUpdateReport} className="space-y-3 border-t pt-3">
                                    <Label className="font-medium text-xs text-muted-foreground">ADMIN ACTION</Label>
                                    
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="investigating">Investigating</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="dismissed">Dismissed</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <textarea
                                        className="w-full p-2 border rounded text-sm resize-none"
                                        value={data.admin_notes}
                                        onChange={e => setData('admin_notes', e.target.value)}
                                        placeholder="Internal notes..."
                                        rows={2}
                                    />

                                    <div className="flex gap-2">
                                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} size="sm" className="flex-1">
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={processing} size="sm" className="flex-1">
                                            <Save className="w-4 h-4 mr-1" />
                                            Update
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}