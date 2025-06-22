import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
}

export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    maxWidth = 'md',
    className = "" 
}: ModalProps) {
    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl'
    };

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
        };

        if (isOpen) {
            // Store original overflow value
            const originalOverflow = document.body.style.overflow;
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            return () => {
                document.removeEventListener('keydown', handleEscape);
                // Restore original overflow or default to auto
                document.body.style.overflow = originalOverflow || 'auto';
            };
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className={`bg-card border border-border rounded-lg shadow-lg ${maxWidthClasses[maxWidth]} w-full p-6 ${className}`}>
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="text-card-foreground">
                    {children}
                </div>
            </div>
        </div>
    );
}