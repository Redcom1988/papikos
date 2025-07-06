import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchBar from "@/components/ui/search-bar";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from "@inertiajs/react";
import {
    Edit,
    Eye,
    MapPin,
    SquareIcon,
    Trash2,
    Users
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
    owner_name: string;
    owner_email: string;
    facilities_count: number;
    images_count: number;
    primary_image?: string;
    created_at: string;
}

interface RoomAllPageProps {
    rooms: Room[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'All Rooms', href: '/dashboard/rooms/all' },
];

export default function RoomAllPage({ rooms }: RoomAllPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingRoom, setDeletingRoom] = useState<number | null>(null);

    const filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.owner_email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
            <Head title="All Rooms" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">All Rooms</h1>
                        <p className="text-muted-foreground">
                            Manage all room listings across the platform
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{rooms.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {rooms.filter(room => room.is_available).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unavailable</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                {rooms.filter(room => !room.is_available).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Unique Owners</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {new Set(rooms.map(room => room.owner_email)).size}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Rooms Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Rooms ({filteredRooms.length})</CardTitle>
                            <div className="w-96">
                                <SearchBar
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder="Search rooms, addresses, or owners..."
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Room</TableHead>
                                        <TableHead>Owner</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Details</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredRooms.map((room) => (
                                        <TableRow key={room.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                                                        {room.primary_image ? (
                                                            <img
                                                                src={room.primary_image}
                                                                alt={room.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-muted" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium">{room.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {room.images_count} images, {room.facilities_count} facilities
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{room.owner_name}</div>
                                                    <div className="text-sm text-muted-foreground">{room.owner_email}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 max-w-48">
                                                    <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                    <span className="text-sm truncate">{room.address}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{room.formatted_price}</div>
                                                <div className="text-sm text-muted-foreground">/month</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <SquareIcon className="w-3 h-3" />
                                                        {room.size}m²
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3" />
                                                        {room.max_occupancy} people
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={room.is_available ? "default" : "secondary"}>
                                                    {room.is_available ? "Available" : "Unavailable"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{room.created_at}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(`/rooms/${room.id}`, '_blank')}
                                                    >
                                                        <Eye className="w-3 h-3" />
                                                    </Button>
                                                    <Link href={`/dashboard/rooms/${room.id}/edit`}>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(room.id)}
                                                        disabled={deletingRoom === room.id}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        
                        {filteredRooms.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground">
                                    {searchTerm ? 'No rooms found matching your search.' : 'No rooms available.'}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}