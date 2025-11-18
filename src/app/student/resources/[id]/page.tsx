'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import type { Lesson } from '@/lib/types';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A dynamic page component that displays the content of a single lesson.
 * The lesson to display is determined by the `id` parameter in the URL.
 *
 * @param {object} props - The component props provided by Next.js.
 * @param {object} props.params - An object containing the dynamic route parameters.
 * @param {string} props.params.id - The ID of the lesson to display.
 */
export default function LessonPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();

  const lessonRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'lessons', id);
  }, [firestore, id]);

  const { data: lesson, isLoading } = useDoc<Lesson>(lessonRef);
  
  // Show a skeleton loader while the data is being fetched.
  if (isLoading) {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <Skeleton className="h-10 w-48" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
        </div>
    );
  }

  // If no lesson is found with the given ID after loading, render the 404 Not Found page.
  if (!lesson) {
    notFound();
  }

  // Render the details of the found lesson.
  return (
    <div className="p-4 sm:p-6 space-y-6">
       {/* A "Back" button to navigate the user back to the main resources page. */}
       <Button variant="ghost" asChild>
        <Link href="/student/resources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
        </Link>
       </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
             <BookOpen className="w-8 h-8 text-primary" />
            {lesson.title}
          </CardTitle>
          <CardDescription>
            Grade {lesson.grade} &middot; {lesson.topic}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* The `prose` classes from Tailwind Typography are used for nicely styled article content. */}
          <div className="prose dark:prose-invert max-w-none">
            <p>{lesson.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
