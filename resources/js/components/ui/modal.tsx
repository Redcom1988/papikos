import { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
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
    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-lg ${maxWidthClasses[maxWidth]} w-full p-6 ${className}`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}