import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarFooter, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuButton, 
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Home, 
    Calendar,
    Heart,
    CreditCard,
    Star,
    Settings,
    PlusCircle,
    Users,
    TrendingUp,
    Wallet,
    User
} from 'lucide-react';
import AppLogo from './app-logo';

interface User {
    id: number;
    name: string;
    email: string;
    is_owner: boolean;
}

interface PageProps {
    auth: {
        user: User;
    };
    [key: string]: any;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;
    
    // Common items for all users
    const commonItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
    ];

    // Owner-specific sections
    const ownerSections: NavSection[] = [
        {
            title: 'Property Management',
            items: [
                {
                    title: 'My Rooms',
                    href: '/owner/rooms',
                    icon: Home,
                },
                {
                    title: 'Add Room',
                    href: '/owner/rooms/create',
                    icon: PlusCircle,
                },
            ]
        },
        {
            title: 'Business',
            items: [
                {
                    title: 'Bookings',
                    href: '/owner/bookings',
                    icon: Calendar,
                },
                {
                    title: 'Tenants',
                    href: '/owner/tenants',
                    icon: Users,
                },
                {
                    title: 'Earnings',
                    href: '/owner/earnings',
                    icon: TrendingUp,
                },
                {
                    title: 'Payouts',
                    href: '/owner/payouts',
                    icon: Wallet,
                },
            ]
        },
        {
            title: 'Reviews & Feedback',
            items: [
                {
                    title: 'Reviews',
                    href: '/owner/reviews',
                    icon: Star,
                },
            ]
        }
    ];

    // Renter-specific sections
    const renterSections: NavSection[] = [
        {
            title: 'Find Rooms',
            items: [
                {
                    title: 'Browse Rooms',
                    href: '/rooms',
                    icon: Home,
                },
                {
                    title: 'My Bookmarks',
                    href: '/bookmarks',
                    icon: Heart,
                },
            ]
        },
        {
            title: 'My Activity',
            items: [
                {
                    title: 'Appointments',
                    href: '/appointments',
                    icon: Calendar,
                },
                {
                    title: 'My Bookings',
                    href: '/bookings',
                    icon: User,
                },
                {
                    title: 'Payment History',
                    href: '/payments',
                    icon: CreditCard,
                },
                {
                    title: 'My Reviews',
                    href: '/reviews',
                    icon: Star,
                },
            ]
        }
    ];

    const sections = user.is_owner ? ownerSections : renterSections;

    const footerNavItems: NavItem[] = [
        {
            title: 'Settings',
            href: '/settings',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Common items */}
                <NavMain items={commonItems} />
                
                {/* Role-specific sections */}
                {sections.map((section, index) => (
                    <SidebarGroup key={index}>
                        <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <NavMain items={section.items} />
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}