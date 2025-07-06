import { Head, Link, useForm, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from '@/types';
import { 
    Plus, 
    X, 
    Upload,
    MapPin,
    DollarSign,
    SquareIcon,
    Users,
    Clock,
    Calendar,
    ImageIcon,
    AlertTriangle
} from "lucide-react";
import { useState } from "react";
import RoomImage from "@/components/ui/room-image";

interface Facility {
    id: number;
    name: string;
    description?: string;
    icon?: string;
}

interface RoomImageType {
    id: number;
    url: string;
    is_primary: boolean;
}

interface Room {
    id: number;
    name: string;
    description: string;
    address: string;
    embedded_map_link?: string;
    price: number;
    size: number;
    max_occupancy: number;
    is_available: boolean;
    available_tour_times: string[];
    max_advance_days: number;
    facilities: number[];
    images: RoomImageType[];
}

interface RoomFormProps {
    facilities: Facility[];
    room?: Room | null;
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role?: string;
        };
    };
}

const getRoomBreadcrumbs = (room?: Room | null, userRole?: string): BreadcrumbItem[] => {
    const baseBreadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' }
    ];

    // Determine the rooms list page based on user role
    if (userRole === 'admin') {
        baseBreadcrumbs.push({ title: 'All Rooms', href: '/dashboard/rooms-all' });
    } else {
        baseBreadcrumbs.push({ title: 'My Rooms', href: '/dashboard/rooms-owned' });
    }

    // Add the current page
    baseBreadcrumbs.push({
        title: room ? 'Edit Room' : 'Add Room',
        href: room ? `/dashboard/rooms/${room.id}/edit` : '/dashboard/rooms/create'
    });

    return baseBreadcrumbs;
};

