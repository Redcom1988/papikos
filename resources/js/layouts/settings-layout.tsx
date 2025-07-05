// filepath: \kost-sys-website\resources\js\layouts\settings-layout.tsx
import { Link, usePage } from '@inertiajs/react';
import { User, Lock, Palette } from 'lucide-react';
import { type SharedData } from '@/types';
import AppBar from '@/components/ui/appbar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Heading from '@/components/heading';

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const currentPath = usePage().url;

    const navItems = [
        {
            title: 'Profile',
            href: route('profile.edit'),
            icon: User,
            isActive: currentPath === '/settings/profile'
        },
        {
            title: 'Password',
            href: route('password.edit'),
            icon: Lock,
            isActive: currentPath === '/settings/password'
        },
        {
            title: 'Appearance',
            href: route('appearance'),
            icon: Palette,
            isActive: currentPath === '/settings/appearance'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            <AppBar auth={auth} sticky />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="px-4 py-6">
                    <Heading title="Settings" description="Manage your profile and account settings" />

                    <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                        <aside className="w-full max-w-xl lg:w-48">
                            <nav className="flex flex-col space-y-1 space-x-0">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Button
                                            key={item.href}
                                            variant={item.isActive ? "secondary" : "ghost"}
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <Link href={item.href}>
                                                <Icon className="w-4 h-4 mr-2" />
                                                {item.title}
                                            </Link>
                                        </Button>
                                    );
                                })}
                            </nav>
                        </aside>

                        <Separator className="my-6 md:hidden" />

                        <div className="flex-1 md:max-w-2xl">
                            <section className="max-w-xl space-y-12">
                                {children}
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}