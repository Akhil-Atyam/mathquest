import { Logo } from "@/components/logo";
import { SidebarProvider, Sidebar, SidebarInset, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger } from "@/components/ui/sidebar";
import { StudentSidebarNav, StudentProfile } from "./StudentSidebarNav";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Link from "next/link";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <Sidebar>
                <SidebarHeader>
                    <Logo />
                </SidebarHeader>
                <SidebarContent>
                    <StudentSidebarNav />
                </SidebarContent>
                <SidebarFooter className="group-data-[collapsible=icon]:hidden">
                    <StudentProfile />
                </SidebarFooter>
            </Sidebar>
            <SidebarInset>
                <header className="flex items-center justify-between p-2 border-b md:p-3">
                    <SidebarTrigger className="md:hidden" />
                    <div className="flex-1" />
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/">
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </Link>
                    </Button>
                </header>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}
