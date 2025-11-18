'use client';

import type { Lesson } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import React from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * A reusable component that displays a single learning lesson in a card format.
 * It shows the lesson's title, topic, and provides a "Start" button to view its content.
 *
 * @param {object} props - The component props.
 * @param {Lesson} props.lesson - The lesson object to display.
 * @param {(lesson: Lesson) => void} props.onSelect - Callback function when lesson is selected.
 */
function LessonCard({ lesson, onSelect }: { lesson: Lesson; onSelect: (lesson: Lesson) => void; }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="w-6 h-6 text-primary" />
          {lesson.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Topic: {lesson.topic}</p>
        <Button 
            onClick={() => onSelect(lesson)} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          Start Lesson
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * A component to display the detailed content of a single lesson.
 *
 * @param {object} props - The component props.
 * @param {Lesson} props.lesson - The lesson to display.
 * @param {() => void} props.onBack - Callback function to go back to the lesson list.
 */
function LessonView({ lesson, onBack }: { lesson: Lesson; onBack: () => void; }) {
    return (
        <div className="space-y-6">
           <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
           </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-headline">
                 <BookOpen className="w-8 h-8 text-primary" />
                {lesson.title}
              </CardTitle>
              <p className="text-muted-foreground">
                Grade {lesson.grade} &middot; {lesson.topic}
              </p>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <p>{lesson.content}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
}


/**
 * The main page for browsing all available learning lessons.
 * It organizes lessons into tabs by grade level and then into accordions by topic.
 * It now handles displaying the lesson content on the same page.
 */
export default function ResourcesPage() {
  const firestore = useFirestore();
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(null);

  const lessonsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'lessons');
  }, [firestore]);

  const { data: lessons, isLoading } = useCollection<Lesson>(lessonsQuery);
  
  const grades = [1, 2, 3, 4, 5];

  if (isLoading) {
    return (
        <div className="p-4 sm:p-6 space-y-6">
            <h1 className="text-3xl font-bold font-headline">Resources</h1>
            <p className="text-muted-foreground">Explore lessons created by our teachers!</p>
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  if (selectedLesson) {
    return (
        <div className="p-4 sm:p-6">
            <LessonView lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />
        </div>
    )
  }
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Resources</h1>
      <p className="text-muted-foreground">Explore lessons created by our teachers!</p>

      <Tabs defaultValue="grade-1" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {grades.map(grade => (
            <TabsTrigger key={grade} value={`grade-${grade}`}>Grade {grade}</TabsTrigger>
          ))}
        </TabsList>
        
        {grades.map(grade => {
            const gradeLessons = lessons ? lessons.filter(l => l.grade === grade) : [];
            const gradeTopics = [...new Set(gradeLessons.map(l => l.topic))];

            return (
                <TabsContent key={grade} value={`grade-${grade}`}>
                    <Accordion type="multiple" className="w-full" defaultValue={gradeTopics}>
                        {gradeTopics.map(topic => {
                            const topicLessons = gradeLessons.filter(l => l.topic === topic);
                            return (
                                <AccordionItem key={topic} value={topic}>
                                    <AccordionTrigger className="text-lg font-semibold">{topic}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {topicLessons.map(lesson => (
                                            <LessonCard key={lesson.id} lesson={lesson} onSelect={setSelectedLesson} />
                                        ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                     {gradeTopics.length === 0 && <p className="text-muted-foreground text-center py-10">No lessons available for Grade {grade} yet.</p>}
                </TabsContent>
            )
        })}
      </Tabs>
    </div>
  );
}
