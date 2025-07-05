import { Link, router } from '@inertiajs/react';
import { BarChart3 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import ThemeSelector from './theme-selector-button';
import AppLogo from '../app-logo';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';

interface AppBarProps {
    auth: SharedData['auth'];
    className?: string;
    sticky?: boolean;
}

export default function AppBar({ auth, className = '', sticky = false }: AppBarProps) {
    const getInitials = useInitials();

    return (
        <header className={`bg-background border-b border-border ${sticky ? 'sticky top-0 z-40 backdrop-blur-sm' : ''} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link href={route('landing.page')} className="flex items-center">
                            <AppLogo />
                        </Link>
                    </div>

                    <nav className="flex items-center space-x-4">
                        <ThemeSelector />
                        
                        {auth.user ? (
                            <div className="flex items-center space-x-2">
                                <Button 
                                    variant="outline"
                                    onClick={() => router.visit(route('profile.edit'))}
                                >
                                    <span>{auth.user.name}</span>
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={auth.user.avatar} />
                                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    onClick={() => router.visit(route('dashboard'))}
                                >
                                    <span>Dashboard</span>
                                    <BarChart3 className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => router.visit(route('login'))}
                                >
                                    Log in
                                </Button>
                                
                                <Button
                                    onClick={() => router.visit(route('register'))}
                                >
                                    Sign up
                                </Button>
                            </div>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}