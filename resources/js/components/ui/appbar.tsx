import { Link, router } from '@inertiajs/react';
import { BarChart3, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import ThemeSelector from './theme-selector-button';
import AppLogo from '../app-logo';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './dropdown-menu';

interface AppBarProps {
    auth: SharedData['auth'];
    className?: string;
    sticky?: boolean;
}

export default function AppBar({ auth, className = '', sticky = false }: AppBarProps) {
    const getInitials = useInitials();

    // Check if user has dashboard access (admin or owner)
    const hasDashboardAccess = auth.user && (auth.user.role === 'admin' || auth.user.role === 'owner');

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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="flex items-center space-x-2">
                                            <span>{auth.user.name}</span>
                                            <Avatar className="w-6 h-6">
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                    {getInitials(auth.user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onSelect={() => router.visit(route('profile.edit'))}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </DropdownMenuItem>
                                        
                                        {hasDashboardAccess && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onSelect={() => router.visit(route('dashboard'))}>
                                                    <BarChart3 className="w-4 h-4 mr-2" />
                                                    Dashboard
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onSelect={() => router.post(route('logout'))}>
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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