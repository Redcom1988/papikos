import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageModalImage {
    id: number;
    url: string;
    caption: string;
    is_primary?: boolean;
}

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: ImageModalImage[];
    currentIndex: number;
    onPrevious: () => void;
    onNext: () => void;
}

export default function ImageModal({ 
    isOpen, 
    onClose, 
    images, 
    currentIndex, 
    onPrevious, 
    onNext 
}: ImageModalProps) {
    const currentImage = images[currentIndex];

    // Handle clicks on the backdrop
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Handle escape key and body scroll
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
            if (e.key === 'ArrowLeft') {
                onPrevious();
            }
            if (e.key === 'ArrowRight') {
                onNext();
            }
        };

        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = originalOverflow || 'auto';
            };
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, onPrevious, onNext]);

    if (!isOpen || !currentImage) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                aria-label="Close modal"
            >
                <X className="w-6 h-6" />
            </button>
            
            {/* Image counter */}
            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-lg text-sm z-10">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
            
            {/* Navigation arrows */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={onPrevious}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={onNext}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-3 rounded-full hover:bg-opacity-70 transition-all z-10"
                        aria-label="Next image"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}
            
            {/* Modal image container - this is the key change */}
            <div 
                className="flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage.url}
                    alt={currentImage.caption}
                    className="max-w-[90vw] max-h-[90vh] object-contain select-none"
                    draggable={false}
                />
            </div>
            
            {/* Image caption */}
            {currentImage.caption && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg max-w-md text-center text-sm z-10">
                    {currentImage.caption}
                </div>
            )}
        </div>
    );
}