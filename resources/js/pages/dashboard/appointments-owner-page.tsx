import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type SharedData } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Calendar, CheckCircle, Clock, MapPin, MessageSquare, Trash2, XCircle, User, Phone } from 'lucide-react';
import { useState } from 'react';

interface AppointmentUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
}

interface AppointmentRoom {
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
}

interface OwnerAppointment {
    id: number;
    scheduled_at: string;
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
    created_at: string;
    user: AppointmentUser;
    room: AppointmentRoom;
}

interface OwnerAppointmentsPageProps {
    appointments: OwnerAppointment[];
}

export default function OwnerAppointmentsPage({ appointments }: OwnerAppointmentsPageProps) {
    const { auth } = usePage<{ auth: SharedData['auth']; appointments: OwnerAppointment[] }>().props;
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [completingId, setCompletingId] = useState<number | null>(null);

    const handleCancelAppointment = (appointmentId: number) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            setCancellingId(appointmentId);
            router.patch(`/dashboard/appointments/${appointmentId}/cancel`, {}, {
                onFinish: () => setCancellingId(null),
            });
        }
    };

    const handleCompleteAppointment = (appointmentId: number) => {
        if (confirm('Mark this appointment as completed?')) {
            setCompletingId(appointmentId);
            router.patch(`/dashboard/appointments/${appointmentId}/complete`, {}, {
                onFinish: () => setCompletingId(null),
            });
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'scheduled':
                return <Clock className="w-4 h-4" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const getStatusVariant = (status: string): "default" | "warning" | "destructive" | "outline" => {
        switch (status) {
            case 'scheduled':
                return "warning";
            case 'completed':
                return "default";
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

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Appointments', href: '/dashboard/appointments' }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Room Appointments" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Room Appointments</h1>
                        <p className="text-muted-foreground">
                            Manage survey appointments for your rooms
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Calendar className="w-8 h-8 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{appointments.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Clock className="w-8 h-8 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
                                    <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <CheckCircle className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                                    <p className="text-2xl font-bold">
                                        {appointments.filter(apt => apt.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <XCircle className="w-8 h-8 text-red-500" />
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
                                                            <p className="text-lg font-medium text-primary mb-2">
                                                                {appointment.room.formatted_price}/month
                                                            </p>
                                                            
                                                            {/* Customer Info */}
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                                                <div className="flex items-center gap-1">
                                                                    <User className="w-4 h-4" />
                                                                    <span>{appointment.user.name}</span>
                                                                </div>
                                                                {appointment.user.phone && (
                                                                    <div className="flex items-center gap-1">
                                                                        <Phone className="w-4 h-4" />
                                                                        <span>{appointment.user.phone}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <Badge 
                                                            variant={getStatusVariant(appointment.status)}
                                                            className="flex items-center gap-1 flex-shrink-0 min-h-[2rem]"
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
                                                            {appointment.status === 'scheduled' && (
                                                                <>
                                                                    <Button
                                                                        variant="default"
                                                                        size="sm"
                                                                        disabled={completingId === appointment.id}
                                                                        onClick={() => handleCompleteAppointment(appointment.id)}
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-1" />
                                                                        {completingId === appointment.id ? 'Completing...' : 'Complete'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        disabled={cancellingId === appointment.id}
                                                                        onClick={() => handleCancelAppointment(appointment.id)}
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                                        {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                                                                    </Button>
                                                                </>
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
                                                                <User className="w-4 h-4 flex-shrink-0" />
                                                                <span className="text-sm truncate">{appointment.user.name}</span>
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
                    <Card className="py-0">
                        <CardContent className="p-12 text-center">
                            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
                            <p className="text-muted-foreground">
                                When customers schedule surveys for your rooms, they'll appear here.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}