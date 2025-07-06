import { Head, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Calendar, Clock, MapPin, MessageSquare, Trash2, CheckCircle, XCircle } from 'lucide-react';
import AppBar from '@/components/ui/appbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { type SharedData } from '@/types';

interface Appointment {
    id: number;
    scheduled_at: string;
    status: 'scheduled' | 'completed' | 'cancelled'; // Updated status types
    notes?: string;
    created_at: string;
    room: {
        id: number;
        name: string;
        address: string;
        price: number;
        formatted_price: string;
        images: Array<{
            id: number;
            url: string;
            is_primary: boolean;
        }>;
    };
}

interface AppointmentsPageProps {
    appointments: Appointment[];
}

export default function AppointmentsPage({ appointments }: AppointmentsPageProps) {
    const { auth } = usePage<{ auth: SharedData['auth']; appointments: Appointment[] }>().props;
    const [cancellingId, setCancellingId] = useState<number | null>(null);

    const handleCancelAppointment = (appointmentId: number) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            setCancellingId(appointmentId);
            router.delete(`/appointments/${appointmentId}`, {
                onFinish: () => setCancellingId(null),
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled': // Changed from 'pending'
                return <Clock className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case 'scheduled': // Changed from 'pending'
                return "default";
            case 'completed':
                return "secondary";
            case 'cancelled':
                return "destructive";
            default:
                return "outline";
        }
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
            date: date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
    };

    const isUpcoming = (dateString: string) => {
        return new Date(dateString) > new Date();
    };

    const upcomingAppointments = appointments.filter(apt => 
        isUpcoming(apt.scheduled_at) && apt.status !== 'cancelled'
    );
    const pastAppointments = appointments.filter(apt => 
        !isUpcoming(apt.scheduled_at) || apt.status === 'cancelled'
    );

    return (
        <>
            <Head title="My Appointments" />
            
            <div className="min-h-screen bg-background text-foreground overflow-auto">
                <AppBar auth={auth} />
                
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold">My Appointments</h1>
                                <p className="text-muted-foreground">
                                    Manage your scheduled room surveys
                                </p>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Total</p>
                                            <p className="text-2xl font-bold">{appointments.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                                            <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                            <p className="text-2xl font-bold">
                                                {appointments.filter(apt => apt.status === 'completed').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-5 h-5 text-red-500" />
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                                            <p className="text-2xl font-bold">
                                                {appointments.filter(apt => apt.status === 'cancelled').length}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upcoming Appointments */}
                        {upcomingAppointments.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
                                <div className="space-y-4">
                                    {upcomingAppointments.map((appointment) => {
                                        const { date, time } = formatDateTime(appointment.scheduled_at);
                                        return (
                                            <Card key={appointment.id} className="transition-all duration-200 hover:shadow-md py-0">
                                                <CardContent className="p-6">
                                                    <div className="flex gap-4">
                                                        {/* Room Image */}
                                                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                            {appointment.room.images.length > 0 ? (
                                                                <img
                                                                    src={appointment.room.images[0].url}
                                                                    alt={appointment.room.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                    <MapPin className="w-8 h-8 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Appointment Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between mb-2 gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-semibold text-lg truncate">{appointment.room.name}</h3>
                                                                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                                                        <span className="text-sm truncate">{appointment.room.address}</span>
                                                                    </div>
                                                                    <p className="text-lg font-medium text-primary mb-0">
                                                                        {appointment.room.formatted_price}/month
                                                                    </p>
                                                                </div>
                                                                <Badge 
                                                                    variant={getStatusVariant(appointment.status)}
                                                                    className="flex items-center gap-1 flex-shrink-0"
                                                                >
                                                                    {getStatusIcon(appointment.status)}
                                                                    <span className="capitalize">{appointment.status}</span>
                                                                </Badge>
                                                            </div>

                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    <span>{date}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    <span>{time}</span>
                                                                </div>
                                                            </div>

                                                            {/* Notes and Buttons Row */}
                                                            <div className="flex items-start justify-between gap-4">
                                                                {/* Notes Section */}
                                                                <div className="flex-1 min-w-0">
                                                                    {appointment.notes && (
                                                                        <div className="flex items-start gap-1">
                                                                            <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                                            <p className="text-sm text-muted-foreground break-words">{appointment.notes}</p>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Buttons Section */}
                                                                <div className="flex gap-2 flex-shrink-0">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => router.visit(`/rooms/${appointment.room.id}`)}
                                                                    >
                                                                        View Room
                                                                    </Button>
                                                                    {appointment.status === 'scheduled' && (
                                                                        <Button
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            disabled={cancellingId === appointment.id}
                                                                            onClick={() => handleCancelAppointment(appointment.id)}
                                                                        >
                                                                            <Trash2 className="w-4 h-4" />
                                                                            {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Past Appointments */}
                        {pastAppointments.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>
                                <div className="space-y-4">
                                    {pastAppointments.map((appointment) => {
                                        const { date, time } = formatDateTime(appointment.scheduled_at);
                                        return (
                                            <Card key={appointment.id} className="opacity-75 py-0">
                                                <CardContent className="p-6">
                                                    <div className="flex gap-4">
                                                        {/* Room Image */}
                                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                                            {appointment.room.images.length > 0 ? (
                                                                <img
                                                                    src={appointment.room.images[0].url}
                                                                    alt={appointment.room.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                                                    <MapPin className="w-6 h-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Appointment Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between mb-2 gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="font-medium truncate">{appointment.room.name}</h3>
                                                                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                                                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                                                        <span className="text-sm truncate">{appointment.room.address}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-1">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="w-4 h-4" />
                                                                            <span>{date}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock className="w-4 h-4" />
                                                                            <span>{time}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                        <span> Created at {appointment.created_at} </span>
                                                                    </div>
                                                                </div>
                                                                <Badge 
                                                                    variant={getStatusVariant(appointment.status)}
                                                                    className="flex items-center gap-1 flex-shrink-0"
                                                                >
                                                                    {getStatusIcon(appointment.status)}
                                                                    <span className="capitalize">{appointment.status}</span>
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {appointments.length === 0 && (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    You haven't scheduled any room surveys yet.
                                </p>
                                <Button onClick={() => router.visit('/rooms')}>
                                    Browse Rooms
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}