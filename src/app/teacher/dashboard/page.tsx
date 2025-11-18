'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Teacher } from '@/lib/types';
import React from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailabilityManager } from './AvailabilityManager';


/**
 * The main page for the Teacher Dashboard.
 */
export default function TeacherDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const teacherDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null; // Guard: Wait for user and firestore
        return doc(firestore, 'teachers', user.uid);
    }, [user, firestore]);

    const { data: teacher, isLoading: isTeacherLoading } = useDoc<Teacher>(teacherDocRef);
    
    const isLoading = isUserLoading || isTeacherLoading;
    
    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                <Skeleton className="h-9 w-1/2" />
                <div className="w-full">
                    <Skeleton className="h-10 w-full mb-2" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-3xl font-bold font-headline">Teacher Dashboard</h1>

            <Tabs defaultValue="availability" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="resources">Upload Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="availability">
                    <AvailabilityManager teacher={teacher} />
                </TabsContent>

                <TabsContent value="resources">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload New Resource</CardTitle>
                            <CardDescription>Share a new lesson, video, or worksheet with students.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="res-title">Title</Label>
                                <Input id="res-title" placeholder="e.g., Fun with Fractions" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="res-desc">Description</Label>
                                <Textarea id="res-desc" placeholder="A short description of the resource." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="res-file">File or Link</Label>
                                <Input id="res-file" type="text" placeholder="https://example.com/video or upload file" />
                            </div>
                            <Button>Upload Resource</Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
