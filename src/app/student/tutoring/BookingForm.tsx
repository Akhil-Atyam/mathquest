'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { topics } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarCheck } from 'lucide-react';
import React from 'react';
import type { Student, Teacher } from '@/lib/types';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc } from 'firebase/firestore';

// Zod schema to define the shape and validation rules for the booking form.
const formSchema = z.object({
  studentName: z.string().min(2, 'Name is too short.'),
  grade: z.string().min(1, 'Please select a grade.'),
  topic: z.string().min(1, 'Please select a topic.'),
  time: z.string().min(1, 'Please select a time.'),
});

/**
 * A form component for booking a tutoring session.
 * It handles form state, validation, and submission.
 *
 * @param {object} props - The component props.
 * @param {Date | undefined} props.selectedDay - The date selected by the user in the calendar.
 * @param {string[]} props.availableTimes - An array of available time slots for the selected day.
 * @param {Teacher | undefined} props.teacher - The currently selected teacher.
 * @param {boolean} props.isLoadingTimes - Flag indicating if available times are being loaded.
 */
export function BookingForm({
  selectedDay,
  availableTimes,
  teacher,
  isLoadingTimes,
}: {
  selectedDay: Date | undefined;
  availableTimes: string[];
  teacher: Teacher | undefined;
  isLoadingTimes: boolean;
}) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: student } = useDoc<Student>(studentDocRef);

  // Initialize react-hook-form with the schema and default values.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: '',
      grade: '',
      topic: '',
      time: '',
    },
  });

  // Effect to populate form with student data once loaded.
  React.useEffect(() => {
    if (student) {
      form.reset({
        studentName: student.name,
        grade: String(student.grade),
        topic: '',
        time: '',
      });
    }
  }, [student, form]);

  // This effect runs when the list of available times changes.
  // It checks if the currently selected time in the form is still valid.
  // If not (e.g., user changed the date), it resets the time field.
  React.useEffect(() => {
    if (
      form.getValues('time') &&
      !availableTimes.includes(form.getValues('time'))
    ) {
      form.resetField('time');
    }
  }, [availableTimes, form]);

  /**
   * Handles form submission.
   * On success, it shows a confirmation toast and logs the data.
   * In a real app, this would make an API call to save the booking.
   * @param {object} values - The validated form values.
   */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !teacher || !selectedDay || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Missing user, teacher, or date information.',
      });
      return;
    }

    const [hour, minute] = values.time.split(':').map(Number);
    const startTime = new Date(selectedDay);
    startTime.setHours(hour, minute);

    try {
      const bookingsCollection = collection(firestore, 'tutoring_sessions');
      await addDoc(bookingsCollection, {
        studentId: user.uid,
        studentName: values.studentName,
        grade: Number(values.grade),
        teacherId: teacher.id,
        teacherName: teacher.name, // Denormalize teacher name
        topic: values.topic,
        startTime: startTime,
        status: 'Confirmed',
        meetingLink: '',
        attended: false,
      });

      toast({
        title: 'Booking Confirmed!',
        description: `Your tutoring session for ${values.topic} has been booked.`,
      });
      // Reset the form fields after successful submission.
      form.reset();
    } catch (error) {
       console.error("Error booking session:", error);
       toast({
        variant: 'destructive',
        title: 'Booking Error',
        description: 'Could not save your booking. Please try again.',
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="studentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} readOnly />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((grade) => (
                    <SelectItem key={grade} value={String(grade)}>
                      Grade {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="topic"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Topic for Discussion</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
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
              <FormLabel>Preferred Time</FormLabel>
              {/* The time selection dropdown is disabled if there are no available times. */}
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingTimes || availableTimes.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isLoadingTimes
                          ? 'Loading times...'
                          : 'Select an available time'
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={
            !selectedDay || !teacher || availableTimes.length === 0 || !student
          }
        >
          <CalendarCheck className="mr-2 h-4 w-4" />
          Book Session
        </Button>
      </form>
    </Form>
  );
}