interface FileWithPreview extends File {
    preview?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
const MAX_IMAGES = 10;

export default function RoomForm({ facilities, room, auth }: RoomFormProps) {
    const breadcrumbs = getRoomBreadcrumbs(room, auth.user.role);
    const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
    const [deletedImages, setDeletedImages] = useState<number[]>([]);

    const { data, setData, post, put, processing, errors, clearErrors } = useForm({
        name: room?.name || '',
        description: room?.description || '',
        address: room?.address || '',
        embedded_map_link: room?.embedded_map_link || '',
        price: room?.price || 0,
        size: room?.size || 0,
        max_occupancy: room?.max_occupancy || 1,
        is_available: room?.is_available ?? true,
        available_tour_times: room?.available_tour_times || [],
        max_advance_days: room?.max_advance_days || 7,
        facilities: room?.facilities || [],
        new_images: [] as File[],
        deleted_images: [] as number[],
    });

    const existingImages = room?.images?.filter(img => !deletedImages.includes(img.id)) || [];

    const validateImage = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 2MB';
        }
        
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            return 'Only JPEG, PNG, and GIF files are allowed';
        }
        
        return null;
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles: FileWithPreview[] = [];
        const errorMessages: string[] = [];

        // Check total image limit
        if (existingImages.length + selectedFiles.length + files.length > MAX_IMAGES) {
            errorMessages.push(`Maximum ${MAX_IMAGES} images allowed`);
            return;
        }

        files.forEach(file => {
            const error = validateImage(file);
            if (error) {
                errorMessages.push(`${file.name}: ${error}`);
            } else {
                const fileWithPreview = file as FileWithPreview;
                fileWithPreview.preview = URL.createObjectURL(file);
                validFiles.push(fileWithPreview);
            }
        });

        if (errorMessages.length > 0) {
            alert(errorMessages.join('\n'));
        }

        if (validFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...validFiles]);
        }

        // Reset input
        e.target.value = '';
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        // Append text fields
        Object.entries(data).forEach(([key, value]) => {
            if (key === 'new_images' || key === 'deleted_images') return;
            
            if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    formData.append(`${key}[${index}]`, item.toString());
                });
            } else {
                // Handle boolean values properly
                if (typeof value === 'boolean') {
                    formData.append(key, value ? '1' : '0');
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // Append images based on whether it's create or update
        if (room) {
            // For updates - use 'new_images'
            selectedFiles.forEach((file, index) => {
                formData.append(`new_images[${index}]`, file);
            });
            
            // Append deleted images for updates
            deletedImages.forEach((id, index) => {
                formData.append(`deleted_images[${index}]`, id.toString());
            });
            
            formData.append('_method', 'PUT');
            
            router.post(`/dashboard/rooms/${room.id}`, formData, {
                forceFormData: true,
                onError: (errors) => {
                    console.log('Update errors:', errors);
                }
            });
        } else {
            router.post('/dashboard/rooms', formData, {
                forceFormData: true,
                onError: (errors) => {
                    console.log('Create errors:', errors);
                }
            });
        }
    };

    const handleFacilityToggle = (facilityId: number) => {
        const currentFacilities = data.facilities as number[];
        if (currentFacilities.includes(facilityId)) {
            setData('facilities', currentFacilities.filter(id => id !== facilityId));
        } else {
            setData('facilities', [...currentFacilities, facilityId]);
        }
    };

    const handleTimeSlotAdd = () => {
        const timeSlots = [...data.available_tour_times, ''];
        setData('available_tour_times', timeSlots);
    };

    const handleTimeSlotChange = (index: number, value: string) => {
        const timeSlots = [...data.available_tour_times];
        timeSlots[index] = value;
        setData('available_tour_times', timeSlots);
    };

    const handleTimeSlotRemove = (index: number) => {
        const timeSlots = data.available_tour_times.filter((_, i) => i !== index);
        setData('available_tour_times', timeSlots);
    };

    const handleImageRemove = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleExistingImageRemove = (imageId: number) => {
        setDeletedImages(prev => [...prev, imageId]);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={room ? 'Edit Room' : 'Add Room'} />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold">
                            {room ? 'Edit Room' : 'Add New Room'}
                        </h1>
                        <p className="text-muted-foreground">
                            {room ? 'Update your room listing details' : 'Create a new room listing'}
                        </p>
                    </div>
                </div>

                {/* Error Messages */}
                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            Please fix the following errors:
                            <ul className="mt-2 list-disc list-inside">
                                {Object.values(errors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name" className="text-sm font-medium">Room Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        placeholder="Enter room name"
                                        className={`mt-1 border-gray-600 ${errors.name ? 'border-red-500' : ''}`}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="price" className="text-sm font-medium">Price per Month *</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={e => setData('price', Number(e.target.value))}
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                            className={`pl-10 mt-1 border-gray-600 ${errors.price ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.price && (
                                        <p className="text-sm text-red-500 mt-1">{errors.price}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Describe your room in detail..."
                                    rows={4}
                                    className={`w-full px-3 py-2 mt-1 border border-gray-600 rounded-md resize-none ${errors.description ? 'border-red-500' : ''}`}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="address" className="text-sm font-medium">Address *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                                    <textarea
                                        id="address"
                                        value={data.address}
                                        onChange={e => setData('address', e.target.value)}
                                        placeholder="Enter full address"
                                        rows={2}
                                        className={`w-full pl-10 pr-3 py-2 mt-1 border border-gray-600 rounded-md ${errors.address ? 'border-red-500' : ''}`}
                                    />
                                </div>
                                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                            </div>

                            <div>
                                <Label htmlFor="embedded_map_link" className="text-sm font-medium">Google Maps Embed Link (Optional)</Label>
                                <Input
                                    id="embedded_map_link"
                                    value={data.embedded_map_link}
                                    onChange={e => setData('embedded_map_link', e.target.value)}
                                    placeholder="https://www.google.com/maps/embed?pb=..."
                                    className="mt-1 border-gray-600"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Room Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Room Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="size" className="text-sm font-medium">Size (m²) *</Label>
                                    <div className="relative">
                                        <SquareIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="size"
                                            type="number"
                                            value={data.size}
                                            onChange={e => setData('size', Number(e.target.value))}
                                            placeholder="0"
                                            className={`pl-10 mt-1 border-gray-600 ${errors.size ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.size && <p className="text-sm text-red-500 mt-1">{errors.size}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="max_occupancy" className="text-sm font-medium">Max Occupancy *</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="max_occupancy"
                                            type="number"
                                            value={data.max_occupancy}
                                            onChange={e => setData('max_occupancy', Number(e.target.value))}
                                            placeholder="1"
                                            min="1"
                                            className={`pl-10 mt-1 border-gray-600 ${errors.max_occupancy ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.max_occupancy && <p className="text-sm text-red-500 mt-1">{errors.max_occupancy}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="max_advance_days" className="text-sm font-medium">Max Advance Booking (Days) *</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="max_advance_days"
                                            type="number"
                                            value={data.max_advance_days}
                                            onChange={e => setData('max_advance_days', Number(e.target.value))}
                                            placeholder="7"
                                            min="1"
                                            max="30"
                                            className={`pl-10 mt-1 border-gray-600 ${errors.max_advance_days ? 'border-red-500' : ''}`}
                                        />
                                    </div>
                                    {errors.max_advance_days && <p className="text-sm text-red-500 mt-1">{errors.max_advance_days}</p>}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_available"
                                    checked={data.is_available}
                                    onCheckedChange={(checked) => setData('is_available', checked as boolean)}
                                />
                                <Label htmlFor="is_available" className="text-sm font-medium">Room is available for booking</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Available Tour Times */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                Available Tour Times
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.available_tour_times.map((time, index) => (
                                <div key={index} className="flex gap-4">
                                    <Input
                                        type="time"
                                        value={time}
                                        onChange={e => handleTimeSlotChange(index, e.target.value)}
                                        className="flex-1 border-gray-600"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTimeSlotRemove(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleTimeSlotAdd}
                                className="w-full"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Time Slot
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Facilities */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Facilities</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {facilities.map(facility => {
                                const selected = data.facilities.includes(facility.id);

                                return (
                                <Label                             // 💡 whole label is now clickable & focusable
                                    key={facility.id}
                                    htmlFor={`fac-${facility.id}`}   // links the label → checkbox
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors
                                    ${selected ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50"}`}
                                >
                                    <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`fac-${facility.id}`}
                                        checked={selected}
                                        // prevent double‑fire if the box itself is clicked
                                        onClick={e => e.stopPropagation()}
                                        onCheckedChange={() => handleFacilityToggle(facility.id)}
                                    />
                                    <span className="text-sm font-medium flex-1">
                                        {facility.name}
                                    </span>
                                    </div>
                                </Label>
                                );
                            })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ImageIcon className="w-5 h-5" />
                                Images
                                <Badge variant="outline" className="ml-2">
                                    {existingImages.length + selectedFiles.length}/{MAX_IMAGES}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Existing Images */}
                            {existingImages.length > 0 && (
                                <div>
                                    <Label className="text-sm font-medium">Current Images</Label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                        {existingImages.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <RoomImage
                                                    src={image.url}
                                                    alt="Room"
                                                    className="w-full h-60 rounded-lg"
                                                />
                                                {image.is_primary && (
                                                    <Badge className="absolute top-1 left-1 text-xs">Primary</Badge>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleExistingImageRemove(image.id)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Images */}
                            <div>
                                <Label htmlFor="images" className="text-sm font-medium">
                                    {room ? 'Add New Images' : 'Upload Images'}
                                </Label>
                                <div className="mt-2">
                                    <Input
                                        id="images"
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                    <Label
                                        htmlFor="images"
                                        className="flex items-center justify-center p-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                                    >
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                Click to upload images or drag and drop
                                            </p>
                                        </div>
                                    </Label>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-3">
                                        {selectedFiles.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <RoomImage
                                                    src={URL.createObjectURL(file)}
                                                    alt="Preview"
                                                    className="w-full h-20 rounded-lg"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute top-1 right-1 w-6 h-6 p-0 opacity-0 group-hover:opacity-100"
                                                    onClick={() => handleImageRemove(index)}
                                                >
                                                    <X className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => window.history.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : room ? 'Update Room' : 'Create Room'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}