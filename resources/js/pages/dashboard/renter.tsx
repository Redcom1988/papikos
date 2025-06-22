// File: resources/js/pages/dashboard/renter.tsx
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface RenterDashboardProps {
    bookmarked_rooms: Array<{
        id: number;
        name: string;
        price: number;
        address: string;
        primary_image?: string;
    }>;
    recent_appointments: Array<{
        id: number;
        room_name: string;
        scheduled_at: string;
        status: string;
    }>;
    recent_payments: Array<{
        id: number;
        room_name: string;
        amount: number;
        status: string;
        paid_at: string;
    }>;
}

export default function RenterDashboard({ 
    bookmarked_rooms, 
    recent_appointments, 
    recent_payments 
}: RenterDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Quick Actions */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <h3 className="font-semibold mb-2">Find Rooms</h3>
                        <p className="text-sm text-muted-foreground mb-4">Browse available rooms in your area</p>
                        <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                            Search Rooms
                        </button>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <h3 className="font-semibold mb-2">My Bookmarks</h3>
                        <p className="text-sm text-muted-foreground mb-4">{bookmarked_rooms.length} saved rooms</p>
                        <button className="w-full border border-border px-4 py-2 rounded-lg">
                            View Bookmarks
                        </button>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <h3 className="font-semibold mb-2">Appointments</h3>
                        <p className="text-sm text-muted-foreground mb-4">Schedule room viewings</p>
                        <button className="w-full border border-border px-4 py-2 rounded-lg">
                            View Appointments
                        </button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Recent Appointments */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Appointments</h3>
                        <div className="space-y-3">
                            {recent_appointments.slice(0, 3).map((appointment) => (
                                <div key={appointment.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{appointment.room_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {new Date(appointment.scheduled_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                        {appointment.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative overflow-hidden rounded-xl border p-6">
                        <h3 className="text-lg font-semibold mb-4">Recent Payments</h3>
                        <div className="space-y-3">
                            {recent_payments.slice(0, 3).map((payment) => (
                                <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                                    <div>
                                        <p className="font-medium">{payment.room_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Rp {payment.amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                        {payment.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}