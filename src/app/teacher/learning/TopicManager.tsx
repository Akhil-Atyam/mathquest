'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, deleteDoc } from 'firebase/firestore';
import type { Topic } from '@/lib/types';
import { Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Zod schema for topic form validation
const topicSchema = z.object({
  name: z.string().min(2, 'Topic name must be at least 2 characters.'),
});

// Main component to manage topics (units)
export function TopicManager() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const topicsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'topics') : null, [firestore]);
  const { data: topics, isLoading } = useCollection<Topic>(topicsQuery);
  
  const form = useForm<z.infer<typeof topicSchema>>({
    resolver: zodResolver(topicSchema),
    defaultValues: { name: '' },
  });

  const handleAddTopic = async (data: z.infer<typeof topicSchema>) => {
    if (!firestore) return;
    try {
      await addDoc(collection(firestore, 'topics'), { name: data.name });
      toast({ title: 'Success', description: 'Topic added successfully.' });
      form.reset();
    } catch (error) {
      console.error('Error adding topic:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not add the topic.' });
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'topics', topicId));
      toast({ title: 'Success', description: 'Topic deleted successfully.' });
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the topic.' });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Topics (Units)</CardTitle>
        <CardDescription>Add or remove curriculum topics.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddTopic)} className="flex items-start gap-2 mb-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl><Input placeholder="e.g., Algebra Basics" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Topic</Button>
          </form>
        </Form>
        <div className="space-y-2">
            {isLoading ? (
                <div className="space-y-2"><Skeleton className="h-8 w-full" /><Skeleton className="h-8 w-full" /></div>
            ) : topics && topics.length > 0 ? (
                topics.map(topic => (
                    <div key={topic.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                        <span className="text-sm font-medium">{topic.name}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteTopic(topic.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    </div>
                ))
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No topics created yet.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
