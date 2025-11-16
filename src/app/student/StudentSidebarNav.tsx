"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, BookOpen, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { student } from '@/lib/data';

// An array defining the navigation items for the student sidebar.
// Each object contains the link, label, and icon for a menu item.
const menuItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/resources', label: 'Resources', icon: BookOpen },
  { href: '/student/tutoring', label: 'Tutoring', icon: Calendar },
];

/**
 * Renders the primary navigation menu for the student sidebar.
 * It maps over the `menuItems` array to create the navigation links.
 * The active link is highlighted based on the current URL path.
 */
export function StudentSidebarNav() {
    // `usePathname` is a client-side hook to get the current URL path.
    const pathname = usePathname();
    return (
        <SidebarMenu>
            {menuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton 
                            // The button is marked as active if the current path starts with the item's href.
                            isActive={pathname.startsWith(item.href)} 
                            tooltip={item.label}
                        >
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
 * Renders the student's profile information at the bottom of the sidebar.
 * It displays the student's avatar, name, and grade level using mock data.
 * In a real application, this data would come from an authentication context or API call.
 */
export function StudentProfile() {
    return (
        <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10">
                {/* Using a placeholder image from picsum.photos */}
                <AvatarImage src="https://picsum.photos/seed/student/100/100" data-ai-hint="avatar" />
                {/* Fallback avatar shows the first initial of the student's name. */}
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{student.name}</span>
                <span className="text-xs text-muted-foreground">Grade {student.grade}</span>
            </div>
        </div>
    )
}
