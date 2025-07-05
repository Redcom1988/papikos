import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Lock, Palette, User } from 'lucide-react';
import { type PropsWithChildren } from 'react';

interface SettingsLayoutProps {
    children: React.ReactNode;
}

export default function DashboardSettingsLayout({ children }: SettingsLayoutProps) {
    const { auth } = usePage<SharedData>().props;
    const currentPath = usePage().url;

    const navItems = [
        {
            title: 'Profile',
            href: route('dashboard.profile.edit'),
            icon: User,
            isActive: currentPath === '/dashboard/settings/profile'
        },
        {
            title: 'Password',
            href: route('dashboard.password.edit'),
            icon: Lock,
            isActive: currentPath === '/dashboard/settings/password'
        },
        {
            title: 'Appearance',
            href: route('dashboard.appearance'),
            icon: Palette,
            isActive: currentPath === '/dashboard/settings/appearance'
        }
    ];

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    return (
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
                    <section className="max-w-xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
