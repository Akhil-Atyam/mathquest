'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Teacher } from '@/lib/types';

// Schema for a single time slot
const timeSlotSchema = z.object({
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
});

// Schema for the availability form
const availabilitySchema = z.object({
  day: z.string().min(1, "Please select a day."),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
});

// Main component to manage teacher availability
export function AvailabilityManager({ teacher }: { teacher: Teacher | null }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [currentAvailability, setCurrentAvailability] = useState<Record<string, string[]>>(teacher?.availability || {});

  // Update local state if the teacher prop changes
  useEffect(() => {
    setCurrentAvailability(teacher?.availability || {});
  }, [teacher]);

  const form = useForm<z.infer<typeof availabilitySchema>>({
    resolver: zodResolver(availabilitySchema),
    defaultValues: {
      day: '',
      time: '',
    },
  });

  // Handler for adding a new time slot
  async function onAddTimeSlot(values: z.infer<typeof availabilitySchema>) {
    if (!user || !firestore) return;

    const { day, time } = values;
    const updatedAvailability = { ...currentAvailability };
    
    if (!updatedAvailability[day]) {
      updatedAvailability[day] = [];
    }

    // Avoid adding duplicate times
    if (updatedAvailability[day].includes(time)) {
      form.setError('time', { type: 'manual', message: 'This time slot already exists.' });
      return;
    }

    updatedAvailability[day].push(time);
    updatedAvailability[day].sort(); // Keep times sorted

    try {
      const teacherRef = doc(firestore, 'teachers', user.uid);
      await updateDoc(teacherRef, { availability: updatedAvailability });
      setCurrentAvailability(updatedAvailability);
      toast({ title: 'Success', description: `Added ${time} to your availability.` });
      form.reset({ day: '', time: '' });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({ variant: "destructive", title: 'Error', description: 'Could not update your availability.' });
    }
  }

  // Handler for removing a time slot
  async function onRemoveTimeSlot(day: string, time: string) {
    if (!user || !firestore) return;

    const updatedAvailability = { ...currentAvailability };
    updatedAvailability[day] = updatedAvailability[day].filter(t => t !== time);

    if (updatedAvailability[day].length === 0) {
      delete updatedAvailability[day];
    }
    
    try {
      const teacherRef = doc(firestore, 'teachers', user.uid);
      await updateDoc(teacherRef, { availability: updatedAvailability });
      setCurrentAvailability(updatedAvailability);
      toast({ title: 'Success', description: `Removed ${time} from your availability.` });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast({ variant: "destructive", title: 'Error', description: 'Could not update your availability.' });
    }
  }

  const dayOffsets = [
    { label: 'Today', value: '0' },
    { label: 'Tomorrow', value: '1' },
    { label: 'In 2 days', value: '2' },
    { label: 'In 3 days', value: '3' },
    { label: 'In 4 days', value: '4' },
    { label: 'In 5 days', value: '5' },
    { label: 'In 6 days', value: '6' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Form to add new slots */}
      <Card>
        <CardHeader>
          <CardTitle>Add Available Time</CardTitle>
          <CardDescription>Add a new time slot to your schedule for students to book.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onAddTimeSlot)} className="space-y-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {dayOffsets.map(d => (
                          <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time (24-hour format)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
            {Object.keys(currentAvailability).length > 0 ? (
                dayOffsets.filter(d => currentAvailability[d.value]?.length > 0).map(d => (
                <AccordionItem key={d.value} value={d.value}>
                  <AccordionTrigger>{d.label}</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-wrap gap-2">
                      {currentAvailability[d.value].map(time => (
                        <div key={time} className="flex items-center gap-2 bg-muted p-2 rounded-md">
                          <span className="font-mono text-sm">{time}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => onRemoveTimeSlot(d.value, time)}
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
