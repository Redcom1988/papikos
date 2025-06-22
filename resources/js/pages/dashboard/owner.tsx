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
        active_bookings: number;
        monthly_revenue: number;
        pending_payments: number;
    };
    recent_bookings: Array<{
        id: number;
        room_name: string;
        user_name: string;
        amount: number;
        status: string;
        created_at: string;
    }>;
}

export default function OwnerDashboard({ stats, recent_bookings }: OwnerDashboardProps) {
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
                            <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                            <p className="text-2xl font-bold">{stats.active_bookings}</p>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                            <p className="text-2xl font-bold">Rp {stats.monthly_revenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Pending Payments</p>
                            <p className="text-2xl font-bold">{stats.pending_payments}</p>
                        </div>
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative flex-1 overflow-hidden rounded-xl border">
                    <div className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Bookings</h3>
                        <div className="space-y-4">
                            {recent_bookings.map((booking) => (
                                <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{booking.room_name}</p>
                                        <p className="text-sm text-muted-foreground">by {booking.user_name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">Rp {booking.amount.toLocaleString()}</p>
                                        <p className="text-sm text-muted-foreground">{booking.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}