'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Teacher, Booking } from '@/lib/types';
import React, { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Video } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * A component to display the next upcoming session.
 * @param bookings - Array of all booking objects.
 */
function NextSession({ bookings }: { bookings: Booking[] | null }) {
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
                    Your next session is with {nextSession.studentName}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <p className='font-semibold'>{nextSession.topic}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className='flex items-center gap-1'><Calendar className='w-4 h-4' /> {format(nextSession.startTime.toDate(), 'PPP')}</span>
                        <span className='flex items-center gap-1'><Clock className='w-4 h-4' /> {format(nextSession.startTime.toDate(), 'p')}</span>
                    </div>
                </div>
                {nextSession.meetingLink ? (
                  <Button asChild>
                    <Link href={nextSession.meetingLink} target="_blank">
                      <Video className="mr-2 h-4 w-4" />
                      Join Session
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" asChild>
                      <Link href="/teacher/tutoring">Add Meeting Link</Link>
                  </Button>
                )}
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
            <NextSession bookings={bookings} />
        </div>
    );
}
