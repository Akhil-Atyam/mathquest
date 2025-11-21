'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, startOfDay } from 'date-fns';

// Schema for the availability form
const availabilitySchema = z.object({
  day: z.date({
    required_error: "A date is required.",
  }),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  limit: z.coerce.number().min(1, "Limit must be at least 1."),
});

// Main component to manage teacher availability
export function AvailabilityManager({ teacher }: { teacher: Teacher | null }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentAvailability, setCurrentAvailability] = useState<Teacher['availability']>(teacher?.availability || {});

  // Update local state if the teacher prop changes
  useEffect(() => {
    setCurrentAvailability(teacher?.availability || {});
  }, [teacher]);

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      time: '',
      limit: 1,
    },
  });

  // Handler for adding a new time slot
  async function onAddTimeSlot(values: z.infer<typeof availabilitySchema>) {
    if (!user || !firestore) return;

    const { day, time, limit } = values;

    const today = startOfDay(new Date());
    const selectedDay = startOfDay(day);
    const dayOffset = Math.ceil((selectedDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dayOffset < 0) {
        form.setError('day', { type: 'manual', message: 'Cannot set availability for a past date.' });
        return;
    }
    const dayKey = String(dayOffset);

    const updatedAvailability = { ...currentAvailability };
    
    if (!updatedAvailability[dayKey]) {
      updatedAvailability[dayKey] = [];
    }

    // Avoid adding duplicate times
    if (updatedAvailability[dayKey]?.some(slot => slot.time === time)) {
      form.setError('time', { type: 'manual', message: 'This time slot already exists for this day.' });
      return;
    }

    updatedAvailability[dayKey]?.push({ time, limit });
    updatedAvailability[dayKey]?.sort((a,b) => a.time.localeCompare(b.time)); // Keep times sorted

    try {
      const teacherRef = doc(firestore, 'teachers', user.uid);
      // Use setDoc with merge:true to create or update the document.
      await setDoc(teacherRef, { availability: updatedAvailability }, { merge: true });
      setCurrentAvailability(updatedAvailability);
      toast({ title: 'Success', description: `Added ${time} to your availability for ${format(day, 'PPP')}.` });
      form.reset({ day: undefined, time: '', limit: 1 });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({ variant: "destructive", title: 'Error', description: 'Could not update your availability.' });
    }
  }

  // Handler for removing a time slot
  async function onRemoveTimeSlot(dayKey: string, time: string) {
    if (!user || !firestore) return;

    const updatedAvailability = { ...currentAvailability };
    updatedAvailability[dayKey] = updatedAvailability[dayKey]?.filter(t => t.time !== time);

    if (updatedAvailability[dayKey]?.length === 0) {
      delete updatedAvailability[dayKey];
    }
    
    try {
      const teacherRef = doc(firestore, 'teachers', user.uid);
      // Use setDoc with merge:true to safely update the document.
      await setDoc(teacherRef, { availability: updatedAvailability }, { merge: true });
      setCurrentAvailability(updatedAvailability);
      toast({ title: 'Success', description: `Removed ${time} from your availability.` });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({ variant: "destructive", title: 'Error', description: 'Could not update your availability.' });
    }
  }
  
  const getDayLabel = (dayOffset: string) => {
      const offset = Number(dayOffset);
      if (offset === 0) return 'Today';
      if (offset === 1) return 'Tomorrow';
      const date = new Date();
      date.setDate(date.getDate() + offset);
      return format(date, 'PPP');
  }

  const sortedDays = Object.keys(currentAvailability).sort((a,b) => Number(a) - Number(b));


  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form to add new slots */}
      <Card>
        <CardHeader>
          <CardTitle>Add Available Time</CardTitle>
          <CardDescription>Select a date and add a time slot to your schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddTimeSlot)} className="space-y-4">
               <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Day</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0)) 
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                    <FormItem className="flex-1">
                        <FormLabel>Time (24-hour format)</FormLabel>
                        <FormControl>
                        <Input type="text" placeholder="HH:MM" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="limit"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Student Limit</FormLabel>
                        <FormControl>
                        <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
              </div>

              <Button type="submit">Add Time Slot</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {/* Display current availability */}
      <Card>
        <CardHeader>
          <CardTitle>Your Current Availability</CardTitle>
          <CardDescription>This is the schedule students will see when booking a session.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {sortedDays.length > 0 ? (
                sortedDays.filter(d => currentAvailability[d] && currentAvailability[d]!.length > 0).map(dayKey => (
                <AccordionItem key={dayKey} value={dayKey}>
                  <AccordionTrigger>{getDayLabel(dayKey)}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {currentAvailability[dayKey]!.map(slot => (
                        <div key={slot.time} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                          <span className="font-mono text-sm">{slot.time}</span>
                          <span className="text-xs text-muted-foreground">({slot.limit} spots)</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => onRemoveTimeSlot(dayKey, slot.time)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">You have not set any available times yet.</p>
            )}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
