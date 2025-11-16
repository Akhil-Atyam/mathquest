"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { student, topics } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { CalendarCheck } from "lucide-react"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { collection } from "firebase/firestore"
import type { Teacher } from "@/lib/types"

const formSchema = z.object({
  studentName: z.string().min(2, "Name is too short."),
  grade: z.string().min(1, "Please select a grade."),
  topic: z.string().min(1, "Please select a topic."),
  time: z.string().min(1, "Please select a time."),
})

export function BookingForm({ selectedDay, availableTimes, teacher }: { selectedDay: Date | undefined, availableTimes: string[], teacher: Teacher | undefined }) {
  const { toast } = useToast()
  const firestore = useFirestore();
  const { user } = useUser();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: student.name,
      grade: String(student.grade),
      topic: "",
      time: "",
    },
  })

  React.useEffect(() => {
    // Reset time if it's no longer available
    if(form.getValues("time") && !availableTimes.includes(form.getValues("time"))){
      form.resetField("time");
    }
  }, [availableTimes, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !teacher || !selectedDay) {
        toast({
            variant: 'destructive',
            title: "Booking Failed",
            description: "Missing required information (user, teacher, or date).",
        });
        return;
    }
    
    const [hours, minutes] = values.time.split(':').map(Number);
    const bookingDateTime = new Date(selectedDay);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const tutoringSessionsRef = collection(firestore, "tutoring_sessions");

    addDocumentNonBlocking(tutoringSessionsRef, {
        studentId: user.uid,
        studentName: values.studentName,
        teacherId: teacher.id,
        grade: parseInt(values.grade, 10),
        topic: values.topic,
        startTime: bookingDateTime,
        durationMinutes: 60, // Assuming 60 minute sessions
        status: 'Confirmed',
        meetingLink: '', // Teacher can add this later
    });
    
    toast({
      title: "Booking Confirmed!",
      description: `Your tutoring session for ${values.topic} has been booked.`,
    })
    form.reset();
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
                <Input placeholder="Your name" {...field} />
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(grade => <SelectItem key={grade} value={String(grade)}>Grade {grade}</SelectItem>)}
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
                  {topics.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
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
              <Select onValueChange={field.onChange} value={field.value} disabled={availableTimes.length === 0}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an available time" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableTimes.map(time => <SelectItem key={time} value={time}>{time}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={!selectedDay || !teacher || availableTimes.length === 0}>
            <CalendarCheck className="mr-2 h-4 w-4"/>
            Book Session
        </Button>
      </form>
    </Form>
  )
}
