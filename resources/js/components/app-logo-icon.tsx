import { ImgHTMLAttributes } from 'react';

interface AppLogoIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
    className?: string;
}

export default function AppLogoIcon({ className, alt = "KostSys Logo", ...props }: AppLogoIconProps) {
    return (
        <img 
            src="/logo.svg" 
            alt={alt}
            className={className}
            {...props}
        />
    );
}
