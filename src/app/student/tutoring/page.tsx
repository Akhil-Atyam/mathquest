
'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingForm } from './BookingForm';
import { format, startOfDay, endOfDay } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Teacher, Booking } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * The main page for booking a tutoring session.
 * It allows students to select a teacher and a date, view available times, and fill out a booking form.
 */
export default function TutoringPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const teachersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'teachers') : null, [firestore]);
  const { data: teachers, isLoading: areTeachersLoading } = useCollection<Teacher>(teachersCollectionRef);

  // State to manage the ID of the selected teacher.
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string | undefined>(undefined);
  // State for the date selected in the calendar, initialized to undefined.
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [isClient, setIsClient] = React.useState(false);
  
  // Set initial date and client flag on the client-side to avoid hydration errors.
  React.useEffect(() => {
    setDate(new Date());
    setIsClient(true);
  }, []);

  // Effect to set the default selected teacher once teachers are loaded.
  React.useEffect(() => {
    if (teachers && teachers.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId]);

  // Memoized value to find the full teacher object based on the selected ID.
  const selectedTeacher = React.useMemo(() => {
    if (!teachers) return undefined;
    return teachers.find((t) => t.id === selectedTeacherId);
  }, [selectedTeacherId, teachers]);

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore || !selectedTeacherId || !date || !user) return null;
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    return query(
        collection(firestore, 'tutoring_sessions'), 
        where('teacherId', '==', selectedTeacherId),
        where('startTime', '>=', dayStart),
        where('startTime', '<=', dayEnd)
    );
  }, [firestore, selectedTeacherId, date, user]);

  const { data: todaysBookings, isLoading: areBookingsLoading } = useCollection<Booking>(bookingsQuery);

  // Memoized value to get a list of all dates the selected teacher is available.
  const allAvailableDays = React.useMemo(() => {
    if (!selectedTeacher || !selectedTeacher.availability) return [];
    const today = startOfDay(new Date());
    return Object.keys(selectedTeacher.availability)
      .map(dayOffset => {
          const futureDate = new Date(today);
          futureDate.setDate(futureDate.getDate() + Number(dayOffset));
          return startOfDay(futureDate);
      })
      .filter(d => (selectedTeacher.availability?.[String(Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))]?.length || 0) > 0);
  }, [selectedTeacher]);


  // Memoized value to get the available time slots for the selected date.
  const availableTimesForSelectedDay = React.useMemo(() => {
    if (!date || !selectedTeacher || !selectedTeacher.availability) return [];
    
    const today = startOfDay(new Date());
    const selectedDayStart = startOfDay(date);
    
    // Calculate the day offset between today and the selected date.
    const dayOffset = Math.round((selectedDayStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Get the potential availability for that day
    const allSlots = selectedTeacher.availability[String(dayOffset)]?.sort() || [];
    
    // Get the times that are already booked
    const bookedTimes = (todaysBookings || []).map(booking => format(booking.startTime.toDate(), 'HH:mm'));
    
    // Filter out the booked times
    return allSlots.filter(time => !bookedTimes.includes(time));

  }, [date, selectedTeacher, todaysBookings]);

  if (areTeachersLoading) {
      return (
          <div className="p-4 sm:p-6 space-y-6">
              <Skeleton className="h-9 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-80 w-full" />
                  </div>
                  <Skeleton className="h-[500px] w-full" />
              </div>
          </div>
      )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">
        Book a Tutoring Session
      </h1>
      <p className="text-muted-foreground">
        Select a teacher, then pick a day on the calendar to see available
        times.
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Card for selecting a teacher */}
          <Card>
            <CardHeader>
              <CardTitle>1. Select a Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="teacher-select">Teacher</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
                disabled={!teachers || teachers.length === 0}
              >
                <SelectTrigger id="teacher-select">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers && teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          {/* Card for selecting a date from the calendar */}
          <Card>
            <CardHeader>
              <CardTitle>2. Select an Available Date</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex justify-center">
              {isClient ? (
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md"
                  // Disable dates that are in the past or for which the teacher is not available.
                  disabled={(day) => {
                      if (!selectedTeacher) return true;
                      if (day < startOfDay(new Date())) return true;
                      // Check if the day is in the array of available dates
                      return !allAvailableDays.some(availableDay => startOfDay(availableDay).getTime() === startOfDay(day).getTime());
                  }}
                />
              ) : (
                <div className="p-3">
                  <Skeleton className="w-[280px] h-[313px]" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Card for the booking form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>3. Confirm Your Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium mb-4">
                Booking for {date ? format(date, 'PPP') : '...'}
                {selectedTeacher && ` with ${selectedTeacher.name}`}
              </p>
              <BookingForm
                selectedDay={date}
                availableTimes={availableTimesForSelectedDay}
                teacher={selectedTeacher}
                isLoadingTimes={areBookingsLoading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

    