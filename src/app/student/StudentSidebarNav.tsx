"use client";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, BookOpen, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


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
 * It fetches the student's data from Firestore based on the authenticated user's ID
 * and displays their avatar, name, and grade level.
 */
export function StudentProfile() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const studentDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

    // Show a skeleton loader while the user or student data is being fetched.
    if (isUserLoading || isStudentLoading) {
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
    
    // If there's no user or student data, render nothing.
    if (!user || !student) {
        return null;
    }

    return (
        <div className="flex items-center gap-3">
             <Avatar className="h-10 w-10">
                {/* Using a placeholder image from picsum.photos */}
                <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} data-ai-hint="avatar" />
                {/* Fallback avatar shows the first initial of the student's name. */}
                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
                <span className="font-semibold truncate">{student.name}</span>
                <span className="text-xs text-muted-foreground">Grade {student.grade || 'N/A'}</span>
            </div>
        </div>
    )
}
