"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingForm } from "./BookingForm"
import { teachers } from "@/lib/data"
import { format } from 'date-fns'

export default function TutoringPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const allAvailableDays = React.useMemo(() => {
    const days = new Set<string>();
    teachers.forEach(teacher => {
      Object.keys(teacher.availability).forEach(day => {
        days.add(day);
      });
    });
    return Array.from(days).map(day => new Date(day));
  }, []);

  const availableTimesForSelectedDay = React.useMemo(() => {
    if (!date) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    const times = new Set<string>();
    teachers.forEach(teacher => {
        if(teacher.availability[formattedDate]) {
            teacher.availability[formattedDate].forEach(time => times.add(time));
        }
    });
    return Array.from(times).sort();
  }, [date]);
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Book a Tutoring Session</h1>
      <p className="text-muted-foreground">Select a day on the calendar to see available times.</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardContent className="p-2 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md"
                disabled={(day) => day < new Date() || !allAvailableDays.some(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Book for {date ? format(date, "PPP") : "..."}</CardTitle>
            </CardHeader>
            <CardContent>
              <BookingForm selectedDay={date} availableTimes={availableTimesForSelectedDay} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
