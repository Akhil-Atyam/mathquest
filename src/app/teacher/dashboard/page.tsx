'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { format } from 'date-fns';
import type { Booking, Teacher } from '@/lib/types';
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailabilityManager } from './AvailabilityManager';

/**
 * A dialog component for adding or editing a meeting link for a booking.
 */
function AddLinkDialog({ booking, onSave, children }: { booking: Booking, onSave: (bookingId: string, link: string) => void, children: React.ReactNode }) {
    const [link, setLink] = useState(booking.meetingLink || '');

    useEffect(() => {
        setLink(booking.meetingLink || '');
    }, [booking.meetingLink]);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{booking.meetingLink ? 'Edit' : 'Add'} Meeting Link</DialogTitle>
                    <DialogDescription>
                        {booking.meetingLink ? 'Edit the' : 'Add a'} meeting link for your session with {booking.studentName} on {format(booking.startTime.toDate(), "PPP 'at' p")}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="meeting-link" className="text-right">
                            Link
                        </Label>
                        <Input
                            id="meeting-link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            className="col-span-3"
                            placeholder="https://meet.google.com/..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Cancel
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button type="submit" onClick={() => onSave(booking.id, link)}>Save Link</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

/**
 * A component that displays a list of upcoming bookings in a table.
 */
function BookingsList({ bookings, onUpdateLink }: { bookings: Booking[], onUpdateLink: (bookingId: string, link: string) => void }) {
    if (bookings.length === 0) {
        return <p className="text-center text-muted-foreground p-8">No upcoming bookings.</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Meeting Link</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map(booking => (
                    <TableRow key={booking.id}>
                        <TableCell>{booking.studentName} (Grade {booking.grade})</TableCell>
                        <TableCell>{format(booking.startTime.toDate(), "PPP 'at' p")}</TableCell>
                        <TableCell>{booking.topic}</TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                {booking.meetingLink ?
                                    <>
                                        <Button variant="link" asChild className="p-0 h-auto"><a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">Join Meeting</a></Button>
                                        <AddLinkDialog booking={booking} onSave={onUpdateLink}>
                                            <Button variant="outline" size="sm">Edit</Button>
                                        </AddLinkDialog>
                                    </>
                                    :
                                    <AddLinkDialog booking={booking} onSave={onUpdateLink}>
                                        <Button variant="secondary" size="sm">Add Link</Button>
                                    </AddLinkDialog>
                                }
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

/**
 * A component that displays a list of past bookings to track attendance.
 */
function AttendanceList({ bookings }: { bookings: Booking[] }) {
    if (bookings.length === 0) {
        return <p className="text-center text-muted-foreground p-8">No past sessions to track.</p>
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead className="text-right">Attended</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {bookings.map(booking => (
                    <TableRow key={booking.id}>
                        <TableCell>{booking.studentName}</TableCell>
                        <TableCell>{format(booking.startTime.toDate(), 'PPP')}</TableCell>
                        <TableCell>{booking.topic}</TableCell>
                        <TableCell className="text-right">
                            <Checkbox defaultChecked={booking.attended} />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

/**
 * The main page for the Teacher Dashboard.
 */
export default function TeacherDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null; // Guard: Wait for user and firestore
        return query(collection(firestore, 'tutoring_sessions'), where('teacherId', '==', user.uid));
    }, [user, firestore]);

    const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

    const teacherDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null; // Guard: Wait for user and firestore
        return doc(firestore, 'teachers', user.uid);
    }, [user, firestore]);

    const { data: teacher, isLoading: isTeacherLoading } = useDoc<Teacher>(teacherDocRef);

    const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
    const [pastBookings, setPastBookings] = useState<Booking[]>([]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (bookings) {
            const now = new Date();
            setUpcomingBookings(bookings.filter(b => b.startTime.toDate() >= now).sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis()));
            setPastBookings(bookings.filter(b => b.startTime.toDate() < now).sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis()));
        }
    }, [bookings]);

    const handleUpdateLink = async (bookingId: string, link: string) => {
        if (!firestore) return;
        const bookingRef = doc(firestore, 'tutoring_sessions', bookingId);
        try {
            await updateDoc(bookingRef, { meetingLink: link });
        } catch (error) {
            console.error("Error updating meeting link: ", error);
        }
    };
    
    if (isUserLoading || areBookingsLoading || isTeacherLoading) {
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

            <Tabs defaultValue="bookings" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="bookings">Bookings</TabsTrigger>
                    <TabsTrigger value="availability">Availability</TabsTrigger>
                    <TabsTrigger value="resources">Upload Resources</TabsTrigger>
                    <TabsTrigger value="attendance">Attendance</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upcoming Sessions</CardTitle>
                            <CardDescription>Manage your scheduled tutoring sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!isClient ? <Skeleton className="h-40 w-full" /> : <BookingsList bookings={upcomingBookings} onUpdateLink={handleUpdateLink} />}
                        </CardContent>
                    </Card>
                </TabsContent>

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

                <TabsContent value="attendance">
                    <Card>
                        <CardHeader>
                            <CardTitle>Session Attendance</CardTitle>
                            <CardDescription>Track which students attended past sessions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!isClient ? <Skeleton className="h-40 w-full" /> : <AttendanceList bookings={pastBookings} />}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
