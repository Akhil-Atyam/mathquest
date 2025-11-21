
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Teacher, Booking } from '@/lib/types';
import React, { useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, updateDoc, deleteDoc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailabilityManager } from '../dashboard/AvailabilityManager';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Clock, Edit, Users, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


/**
 * Component to display a list of bookings.
 * @param bookings - Array of booking objects to display.
 * @param title - The title for this section of bookings (e.g., "Upcoming Sessions").
 * @param onUpdateLink - Function to call when updating a meeting link.
 * @param onDeleteSession - Function to call when deleting a session.
 */
function BookingsList({
  bookings,
  title,
  onUpdateLink,
  onDeleteSession,
}: {
  bookings: Booking[];
  title: string;
  onUpdateLink: (bookingId: string, newLink: string) => void;
  onDeleteSession: (bookingId: string) => void;
}) {

  if (bookings.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">No {title.toLowerCase()} found.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="grid gap-2 flex-1">
               <p className="font-medium">{booking.topic}</p>
              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                 <span className='flex items-center gap-1'><Calendar className='w-4 h-4' /> {format(booking.startTime.toDate(), 'PPP')}</span>
                 <span className='flex items-center gap-1'><Clock className='w-4 h-4' /> {format(booking.startTime.toDate(), 'p')}</span>
                 <span className='flex items-center gap-1'><Users className='w-4 h-4' /> {(booking.studentIds || []).length} / {booking.studentLimit} students</span>
              </div>
              <div className="text-xs">
                <span className="font-medium">Students: </span>
                <span className="text-muted-foreground">{(booking.studentNames || []).join(', ')}</span>
              </div>
              {booking.meetingLink && (
                  <p className="text-xs text-blue-600 truncate">
                      Link: <a href={booking.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">{booking.meetingLink}</a>
                  </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <AddLinkDialog booking={booking} onSave={onUpdateLink} />
              {title === 'Upcoming Sessions' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete the session for all enrolled students. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteSession(booking.id)}>
                        Yes, delete session
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * A dialog component for adding or editing a meeting link for a booking.
 * @param booking - The booking object to update.
 * @param onSave - Function to call when saving the link.
 */
function AddLinkDialog({ booking, onSave }: { booking: Booking; onSave: (bookingId: string, link: string) => void }) {
    const [link, setLink] = useState(booking.meetingLink || '');
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        onSave(booking.id, link);
        setIsOpen(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    {booking.meetingLink ? 'Edit Link' : 'Add Link'}
                </Button>
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
 * The main page for managing tutoring sessions and availability.
 */
export default function TutoringPage() {
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
    
     const handleDeleteSession = async (bookingId: string) => {
        if (!firestore) return;
        const bookingRef = doc(firestore, 'tutoring_sessions', bookingId);
        try {
            await deleteDoc(bookingRef);
            toast({
                title: 'Session Removed',
                description: 'The tutoring session has been successfully deleted.',
            });
        } catch (error) {
            console.error('Error deleting session:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete the session. Please try again.',
            });
        }
    };

    const { upcomingBookings, pastBookings } = useMemo(() => {
        if (!bookings) return { upcomingBookings: [], pastBookings: [] };
        const now = new Date();
        const upcoming = bookings.filter(b => b.startTime.toDate() >= now).sort((a, b) => a.startTime.toMillis() - b.startTime.toMillis());
        const past = bookings.filter(b => b.startTime.toDate() < now).sort((a,b) => b.startTime.toMillis() - a.startTime.toMillis());
        return { upcomingBookings: upcoming, pastBookings: past };
    }, [bookings]);

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
        <div className="p-4 sm:p-6 space-y-8">
             <h1 className="text-3xl font-bold font-headline">Manage Tutoring</h1>
            <AvailabilityManager teacher={teacher} />
            <Card>
                <CardHeader>
                    <CardTitle>My Booked Sessions</CardTitle>
                    <CardDescription>Here are your upcoming and past tutoring sessions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <BookingsList 
                        bookings={upcomingBookings} 
                        title="Upcoming Sessions" 
                        onUpdateLink={handleUpdateLink}
                        onDeleteSession={handleDeleteSession}
                    />
                    <BookingsList 
                        bookings={pastBookings} 
                        title="Past Sessions" 
                        onUpdateLink={handleUpdateLink}
                        onDeleteSession={handleDeleteSession}
                     />
                </CardContent>
            </Card>
        </div>
    );
}
