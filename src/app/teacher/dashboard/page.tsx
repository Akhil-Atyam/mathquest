'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Teacher, Booking } from '@/lib/types';
import React, { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, updateDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video, Edit, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

/**
 * A dialog component for adding or editing a meeting link for a booking.
 * @param booking - The booking object to update.
 * @param onSave - Function to call when saving the link.
 */
function AddLinkDialog({ booking, onSave, children }: { booking: Booking; onSave: (bookingId: string, link: string) => void, children: React.ReactNode }) {
    const [link, setLink] = useState(booking.meetingLink || '');
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        onSave(booking.id, link);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Meeting Link for {booking.topic}</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm">
                        Add or edit the meeting link for your session on {' '}
                        <strong>{format(booking.startTime.toDate(), 'PPP')} at {format(booking.startTime.toDate(), 'p')}</strong>.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="meeting-link">Meeting Link</Label>
                        <Input 
                            id="meeting-link"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                            placeholder="https://meet.google.com/..."
                        />
                    </div>
                </div>
                <Button onClick={handleSave}>Save Link</Button>
            </DialogContent>
        </Dialog>
    );
}


/**
 * A component to display the next upcoming session.
 * @param bookings - Array of all booking objects.
 */
function NextSession({ bookings, onUpdateLink }: { bookings: Booking[] | null, onUpdateLink: (bookingId: string, newLink: string) => void; }) {
    const nextSession = useMemo(() => {
        if (!bookings) return null;
        const now = new Date();
        const upcoming = bookings
            .filter(b => b.startTime.toDate() >= now)
            .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
        return upcoming[0] || null;
    }, [bookings]);

    if (!nextSession) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Next Tutoring Session</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You have no upcoming sessions.</p>
                    <Button asChild className="mt-4">
                        <Link href="/teacher/tutoring">Manage Availability</Link>
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Next Tutoring Session</CardTitle>
                <CardDescription>
                    Your next session is on {nextSession.topic}.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className='flex items-center gap-1'><Calendar className='w-4 h-4' /> {format(nextSession.startTime.toDate(), 'PPP')}</span>
                        <span className='flex items-center gap-1'><Clock className='w-4 h-4' /> {format(nextSession.startTime.toDate(), 'p')}</span>
                        <span className='flex items-center gap-1'><Users className='w-4 h-4' /> {nextSession.studentIds.length} / {nextSession.studentLimit} students</span>
                    </div>
                     <div className="text-sm">
                        <p className="font-medium">Students:</p>
                        <p className="text-muted-foreground">{nextSession.studentNames.join(', ')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {nextSession.meetingLink ? (
                      <Button asChild>
                        <Link href={nextSession.meetingLink} target="_blank">
                          <Video className="mr-2 h-4 w-4" />
                          Join Session
                        </Link>
                      </Button>
                    ) : null}
                     <AddLinkDialog booking={nextSession} onSave={onUpdateLink}>
                        <Button variant="outline">
                            <Edit className="mr-2 h-4 w-4" />
                            {nextSession.meetingLink ? 'Edit Link' : 'Add Link'}
                        </Button>
                    </AddLinkDialog>
                </div>
            </CardContent>
        </Card>
    )
}


/**
 * The main page for the Teacher Dashboard.
 */
export default function TeacherDashboardPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const teacherDocRef = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return doc(firestore, 'teachers', user.uid);
    }, [user, firestore]);

    const bookingsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'tutoring_sessions'), where('teacherId', '==', user.uid));
    }, [user, firestore]);

    const { data: teacher, isLoading: isTeacherLoading } = useDoc<Teacher>(teacherDocRef);
    const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

    const isLoading = isUserLoading || isTeacherLoading || areBookingsLoading;

    const handleUpdateLink = async (bookingId: string, newLink: string) => {
        if (!firestore) return;
        const bookingRef = doc(firestore, 'tutoring_sessions', bookingId);
        try {
            await updateDoc(bookingRef, { meetingLink: newLink });
            toast({
                title: 'Success',
                description: 'Meeting link has been updated.',
            });
        } catch (error) {
            console.error('Error updating meeting link:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not update the meeting link.',
            });
        }
    };
    
    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                <Skeleton className="h-9 w-1/2" />
                <Skeleton className="h-48 w-full md:w-1/2" />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-3xl font-bold font-headline">Welcome, {teacher?.name || 'Teacher'}!</h1>
            <NextSession bookings={bookings} onUpdateLink={handleUpdateLink} />
        </div>
    );
}
