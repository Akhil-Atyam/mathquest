import { Logo } from "@/components/logo";
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { TeacherSidebarNav, TeacherProfile } from "./TeacherSidebarNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

/**
 * The layout component for all pages within the `/teacher` route.
 * It sets up the standard sidebar navigation and header for the teacher-facing part of the application.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The specific page content to be rendered within this layout.
 * @returns {JSX.Element} The teacher section layout.
 */
export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // `SidebarProvider` manages the state of the sidebar (e.g., open, closed, mobile view).
        <SidebarProvider>
            {/* The main sidebar component, which is responsive. */}
            <Sidebar>
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
                <SidebarContent>
                    <TeacherSidebarNav />
                </SidebarContent>
                <SidebarFooter className="group-data-[collapsible=icon]:hidden">
                    <TeacherProfile />
                </SidebarFooter>
            </Sidebar>
            {/* `SidebarInset` is the main content area that sits to the side of the sidebar. */}
            <SidebarInset>
                <header className="flex items-center justify-between p-2 border-b md:p-3">
                    {/* The `SidebarTrigger` is a hamburger-style button shown only on mobile to open the menu. */}
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Link>
                    </Button>
                </header>
                {/* Renders the actual page content passed as children. */}
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
