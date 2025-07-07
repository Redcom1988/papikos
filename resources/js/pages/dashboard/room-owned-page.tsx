import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RoomImage from "@/components/ui/room-image";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from "@inertiajs/react";
import {
    DollarSign,
    Edit,
    ImageIcon,
    MapPin,
    Plus,
    SquareIcon,
    Trash2,
    Users,
    Home, 
    CheckCircle2, 
    XCircle 
} from "lucide-react";
import { useState } from "react";

interface Room {
    id: number;
    name: string;
    address: string;
    price: number;
    formatted_price: string;
    size: number;
    max_occupancy: number;
    is_available: boolean;
    facilities: Array<{
        id: number;
        name: string;
        icon?: string;
    }>;
    facilities_count: number;
    images_count: number;
    images: Array<{
        id: number;
        url: string;
        is_primary: boolean;
    }>;
    primary_image?: string;
    created_at: string;
}

interface RoomOwnedPageProps {
    rooms: Room[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Rooms', href: '/dashboard/rooms' },
];

export default function RoomOwnedPage({ rooms }: RoomOwnedPageProps) {
    const [deletingRoom, setDeletingRoom] = useState<number | null>(null);

    const handleDelete = (roomId: number) => {
        if (confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
            setDeletingRoom(roomId);
            router.delete(`/dashboard/rooms/${roomId}`, {
                onFinish: () => setDeletingRoom(null),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Rooms" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Rooms</h1>
                        <p className="text-muted-foreground">
                            Manage your room listings and bookings
                        </p>
                    </div>
                    <Link href="/dashboard/rooms/create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Room
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <Home className="w-8 h-8 text-gray-500" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{rooms.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Available</p>
                                    <p className="text-2xl font-bold">{rooms.filter(room => room.is_available).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="py-0">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <XCircle className="w-8 h-8 text-destructive" />
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Occupied</p>
                                    <p className="text-2xl font-bold">{rooms.filter(room => !room.is_available).length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rooms Grid */}
                {rooms.length > 0 ? (
                    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                        {rooms.map((room) => (
                            <Card
                                key={room.id}
                                className="overflow-hidden flex flex-col py-0 cursor-pointer"
                                onClick={() => router.visit(`/rooms/${room.id}`)}
                                tabIndex={0}
                                role="button"
                                onKeyDown={e => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        router.visit(`/dashboard/rooms/${room.id}`);
                                    }
                                }}
                            >
                                {/* Room Image */}
                                {room.images && room.images.length > 0 && (
                                    <div className="relative aspect-[4/3] overflow-hidden">
                                        <RoomImage
                                            src={room.images[0].url}
                                            alt={room.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        />
                                        {room.images.length > 1 && (
                                            <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-sm">
                                                {room.images.length} photos
                                            </div>
                                        )}
                                        <Badge 
                                            variant={room.is_available ? "default" : "secondary"}
                                            className="absolute top-3 left-3 min-h-[2rem]"
                                        >
                                            {room.is_available ? "Available" : "Occupied"}
                                        </Badge>
                                    </div>
                                )}

                                <CardContent className="p-6 flex-1 flex flex-col">
                                    {/* Title and Location */}
                                    <div className="space-y-3 mb-4">
                                        <div className="space-y-1">
                                            <h3 className="font-semibold text-xl leading-tight">{room.name}</h3>
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <MapPin className="w-4 h-4" />
                                                <span>{room.address}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-primary font-bold text-lg">
                                            <DollarSign className="w-5 h-5" />
                                            <span>{room.formatted_price}</span>
                                        </div>
                                    </div>

                                    {/* Room Details */}
                                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <SquareIcon className="w-4 h-4" />
                                            <span>{room.size} m²</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="w-4 h-4" />
                                            <span>Max {room.max_occupancy}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <ImageIcon className="w-4 h-4" />
                                            <span>{room.images_count}</span>
                                        </div>
                                    </div>

                                    {/* Facilities */}
                                    {room.facilities && room.facilities.length > 0 && (
                                        <div className="space-y-2 mb-6 flex-1">
                                            <h4 className="font-medium text-sm">Facilities</h4>
                                            <div className="flex gap-2 flex-wrap">
                                                {room.facilities.slice(0, 4).map((facility) => (
                                                    <Badge key={facility.id} variant="outline" className="text-xs">
                                                        {facility.name}
                                                    </Badge>
                                                ))}
                                                {room.facilities.length > 4 && (
                                                    <Badge variant="outline" className="text-xs">
                                                        +{room.facilities.length - 4} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div
                                        className="flex gap-3 pt-4 border-t mt-auto"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <Link href={`/dashboard/rooms/${room.id}/edit`} className="flex-1">
                                            <Button variant="outline" className="w-full">
                                                <Edit className="w-4 h-4 mr-2" />
                                                Edit Room
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDelete(room.id)}
                                            disabled={deletingRoom === room.id}
                                            className="flex-1"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            {deletingRoom === room.id ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="p-12">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <Plus className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
                            <p className="text-muted-foreground mb-4">
                                Get started by adding your first room listing
                            </p>
                            <Link href="/dashboard/rooms/create">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Your First Room
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}