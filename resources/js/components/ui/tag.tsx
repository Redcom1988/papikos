import { ReactNode } from 'react';

interface TagProps {
    children: ReactNode;
    variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'selected';
    size?: 'sm' | 'md' | 'lg';
    icon?: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

export default function Tag({ 
    children, 
    variant = 'default',
    size = 'md',
    icon,
    onClick,
    disabled = false,
    className = ''
}: TagProps) {
    const baseClasses = "inline-flex items-center rounded-full font-medium transition-all duration-200 border";
    
    const sizeClasses = {
        sm: "px-2 py-1 text-xs",
        md: "px-3 py-1.5 text-sm",
        lg: "px-4 py-2 text-base"
    };

    const variantClasses = {
        default: "bg-muted text-muted-foreground border-border hover:bg-muted/80",
        primary: "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20",
        secondary: "bg-secondary/10 text-secondary-foreground border-secondary/20 hover:bg-secondary/20",
        outline: "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground hover:bg-muted/50",
        selected: "bg-primary text-primary-foreground border-primary shadow-sm"
    };

    const interactiveClasses = onClick && !disabled 
        ? "cursor-pointer hover:scale-105 active:scale-95" 
        : "";

    const disabledClasses = disabled 
        ? "opacity-50 cursor-not-allowed" 
        : "";

    const classes = [
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        interactiveClasses,
        disabledClasses,
        className
    ].filter(Boolean).join(' ');

    const TagElement = onClick ? 'button' : 'span';

    return (
        <TagElement
            className={classes}
            onClick={onClick && !disabled ? onClick : undefined}
            disabled={disabled}
            type={onClick ? 'button' : undefined}
        >
            {icon && (
                <span className={`${size === 'sm' ? 'mr-1' : 'mr-1.5'} flex-shrink-0`}>
                    {icon}
                </span>
            )}
            {children}
        </TagElement>
    );
}