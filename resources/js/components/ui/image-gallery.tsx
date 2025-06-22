import { useState } from 'react';
import RoomImage from './room-image';

interface ImageGalleryImage {
    id: number;
    url: string;
    caption: string;
    is_primary?: boolean;
}

interface ImageGalleryProps {
    images: ImageGalleryImage[];
    className?: string;
}

export default function ImageGallery({ images, className = "" }: ImageGalleryProps) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-full ${className}`}>
                <span className="text-gray-500">No images available</span>
            </div>
        );
    }

    return (
        <div className={`flex gap-2 h-full ${className}`}>
            {/* Main Large Image */}
            <div className="flex-1 overflow-hidden rounded-lg">
                <RoomImage 
                    src={images[selectedImageIndex]?.url || images[0]?.url}
                    alt={images[selectedImageIndex]?.caption || 'Room image'}
                    className="h-full"
                    objectFit="cover"
                />
            </div>
            
            {/* Scrollable Thumbnail Column */}
            <div className="w-20 flex flex-col gap-1">
                <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
                    {images.map((image, index) => (
                        <div 
                            key={image.id} 
                            className={`aspect-square rounded-md overflow-hidden transition-all duration-200 bg-muted ${
                                selectedImageIndex === index 
                                    ? 'ring-2 ring-blue-500 opacity-100' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            <RoomImage 
                                src={image.url}
                                alt={image.caption}
                                className="h-full"
                                objectFit="contain"
                                onClick={() => setSelectedImageIndex(index)}
                                loadingSize="sm"
                            />
                        </div>
                    ))}
                </div>
                
                {/* Show more indicator */}
                {images.length > 6 && (
                    <div className="text-xs text-gray-400 text-center py-1 bg-gray-50 rounded-md">
                        +{images.length - 6}
                    </div>
                )}
            </div>
        </div>
    );
}