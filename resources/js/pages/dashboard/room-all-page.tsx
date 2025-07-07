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
    House,
    Calendar,
    Users
} from "lucide-react";
import { useState } from "react";
import RoomImage from '@/components/ui/room-image';

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
    rooms: {
        data: Room[];
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
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'All Rooms', href: '/dashboard/rooms/all' },
];

export default function RoomAllPage({ rooms }: RoomAllPageProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingRoom, setDeletingRoom] = useState<number | null>(null);

    const filteredRooms = rooms.data.filter(room =>
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
                        <h1 className="text-3xl font-bold">Room Management</h1>
                        <p className="text-muted-foreground">
                            View and manage all room listings
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <House className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm font-medium">{rooms.total} Total Rooms</span>
                    </div>
                </div>

                {/* Rooms Table */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>All Rooms</CardTitle>
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
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredRooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <RoomImage
                                                    src={room.primary_image}
                                                    alt={room.name}
                                                    className="w-12 h-12 rounded-lg"
                                                    objectFit="cover"
                                                    loadingSize="sm"
                                                />
                                                <div>
                                                    <div className="font-medium">{room.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {room.images_count} images, {room.facilities_count} facilities
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <div>
                                                    <div className="font-medium">{room.owner_name}</div>
                                                    <div className="text-sm text-muted-foreground">{room.owner_email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 max-w-48">
                                                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                                <span className="text-sm truncate">{room.address}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{room.formatted_price}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <SquareIcon className="w-3 h-3" />
                                                    {room.size}m²
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <House className="w-3 h-3" />
                                                    {room.max_occupancy} people
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={room.is_available ? "default" : "destructive"}>
                                                {room.is_available ? "Available" : "Unavailable"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                <Calendar className="w-4 h-4" />
                                                {room.created_at}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(`/rooms/${room.id}`, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.visit(`/dashboard/rooms/${room.id}/edit`)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(room.id)}
                                                    disabled={deletingRoom === room.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {rooms.last_page > 1 && (
                            <div className="flex items-center justify-between px-2 py-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((rooms.current_page - 1) * rooms.per_page) + 1} to {Math.min(rooms.current_page * rooms.per_page, rooms.total)} of {rooms.total} rooms
                                </div>
                                <div className="flex items-center gap-2">
                                    {rooms.links.map((link, index) => (
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

                        {filteredRooms.length === 0 && (
                            <div className="text-center py-8">
                                <House className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-semibold mb-2">No Rooms Found</h3>
                                <p className="text-muted-foreground">
                                    {searchTerm ? 'No rooms found matching your search.' : 'No rooms available.'}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}