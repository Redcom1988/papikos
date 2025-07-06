import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from '@/types';
import { Head } from "@inertiajs/react";
import {
    AlertTriangle,
    Building,
    CheckCircle,
    Clock,
    DollarSign,
    Flag,
    Home,
    Users
} from "lucide-react";

interface AdminStats {
    users: {
        total: number;
        owners: number;
        renters: number;
        new_this_month: number;
    };
    rooms: {
        total: number;
        available: number;
        occupied: number;
        new_this_month: number;
        total_value: number;
    };
    reports: {
        total: number;
        pending: number;
        investigating: number;
        resolved: number;
        unresolved: number;
    };
}

interface AdminDashboardProps {
    stats: AdminStats;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function AdminDashboard({ stats }: AdminDashboardProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground">
                            Platform overview and management statistics
                        </p>
                    </div>
                </div>

                {/* Quick Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {/* Total Users */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.users.total}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">+{stats.users.new_this_month}</span> new this month
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Rooms */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Rooms</CardTitle>
                            <Home className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.rooms.total}</div>
                            <p className="text-xs text-muted-foreground">
                                <span className="text-green-600">+{stats.rooms.new_this_month}</span> new this month
                            </p>
                        </CardContent>
                    </Card>

                    {/* Unresolved Reports */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reports</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{stats.reports.unresolved}</div>
                            <p className="text-xs text-muted-foreground">
                                Requires attention
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Value */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Property Value</CardTitle>
                            <DollarSign className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-emerald-600">
                                {formatCurrency(stats.rooms.total_value)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Combined room values
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Breakdown */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Users className="h-5 w-5 text-blue-500" />
                                User Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Building className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm font-medium">Property Owners</span>
                                </div>
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.users.owners}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Users className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium">Renters</span>
                                </div>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.users.renters}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t">
                                <span className="text-sm font-medium text-muted-foreground">Total Active</span>
                                <span className="text-xl font-bold">{stats.users.total}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Statistics */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Home className="h-5 w-5 text-green-500" />
                                Room Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium">Available</span>
                                </div>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.rooms.available}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium">Occupied</span>
                                </div>
                                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.rooms.occupied}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t">
                                <span className="text-sm font-medium text-muted-foreground">Occupancy Rate</span>
                                <span className="text-xl font-bold">
                                    {stats.rooms.total > 0 ? Math.round((stats.rooms.occupied / stats.rooms.total) * 100) : 0}%
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports Overview */}
                    <Card className="transition-all duration-200 hover:shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Flag className="h-5 w-5 text-red-500" />
                                Report Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <span className="text-sm font-medium">Pending</span>
                                </div>
                                <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.reports.pending}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm font-medium">Investigating</span>
                                </div>
                                <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.reports.investigating}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm font-medium">Resolved</span>
                                </div>
                                <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.reports.resolved}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}