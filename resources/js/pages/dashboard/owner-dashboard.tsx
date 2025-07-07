// File: resources/js/pages/dashboard/owner.tsx
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
    Home,
    CheckCircle2,
    XCircle,
    Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Owner Dashboard',
        href: '/dashboard',
    },
];

interface OwnerDashboardProps {
    stats: {
        total_rooms: number;
        available_rooms: number;
        occupied_rooms: number;
        upcoming_appointments: number;
    };
    appointments: Array<{
        id: number;
        user_name: string;
        room_name: string;
        scheduled_at: string;
        status: string;
        notes?: string;
    }>;
}

// Helper for badge variant
function getStatusVariant(status: string) {
    switch (status) {
        case "scheduled":
            return "warning";
        case "completed":
            return "default";
        case "cancelled":
            return "destructive";
        default:
            return "outline";
    }
}

export default function OwnerDashboard({ stats, appointments }: OwnerDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Owner Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
                        <Home className="w-8 h-8 text-gray-500" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                            <p className="text-2xl font-bold">{stats.total_rooms}</p>
                        </div>
                    </div>
                    <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Available Rooms</p>
                            <p className="text-2xl font-bold">{stats.available_rooms}</p>
                        </div>
                    </div>
                    <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
                        <XCircle className="w-8 h-8 text-destructive" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Occupied Rooms</p>
                            <p className="text-2xl font-bold">{stats.occupied_rooms}</p>
                        </div>
                    </div>
                    <div className="bg-card border rounded-xl p-6 flex items-center gap-4">
                        <Calendar className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                            <p className="text-2xl font-bold">{stats.upcoming_appointments}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="bg-card border rounded-xl flex-1 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
                        <div className="space-y-4">
                            {appointments.length > 0 ? (
                                appointments.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/30 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{appointment.room_name}</p>
                                            <p className="text-sm text-muted-foreground">by {appointment.user_name}</p>
                                            {appointment.notes && (
                                                <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                                            )}
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <p className="font-medium">{new Date(appointment.scheduled_at).toLocaleDateString()}</p>
                                            <Badge variant={getStatusVariant(appointment.status)}>
                                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No appointments yet</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}