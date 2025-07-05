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
    Settings,
    PlusCircle,
    Users,
    User,
    Flag,
    MessageCircle
} from 'lucide-react';
import AppLogo from './app-logo';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'owner' | 'renter';
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

    // Admin-specific sections
    const adminSections: NavSection[] = [
        {
            title: 'Administration',
            items: [
                {
                    title: 'Manage Users',
                    href: '/admin/users',
                    icon: Users,
                },
                {
                    title: 'Manage Rooms',
                    href: '/admin/rooms',
                    icon: Home,
                },
                {
                    title: 'Reports',
                    href: '/admin/reports',
                    icon: Flag,
                },
            ]
        }
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
            title: 'Activity',
            items: [
                {
                    title: 'Appointments',
                    href: '/owner/appointments',
                    icon: Calendar,
                },
                {
                    title: 'Reports',
                    href: '/owner/reports',
                    icon: Flag,
                },
                {
                    title: 'Messages',
                    href: '/messages',
                    icon: MessageCircle,
                },
            ]
        }
    ];


    // Determine which sections to show based on user role
    let sections: NavSection[] = [];
    if (user.role === 'admin') {
        sections = adminSections;
    } else if (user.role === 'owner') {
        sections = ownerSections;
    } 

    const footerNavItems: NavItem[] = [
        {
            title: 'Settings',
            href: '/dashboard/settings/profile',
            icon: Settings,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
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