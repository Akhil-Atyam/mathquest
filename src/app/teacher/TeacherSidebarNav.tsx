"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { teachers } from '@/lib/data';

// An array defining the navigation items for the teacher sidebar.
const menuItems = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

/**
 * Renders the primary navigation menu for the teacher sidebar.
 * It maps over `menuItems` to create navigation links and highlights the active link.
 */
export function TeacherSidebarNav() {
    const pathname = usePathname();
    // Using mock data for the teacher. In a real app, this would come from an auth context.
    const teacher = teachers[0];
    return (
        <SidebarMenu>
            {menuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname.startsWith(item.href)} tooltip={item.label}>
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

/**
 * Renders the teacher's profile information at the bottom of the sidebar.
 * It displays the teacher's avatar and name.
 */
export function TeacherProfile() {
    // Using mock data for the teacher.
    const teacher = teachers[0];
    return (
        <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/teacher/100/100" data-ai-hint="avatar" />
                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{teacher.name}</span>
                <span className="text-xs text-muted-foreground">Teacher</span>
            </div>
        </div>
    )
}
