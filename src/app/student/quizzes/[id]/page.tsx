'use client';

import { quizzes } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckSquare } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

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
  // Find the specific quiz from the mock data array using the ID from the URL.
  const quiz = quizzes.find(q => q.id === id);

  // If no quiz is found with the given ID, render the 404 Not Found page.
  if (!quiz) {
    notFound();
  }

  // Placeholder for quiz questions. In a real app, this would come from your data.
  const questions = [
    { id: 'q1', text: 'What is 2 + 2?', options: ['3', '4', '5'] },
    { id: 'q2', text: 'What is 5 - 3?', options: ['1', '2', '3'] },
    { id: 'q3', text: 'What is 3 x 4?', options: ['10', '12', '14'] },
  ];

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
                {questions.map((question, index) => (
                    <div key={question.id}>
                        <p className="font-medium mb-4">{index + 1}. {question.text}</p>
                        <RadioGroup>
                            {question.options.map(option => (
                                <div key={option} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option} id={`${question.id}-${option}`} />
                                    <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
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
