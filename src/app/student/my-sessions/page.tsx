'use client';

import React, { useState, useEffect } from 'react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

/**
 * A component that displays a list of a student's tutoring sessions.
 * It separates them into upcoming and past sessions.
 */
function MySessionsList({ bookings }: { bookings: Booking[] }) {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (bookings) {
      const now = new Date();
      setUpcomingBookings(bookings.filter(b => b.startTime.toDate() >= now));
      setPastBookings(bookings.filter(b => b.startTime.toDate() < now));
    }
  }, [bookings]);

  if (!isClient) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
          <CardDescription>Your scheduled one-on-one tutoring sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingBookings.map(booking => (
                  <TableRow key={booking.id}>
                    <TableCell>{format(booking.startTime.toDate(), "PPP 'at' p")}</TableCell>
                    <TableCell>{booking.teacherName}</TableCell>
                    <TableCell>{booking.topic}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.meetingLink ? (
                        <Button asChild size="sm">
                          <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">Join Meeting</a>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>No Link</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground p-8">You have no upcoming sessions scheduled.</p>
          )}
        </CardContent>
      </Card>

      {/* Past Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Past Sessions</CardTitle>
          <CardDescription>Your history of completed tutoring sessions.</CardDescription>
        </CardHeader>
        <CardContent>
           {pastBookings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Attendance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pastBookings.map(booking => (
                  <TableRow key={booking.id} className="text-muted-foreground">
                    <TableCell>{format(booking.startTime.toDate(), "PPP")}</TableCell>
                    <TableCell>{booking.teacherName}</TableCell>
                    <TableCell>{booking.topic}</TableCell>
                    <TableCell>
                       <Badge variant={booking.attended ? 'secondary' : 'outline'}>
                        {booking.attended ? 'Attended' : 'Not Marked'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground p-8">You have no past sessions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


/**
 * The main page for students to view their tutoring sessions.
 * It fetches the student's bookings from Firestore and displays them.
 */
export default function MySessionsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const bookingsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'tutoring_sessions'),
      where('studentId', '==', user.uid),
      orderBy('startTime', 'desc')
    );
  }, [user, firestore]);

  const { data: bookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  const isLoading = isUserLoading || areBookingsLoading;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">My Sessions</h1>
      <p className="text-muted-foreground">
        View your upcoming and past tutoring sessions.
      </p>

      {isLoading ? (
        <div className="space-y-8">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <MySessionsList bookings={bookings || []} />
      )}
    </div>
  );
}
