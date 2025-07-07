import { useState } from 'react';
import ImageModal from './image-modal';

interface RoomImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    fallbackClassName?: string;
    objectFit?: "cover" | "contain";
    onClick?: () => void;
    loadingSize?: "sm" | "md" | "lg";
    enableModal?: boolean; // <-- Add this prop
}

export default function RoomImage({ 
    src, 
    alt, 
    className = "", 
    fallbackClassName = "",
    objectFit = "cover",
    onClick,
    loadingSize = "md",
    enableModal = false // <-- Default is disabled
}: RoomImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    const loadingSizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6", 
        lg: "w-8 h-8"
    };

    // Get the proper object-fit style
    const getObjectFitStyle = () => {
        return {
            objectFit: objectFit,
            objectPosition: 'center center'
        };
    };

    // Only open modal if enabled and image is loaded and not errored
    const handleImageClick = () => {
        if (enableModal && src && !isLoading && !hasError) {
            setShowModal(true);
        }
        if (onClick) onClick();
    };

    return (
        <>
            <div 
                className={`relative overflow-hidden bg-muted ${onClick || enableModal ? 'cursor-pointer' : ''} ${className}`}
                onClick={handleImageClick}
            >
                {/* Loading skeleton */}
                {isLoading && (
                    <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center z-10">
                        <div className={`${loadingSizes[loadingSize]} border-2 border-primary border-t-transparent rounded-full animate-spin`}></div>
                    </div>
                )}
                
                {/* Error fallback or gradient */}
                {(hasError || !src) && !isLoading && (
                    <div className={`absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-20 ${fallbackClassName}`}>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-muted-foreground text-sm">No image</span>
                        </div>
                    </div>
                )}
                
                {/* Actual image */}
                {src && (
                    <img
                        src={src}
                        alt={alt}
                        onLoad={handleLoad}
                        onError={handleError}
                        style={getObjectFitStyle()}
                        className={`w-full h-full transition-all duration-300 ${
                            isLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                    />
                )}
            </div>
            {/* Image Modal */}
            {enableModal && src && showModal && (
                <ImageModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    images={[{ id: 1, url: src, caption: alt }]}
                    currentIndex={0}
                    onPrevious={() => {}}
                    onNext={() => {}}
                />
            )}
        </>
    );
}