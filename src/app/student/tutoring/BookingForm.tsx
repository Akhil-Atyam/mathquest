"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { student, teachers, topics } from "@/lib/data"
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

const formSchema = z.object({
  studentName: z.string().min(2, "Name is too short."),
  grade: z.string().transform(Number),
  topic: z.string().min(1, "Please select a topic."),
  time: z.string().min(1, "Please select a time."),
  parentEmail: z.string().email("Please enter a valid email."),
})

export function BookingForm({ selectedDay, availableTimes }: { selectedDay: Date | undefined, availableTimes: string[] }) {
  const { toast } = useToast()
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: student.name,
      grade: student.grade,
      topic: "",
      time: "",
      parentEmail: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "Booking Confirmed!",
      description: `Your tutoring session for ${values.topic} is booked for ${selectedDay?.toDateString()} at ${values.time}. A confirmation has been sent to ${values.parentEmail}.`,
      className: "bg-green-100 dark:bg-green-900 border-green-500",
      duration: 5000,
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
              <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
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
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={availableTimes.length === 0}>
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
        <FormField
          control={form.control}
          name="parentEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent's Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="parent@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={!selectedDay || availableTimes.length === 0}>
            <CalendarCheck className="mr-2 h-4 w-4"/>
            Book Session
        </Button>
      </form>
    </Form>
  )
}
