"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

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
 * It fetches the teacher's data from Firestore and displays their avatar and name.
 */
export function TeacherProfile() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const teacherDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'teachers', user.uid);
    }, [firestore, user?.uid]);

    const { data: teacher, isLoading: isTeacherLoading } = useDoc<Teacher>(teacherDocRef);

    // Show a skeleton loader while user or teacher data is loading.
    if (isUserLoading || isTeacherLoading) {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
        );
    }

    if (!user || !teacher) {
        return null;
    }

    return (
        <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10">
                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} data-ai-hint="avatar" />
                <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{teacher.name}</span>
                <span className="text-xs text-muted-foreground">Teacher</span>
            </div>
        </div>
    )
}
