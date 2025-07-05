import React from 'react';
import { cn } from '@/lib/utils';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export default function IconButton({
    variant = 'default',
    size = 'md',
    className,
    children,
    ...props
}: IconButtonProps) {
    const sizeClasses = {
        sm: 'w-7 h-7',
        md: 'w-8 h-8',
        lg: 'w-10 h-10'
    };

    const variantClasses = {
        default: 'bg-background/80 border border-border text-foreground hover:bg-muted hover:text-muted-foreground dark:bg-background/80 dark:border-border dark:text-foreground dark:hover:bg-muted dark:hover:text-muted-foreground',
        danger: 'bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive/20 dark:bg-destructive/10 dark:border-destructive/20 dark:text-destructive dark:hover:bg-destructive/20'
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-full shadow-sm backdrop-blur-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
                sizeClasses[size],
                variantClasses[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}