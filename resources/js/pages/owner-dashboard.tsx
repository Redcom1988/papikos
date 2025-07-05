// File: resources/js/pages/dashboard/owner.tsx
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

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
        total_appointments: number;
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

export default function OwnerDashboard({ stats, appointments }: OwnerDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Owner Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Stats Cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Rooms</p>
                            <p className="text-2xl font-bold">{stats.total_rooms}</p>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Available Rooms</p>
                            <p className="text-2xl font-bold">{stats.available_rooms}</p>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Occupied Rooms</p>
                            <p className="text-2xl font-bold">{stats.occupied_rooms}</p>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Total Appointments</p>
                            <p className="text-2xl font-bold">{stats.total_appointments}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Appointments */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
                        <div className="space-y-4">
                            {appointments.length > 0 ? (
                                appointments.map((appointment) => (
                                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{appointment.room_name}</p>
                                            <p className="text-sm text-muted-foreground">by {appointment.user_name}</p>
                                            {appointment.notes && (
                                                <p className="text-xs text-muted-foreground mt-1">{appointment.notes}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">{new Date(appointment.scheduled_at).toLocaleDateString()}</p>
                                            <p className="text-sm text-muted-foreground capitalize">{appointment.status}</p>
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