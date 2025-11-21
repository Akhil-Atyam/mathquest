
'use client';

import { Logo } from "@/components/logo";
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebarNav, StudentProfile } from "./StudentSidebarNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useDoc, useFirestore, useUser, useMemoFirebase } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import type { Student } from "@/lib/types";
import { Tutorial } from "./Tutorial";


/**
 * A client component that extracts the current path and determines if a "Back" button should be shown.
 * We extract this to its own component to avoid making the entire header a client component.
 */
function PageHeader() {
    return (
        <header className="flex items-center justify-between p-2 border-b md:p-3">
            {/* The `SidebarTrigger` is a button that is only visible on mobile to open the sidebar. */}
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1" />
            {/* Logout button that links back to the home page. */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </Link>
            </Button>
        </header>
    )
}

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [showTutorial, setShowTutorial] = useState(false);

    const studentDocRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user?.uid]);

    const { data: student } = useDoc<Student>(studentDocRef);

    useEffect(() => {
        if (student && !student.hasCompletedTutorial) {
            setShowTutorial(true);
        }
    }, [student]);

    const handleTutorialComplete = () => {
        if (studentDocRef) {
            updateDoc(studentDocRef, { hasCompletedTutorial: true });
        }
        setShowTutorial(false);
    };
    
    return (
         <SidebarProvider>
            {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}
            {/* The main `Sidebar` component. It's responsive and becomes an off-canvas menu on mobile. */}
            <Sidebar>
                {/* The header of the sidebar, typically containing the logo. */}
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
                {/* The main content area of the sidebar, which holds the navigation menu. */}
                <SidebarContent>
                    <StudentSidebarNav />
                </SidebarContent>
                {/* The footer of the sidebar, which shows the student's profile information. */}
                {/* The `group-data-[collapsible=icon]:hidden` class hides the footer when the sidebar is collapsed to icon-only view. */}
                <SidebarFooter className="group-data-[collapsible=icon]:hidden">
                    <StudentProfile />
                </SidebarFooter>
            </Sidebar>
            {/* `SidebarInset` is the main content area of the page, which is pushed to the right of the sidebar. */}
            <SidebarInset>
                {/* A simple header for the main content area. Using Suspense to handle client-side path logic. */}
                <Suspense fallback={<header className="h-[53px] border-b" />}>
                   <PageHeader />
                </Suspense>
                {/* Renders the actual page content. */}
                {children}
            </SidebarInset>
        </SidebarProvider>
    )
}


/**
 * The layout component for all pages within the `/student` route.
 * It provides a consistent sidebar navigation and header structure for the student-facing parts of the app.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The specific page component to be rendered within this layout.
 * @returns {JSX.Element} The student section layout.
 */
export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <StudentLayoutContent>{children}</StudentLayoutContent>
        </Suspense>
    );
}

