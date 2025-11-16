'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingForm } from './BookingForm';
import { teachers } from '@/lib/data';
import { format } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Teacher } from '@/lib/types';

// Helper to generate a future date string
const getFutureDate = (dayOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return format(date, 'yyyy-MM-dd');
};

export default function TutoringPage() {
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<
    string | undefined
  >(teachers[0]?.id);
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const selectedTeacher = React.useMemo(() => {
    return teachers.find((t) => t.id === selectedTeacherId);
  }, [selectedTeacherId]);

  const allAvailableDays = React.useMemo(() => {
    if (!selectedTeacher) return [];
    return Object.keys(selectedTeacher.availability).map((dayOffset) => {
      return new Date(getFutureDate(Number(dayOffset)));
    });
  }, [selectedTeacher]);

  const availableTimesForSelectedDay = React.useMemo(() => {
    if (!date || !selectedTeacher) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDayStart = new Date(date);
    selectedDayStart.setHours(0, 0, 0, 0);

    const dayOffset = Math.ceil((selectedDayStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return selectedTeacher.availability[String(dayOffset)]?.sort() || [];

  }, [date, selectedTeacher]);


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
          <Card>
            <CardHeader>
              <CardTitle>1. Select a Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="teacher-select">Teacher</Label>
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger id="teacher-select">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>2. Select an Available Date</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                disabled={(day) =>
                  !selectedTeacher ||
                  day < new Date() ||
                  !allAvailableDays.some(d => d.toDateString() === day.toDateString())
                }
              />
            </CardContent>
          </Card>
        </div>
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
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
