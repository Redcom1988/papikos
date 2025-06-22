import { useState } from 'react';

interface RoomImageProps {
    src?: string | null;
    alt: string;
    className?: string;
    fallbackClassName?: string;
    objectFit?: "cover" | "contain";
    onClick?: () => void;
    loadingSize?: "sm" | "md" | "lg";
}

export default function RoomImage({ 
    src, 
    alt, 
    className = "", 
    fallbackClassName = "",
    objectFit = "cover",
    onClick,
    loadingSize = "md"
}: RoomImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

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

    return (
        <div 
            className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
        >
            {/* Loading skeleton */}
            {isLoading && (
                <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
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
                    className={`w-full h-full object-${objectFit} transition-all duration-300 ${
                        isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                />
            )}
        </div>
    );
}