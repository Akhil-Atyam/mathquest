'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Lesson } from '@/lib/types';
import { topics } from '@/lib/data';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';

// Zod schema for lesson form validation
const lessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  grade: z.string().refine(val => !isNaN(parseInt(val)), { message: "Please select a grade." }),
  topic: z.string().min(1, 'Please select a topic.'),
  type: z.enum(['Text', 'Video']),
  content: z.string().min(10, 'Content must be at least 10 characters.'),
  order: z.coerce.number().optional(),
});

// Component for the lesson form, used for both creating and editing
function LessonForm({
  lesson,
  onSave,
  onClose,
}: {
  lesson?: Lesson;
  onSave: (data: z.infer<typeof lessonSchema>) => void;
  onClose: () => void;
}) {
  const form = useForm<z.infer<typeof lessonSchema>>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: lesson?.title || '',
      grade: String(lesson?.grade || ''),
      topic: lesson?.topic || '',
      type: lesson?.type === 'Quiz' ? 'Text' : (lesson?.type || 'Text'),
      content: lesson?.content || '',
      order: lesson?.order || 0,
    },
  });

  const handleSubmit = (data: z.infer<typeof lessonSchema>) => {
    onSave(data);
  };
  
  const lessonType = form.watch('type');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="e.g., Introduction to Fractions" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
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
                <FormLabel>Topic</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
         <div className="grid grid-cols-2 gap-4">
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Lesson Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                    </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
                )}
            />
             <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Order</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 1" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{lessonType === 'Video' ? 'Video URL' : 'Content (Markdown Enabled)'}</FormLabel>
              <FormControl>
                {lessonType === 'Text' ? (
                    <Textarea placeholder="Write your lesson. You can use Markdown for formatting, like `![alt text](image_url)` to add an image." {...field} rows={8} />
                ) : (
                    <Input placeholder="https://www.youtube.com/watch?v=..." {...field} />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save Lesson</Button>
        </div>
      </form>
    </Form>
  );
}

// Main component to manage lessons
export function LessonManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | undefined>(undefined);

  const lessonsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'lessons'), where('teacherId', '==', user.uid));
  }, [user, firestore]);

  const { data: lessons, isLoading } = useCollection<Lesson>(lessonsQuery);
  
  const handleOpenForm = (lesson?: Lesson) => {
    setEditingLesson(lesson);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setEditingLesson(undefined);
    setIsFormOpen(false);
  };

  const handleSaveLesson = async (data: z.infer<typeof lessonSchema>) => {
    if (!user || !firestore) return;
    
    const lessonData = {
      ...data,
      grade: parseInt(data.grade, 10), // Ensure grade is a number
      teacherId: user.uid,
    };

    try {
      if (editingLesson) {
        // Update existing lesson
        const lessonRef = doc(firestore, 'lessons', editingLesson.id);
        await updateDoc(lessonRef, lessonData);
        toast({ title: 'Success', description: 'Lesson updated successfully.' });
      } else {
        // Create new lesson
        await addDoc(collection(firestore, 'lessons'), lessonData);
        toast({ title: 'Success', description: 'Lesson created successfully.' });
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving lesson:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save the lesson.' });
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'lessons', lessonId));
      toast({ title: 'Success', description: 'Lesson deleted successfully.' });
    } catch (error) {
      console.error('Error deleting lesson:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the lesson.' });
    }
  };

  if (isLoading) {
    return <Card><CardHeader><CardTitle>Manage Lessons</CardTitle></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Lessons</CardTitle>
          <CardDescription>Add, edit, or delete your learning materials.</CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
          if (!open) handleCloseForm();
          else setIsFormOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Lesson
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add New Lesson'}</DialogTitle>
            </DialogHeader>
            <LessonForm lesson={editingLesson} onSave={handleSaveLesson} onClose={handleCloseForm} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lessons && lessons.length > 0 ? (
            lessons.map(lesson => (
              <Card key={lesson.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{lesson.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Grade {lesson.grade} &middot; {lesson.topic} &middot; Order: {lesson.order ?? 'N/A'} &middot; <span className="capitalize">{lesson.type}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleOpenForm(lesson)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the lesson.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteLesson(lesson.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">You haven't created any lessons yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
