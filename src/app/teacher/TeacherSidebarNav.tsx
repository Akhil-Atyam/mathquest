"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { teachers } from '@/lib/data';

const menuItems = [
  { href: '/teacher/dashboard', label: 'Dashboard', icon: LayoutDashboard },
];

export function TeacherSidebarNav() {
    const pathname = usePathname();
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


export function TeacherProfile() {
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