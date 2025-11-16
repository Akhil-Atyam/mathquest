"use client"

import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookingForm } from "./BookingForm"
import { teachers } from "@/lib/data"
import { format } from 'date-fns'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { Teacher } from "@/lib/types"

export default function TutoringPage() {
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string | undefined>(teachers[0]?.id);
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  const selectedTeacher = React.useMemo(() => {
    return teachers.find(t => t.id === selectedTeacherId);
  }, [selectedTeacherId]);

  const allAvailableDays = React.useMemo(() => {
    if (!selectedTeacher) return [];
    return Object.keys(selectedTeacher.availability).map(day => new Date(day));
  }, [selectedTeacher]);

  const availableTimesForSelectedDay = React.useMemo(() => {
    if (!date || !selectedTeacher) return [];
    const formattedDate = format(date, 'yyyy-MM-dd');
    return selectedTeacher.availability[formattedDate]?.sort() || [];
  }, [date, selectedTeacher]);

  // When teacher changes, reset date if the new teacher isn't available on the currently selected date.
  React.useEffect(() => {
    if (date && selectedTeacher) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      if (!selectedTeacher.availability[formattedDate]) {
        setDate(undefined);
      }
    }
  }, [selectedTeacher, date]);
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Book a Tutoring Session</h1>
      <p className="text-muted-foreground">Select a teacher, then pick a day on the calendar to see available times.</p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>1. Select a Teacher</CardTitle>
            </CardHeader>
            <CardContent>
                <Label htmlFor="teacher-select">Teacher</Label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger id="teacher-select">
                        <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map(teacher => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}
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
                disabled={(day) => !selectedTeacher || day < new Date() || !allAvailableDays.some(d => format(d, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'))}
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
                Booking for {date ? format(date, "PPP") : "..."}
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
