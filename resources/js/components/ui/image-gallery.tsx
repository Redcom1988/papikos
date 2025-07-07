import { useState } from 'react';
import RoomImage from './room-image';
import ImageModal from './image-modal';
import { ScrollArea } from "@/components/ui/scroll-area";

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
    const sortedImages = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
    // This puts the image with is_primary === true at the front

    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [showModal, setShowModal] = useState(false);

    if (!sortedImages || sortedImages.length === 0) {
        return (
            <div className={`bg-gray-200 rounded-lg flex items-center justify-center h-full ${className}`}>
                <span className="text-gray-500">No images available</span>
            </div>
        );
    }

    const currentImage = sortedImages[selectedImageIndex] || sortedImages[0];

    const nextImage = () => {
        setSelectedImageIndex(prev => prev < sortedImages.length - 1 ? prev + 1 : 0);
    };

    const prevImage = () => {
        setSelectedImageIndex(prev => prev > 0 ? prev - 1 : sortedImages.length - 1);
    };

    return (
        <>
            <div className={`flex gap-2 h-full ${className}`}>
                {/* Main Large Image */}
                <div 
                    className="flex-1 overflow-hidden rounded-lg cursor-zoom-in hover:opacity-90 transition-opacity duration-200"
                    onClick={() => setShowModal(true)}
                >
                    <RoomImage
                        src={currentImage.url}
                        alt={currentImage.caption}
                        className="h-full"
                        objectFit="cover"
                        loadingSize="lg"
                    />
                </div>
                
                {/* Scrollable Thumbnail Column */}
                <div className="w-20 flex flex-col">
                    <ScrollArea
                        className="flex-1 overflow-y-auto min-h-0"
                        style={{
                            scrollbarWidth: "none", // Firefox
                            msOverflowStyle: "none", // IE 10+
                        }}
                    >
                        <div className="flex flex-col gap-2">
                            {sortedImages.map((image, index) => (
                                <div 
                                    key={image.id} 
                                    className={`aspect-square rounded-md overflow-hidden transition-all duration-200 cursor-pointer ${
                                        selectedImageIndex === index 
                                            ? 'ring-2 ring-primary opacity-100' 
                                            : 'opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    <RoomImage
                                        src={image.url}
                                        alt={image.caption}
                                        className="h-full"
                                        objectFit="cover"
                                        onClick={() => setSelectedImageIndex(index)}
                                        loadingSize="sm"
                                    />
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Image Modal */}
            <ImageModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                images={sortedImages}
                currentIndex={selectedImageIndex}
                onPrevious={prevImage}
                onNext={nextImage}
            />
        </>
    );
}