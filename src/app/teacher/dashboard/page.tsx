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
import { bookings } from '@/lib/data';
import type { Booking } from '@/lib/types';


function BookingsList({ bookings }: { bookings: Booking[] }) {
    const upcomingBookings = bookings.filter(b => b.startTime >= new Date());

    if(upcomingBookings.length === 0) {
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
                {upcomingBookings.map(booking => (
                    <TableRow key={booking.id}>
                        <TableCell>{booking.studentName} (Grade {booking.grade})</TableCell>
                        <TableCell>{format(booking.startTime, "PPP 'at' p")}</TableCell>
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

function AttendanceList({ bookings }: { bookings: Booking[] }) {
    const pastBookings = bookings.filter(b => b.startTime < new Date());

     if(pastBookings.length === 0) {
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
                {pastBookings.map(booking => (
                <TableRow key={booking.id}>
                    <TableCell>{booking.studentName}</TableCell>
                    <TableCell>{format(booking.startTime, 'PPP')}</TableCell>
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
                <BookingsList bookings={bookings} />
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
              <AttendanceList bookings={bookings} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
