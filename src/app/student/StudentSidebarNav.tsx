"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, BookOpen, Calendar, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { student } from '@/lib/data';

const menuItems = [
  { href: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/student/resources', label: 'Resources', icon: BookOpen },
  { href: '/student/tutoring', label: 'Tutoring', icon: Calendar },
];

export function StudentSidebarNav() {
    const pathname = usePathname();
    return (
        <SidebarMenu>
            {menuItems.map(item => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                        <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                            <item.icon />
                            <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

export function StudentProfile() {
    return (
        <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10">
                <AvatarImage src="https://picsum.photos/seed/student/100/100" data-ai-hint="avatar" />
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{student.name}</span>
                <span className="text-xs text-muted-foreground">Grade {student.grade}</span>
            </div>
        </div>
    )
}
