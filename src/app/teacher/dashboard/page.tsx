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
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import type { Booking } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

function BookingsList({ bookings, isLoading }: { bookings: Booking[] | null, isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (!bookings || bookings.length === 0) {
        return <p className="text-center text-muted-foreground p-8">No bookings found.</p>
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
                        <TableCell>
                            {/* Firestore timestamp needs to be converted to JS Date */}
                            {format( (booking.startTime as unknown as Timestamp).toDate(), "PPP 'at' p")}
                        </TableCell>
                        <TableCell>{booking.topic}</TableCell>
                        <TableCell>
                            {booking.meetingLink ?
                                <Button variant="link" asChild><a href={booking.meetingLink} target="_blank" rel="noopener noreferrer">Join</a></Button> :
                                <Button variant="secondary" size="sm">Add Link</Button>
                            }
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function AttendanceList({ bookings, isLoading }: { bookings: Booking[] | null, isLoading: boolean }) {
     if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (!bookings || bookings.length === 0) {
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
                    <TableCell>{format((booking.startTime as unknown as Timestamp).toDate(), 'PPP')}</TableCell>
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

export default function TeacherDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    // Securely query for sessions where the teacherId matches the logged-in user's UID.
    return query(collection(firestore, 'tutoring_sessions'), where('teacherId', '==', user.uid));
  }, [firestore, user]);

  const { data: bookings, isLoading: bookingsLoading } = useCollection<Booking>(sessionsQuery);

  const isLoading = isUserLoading || bookingsLoading;

  const now = new Date();
  const upcomingBookings = bookings?.filter(b => (b.startTime as unknown as Timestamp).toDate() >= now) || [];
  const pastBookings = bookings?.filter(b => (b.startTime as unknown as Timestamp).toDate() < now) || [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Teacher Dashboard</h1>
      
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
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
                <BookingsList bookings={upcomingBookings} isLoading={isLoading} />
            </CardContent>
          </Card>
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
              <AttendanceList bookings={pastBookings} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
