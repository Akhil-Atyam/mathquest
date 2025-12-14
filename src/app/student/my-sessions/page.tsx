'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { format, isBefore } from 'date-fns';
import { Calendar, Clock, Video } from 'lucide-react';
import Link from 'next/link';

/**
 * A component to display a list of bookings, either upcoming or past.
 * @param {object} props - The component props.
 * @param {string} props.title - The title for the list (e.g., "Upcoming Sessions").
 * @param {Booking[]} props.bookings - The array of booking objects to display.
 */
function SessionList({ title, bookings }: { title: string; bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-muted-foreground">You have no {title.toLowerCase()}.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <CardTitle>{booking.topic}</CardTitle>
              <CardDescription>
                Session with {booking.teacherName} ({booking.studentIds.length}/{booking.studentLimit} students)
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="grid gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{format(booking.startTime.toDate(), 'PPP')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{format(booking.startTime.toDate(), 'p')}</span>
                </div>
              </div>
              {title === 'Upcoming Sessions' && (
                booking.meetingLink ? (
                  <Button asChild>
                    <Link href={booking.meetingLink} target="_blank">
                      <Video className="mr-2 h-4 w-4" />
                      Join Session
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    No link provided
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * The main page component for the "My Sessions" view.
 * It fetches the student's bookings from Firestore and displays them.
 */
export default function MySessionsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  // Memoize the Firestore query to prevent re-running on every render.
  // The query will only be created when `firestore` and `user` are available.
  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'tutoring_sessions'), where('studentIds', 'array-contains', user.uid));
  }, [firestore, user?.uid]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

  // Memoize the filtered lists of upcoming and past sessions.
  const { upcomingSessions, pastSessions } = useMemo(() => {
    if (!bookings) {
      return { upcomingSessions: [], pastSessions: [] };
    }
    const now = new Date();
    const upcoming = bookings
      .filter((b) => !isBefore(b.startTime.toDate(), now))
      .sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
    const past = bookings
      .filter((b) => isBefore(b.startTime.toDate(), now))
      .sort((a, b) => b.startTime.toMillis() - a.startTime.toMillis());
    return { upcomingSessions: upcoming, pastSessions: past };
  }, [bookings]);
  
  // Show a skeleton loader while the data is being fetched.
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <h1 className="text-3xl font-bold font-headline">My Sessions</h1>
        <div className="space-y-4">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-8">
      <h1 className="text-3xl font-bold font-headline" id="tutorial-my-sessions">My Sessions</h1>
      <SessionList title="Upcoming Sessions" bookings={upcomingSessions} />
      <SessionList title="Past Sessions" bookings={pastSessions} />
    </div>
  );
}
