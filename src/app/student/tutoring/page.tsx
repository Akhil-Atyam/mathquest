'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingForm } from './BookingForm';
import { format, startOfDay } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Teacher } from '@/lib/types';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * The main page for booking a tutoring session.
 * It allows students to select a teacher and a date, view available times, and fill out a booking form.
 */
export default function TutoringPage() {
  const firestore = useFirestore();

  // --- State Management ---
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string | undefined>();
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [isClient, setIsClient] = React.useState(false);

  // --- Data Fetching ---
  const teachersCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'teachers') : null, [firestore]);
  const { data: teachers, isLoading: areTeachersLoading } = useCollection<Teacher>(teachersCollectionRef);

  // --- Effects ---
  React.useEffect(() => {
    // Set client flag on mount to avoid hydration errors.
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    // Set a default teacher once the list has loaded.
    if (teachers && teachers.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(teachers[0].id);
    }
  }, [teachers, selectedTeacherId]);

  // --- Memoized Calculations ---
  const selectedTeacher = React.useMemo(() => {
    if (!teachers || !selectedTeacherId) return undefined;
    return teachers.find((t) => t.id === selectedTeacherId);
  }, [selectedTeacherId, teachers]);

  const allAvailableDays = React.useMemo(() => {
    if (!selectedTeacher?.availability) return [];
    
    if (typeof selectedTeacher.availability !== 'object' || selectedTeacher.availability === null) {
      return [];
    }

    const today = startOfDay(new Date());
    return Object.keys(selectedTeacher.availability)
      .map(dayOffset => {
          const futureDate = new Date(today);
          futureDate.setDate(today.getDate() + Number(dayOffset));
          return startOfDay(futureDate);
      })
      .filter(d => {
        const offset = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return (selectedTeacher.availability?.[String(offset)]?.length || 0) > 0;
      });
  }, [selectedTeacher]);

  const availableTimesForSelectedDay = React.useMemo(() => {
    if (!date || !selectedTeacher?.availability) return [];
    
    const today = startOfDay(new Date());
    const selectedDayStart = startOfDay(date);
    
    const dayOffset = Math.round((selectedDayStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return selectedTeacher.availability[String(dayOffset)]?.sort() || [];
  }, [date, selectedTeacher]);
  
  const isLoading = areTeachersLoading;

  if (isLoading) {
      return (
          <div className="p-4 sm:p-6 space-y-6">
              <Skeleton className="h-9 w-1/2" />
              <Skeleton className="h-6 w-1/3" />
              <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-[313px] w-full" />
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
                  disabled={(day) => {
                      if (!selectedTeacher) return true;
                      const today = startOfDay(new Date());
                      if (day < today) return true;
                      
                      return !allAvailableDays.some(availableDay => 
                        startOfDay(availableDay).getTime() === startOfDay(day).getTime()
                      );
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
                isLoadingTimes={false} // Since we are not fetching bookings, this is always false
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
