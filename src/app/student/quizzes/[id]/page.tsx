'use client';

import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Quiz } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A dynamic page component that displays a single quiz.
 * The quiz to display is determined by the `id` parameter in the URL.
 *
 * @param {object} props - The component props provided by Next.js.
 * @param {object} props.params - An object containing the dynamic route parameters.
 * @param {string} props.params.id - The ID of the quiz to display.
 */
export default function QuizPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const firestore = useFirestore();

  const quizDocRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, 'quizzes', id);
  }, [firestore, id]);

  const { data: quiz, isLoading } = useDoc<Quiz>(quizDocRef);

  if (isLoading) {
      return (
          <div className="p-4 sm:p-6 space-y-6">
              <Skeleton className="h-9 w-48" />
              <Card>
                  <CardHeader><Skeleton className="h-8 w-1/2" /><Skeleton className="h-4 w-1/3 mt-2" /></CardHeader>
                  <CardContent><Skeleton className="h-64 w-full" /></CardContent>
              </Card>
          </div>
      )
  }

  // If no quiz is found with the given ID, render the 404 Not Found page.
  if (!quiz) {
    notFound();
  }

  // Render the details of the found quiz.
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
             <CheckSquare className="w-8 h-8 text-primary" />
            {quiz.title}
          </CardTitle>
          <CardDescription>
            Grade {quiz.grade} &middot; {quiz.topic}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form className="space-y-8">
                {quiz.questions.map((question, index) => (
                    <div key={index}>
                        <p className="font-medium mb-4">{index + 1}. {question.questionText}</p>
                        <RadioGroup>
                            {question.options.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${index}-${option}`} />
                                    <Label htmlFor={`${index}-${option}`}>{option}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                ))}
                <Button className='mt-6'>Submit Quiz</Button>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}
