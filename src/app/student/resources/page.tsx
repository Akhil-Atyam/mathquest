'use client';

import type { Lesson, Student } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { BookOpen, ArrowLeft, CheckCircle2, RotateCcw, Star, Plus, Minus, GitCommitHorizontal, Lock, PiggyBank, Clock, BarChart, Shapes } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';

/**
 * A reusable component that displays a single learning lesson in a card format.
 *
 * @param {object} props - The component props.
 * @param {Lesson} props.lesson - The lesson object to display.
 * @param {(lesson: Lesson) => void} props.onSelect - Callback function when lesson is selected.
 * @param {boolean} props.isCompleted - Flag to indicate if the lesson is completed.
 * @param {boolean} props.isAssigned - Flag to indicate if the lesson is assigned.
 */
function LessonCard({ lesson, onSelect, isCompleted, isAssigned }: { lesson: Lesson; onSelect: (lesson: Lesson) => void; isCompleted: boolean; isAssigned: boolean; }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-start justify-between text-base">
          <div className="flex items-center gap-2">
            {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <BookOpen className="w-6 h-6 text-primary" />}
            <span>{lesson.title}</span>
          </div>
          {isAssigned && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">Topic: {lesson.topic}</p>
        <Button 
            onClick={() => onSelect(lesson)} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isCompleted ? 'Review Lesson' : 'Start Lesson'}
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
 * @param {(lessonId: string) => void} props.onComplete - Callback to mark the lesson as complete.
 * @param {(lessonId: string) => void} props.onUncomplete - Callback to mark the lesson as incomplete.
 * @param {boolean} props.isCompleted - Whether the lesson has already been completed.
 */
function LessonView({ lesson, onBack, onComplete, onUncomplete, isCompleted }: { lesson: Lesson; onBack: () => void; onComplete: (lessonId: string) => void; onUncomplete: (lessonId: string) => void; isCompleted: boolean }) {
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
            <CardFooter className="flex justify-end gap-2">
                 {isCompleted ? (
                    <Button variant="outline" onClick={() => onUncomplete(lesson.id)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Redo Lesson
                    </Button>
                 ) : (
                    <Button onClick={() => onComplete(lesson.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Finish this lesson!
                    </Button>
                 )}
            </CardFooter>
          </Card>
        </div>
      );
}

const QuestNode = ({
  title,
  subtitle,
  icon,
  isUnlocked,
  isCompleted,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isUnlocked: boolean;
  isCompleted: boolean;
  onClick: () => void;
}) => {
  const Icon = icon;
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            disabled={!isUnlocked}
            className={cn(
              "relative flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-lg transition-all duration-300 transform hover:scale-110",
              isUnlocked ? "cursor-pointer" : "cursor-not-allowed",
              isCompleted ? "border-green-500 bg-green-100" : "border-primary bg-primary/10",
              !isUnlocked && "border-muted bg-muted/50"
            )}
          >
            <Icon className={cn("h-10 w-10", isUnlocked ? "text-primary" : "text-muted-foreground", isCompleted && "text-green-600")} />
            {!isUnlocked && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <Lock className="h-8 w-8 text-white" />
              </div>
            )}
            {isCompleted && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-bold">{title}</p>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


const TopicQuestPath = ({ 
    lessons, 
    student, 
    onSelect,
    topicName,
}: { 
    lessons: Lesson[], 
    student: Student | null, 
    onSelect: (lesson: Lesson) => void; 
    topicName: string;
}) => {
    const completedLessonIds = new Set(student?.completedLessons || []);
    const topicLessons = lessons.filter(l => l.topic === topicName && l.grade === 2);

    if (topicLessons.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No lessons for this topic yet. Check back soon!</p>
    }
    
    // In a real app, the order of lessons would likely be defined in the database.
    // For now, we'll just use the order they come in from Firestore.
    const sortedLessons = topicLessons;

    return (
        <div className="py-10">
            <div className="relative flex flex-col items-center gap-16">
                {/* Decorative path line */}
                <div className="absolute top-12 left-1/2 -z-10 h-[calc(100%-6rem)] w-2 max-w-sm rounded-full bg-primary/10"></div>
                
                {sortedLessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    // The first lesson is unlocked. Subsequent lessons are unlocked if the previous one is completed.
                    const isUnlocked = index === 0 || (sortedLessons[index-1] && completedLessonIds.has(sortedLessons[index-1].id));

                    return (
                        <div key={lesson.id} className={cn("relative w-full flex", index % 2 === 0 ? 'justify-start' : 'justify-end')}>
                             <div className={cn("w-1/2", index % 2 === 1 && "order-2")}></div>
                             <div className={cn("w-1/2 flex", index % 2 === 0 ? 'justify-start' : 'justify-end')}>
                                <QuestNode 
                                    title={lesson.title}
                                    subtitle={`Grade ${lesson.grade}`}
                                    icon={BookOpen}
                                    isCompleted={isCompleted}
                                    isUnlocked={isUnlocked}
                                    onClick={() => onSelect(lesson)}
                                />
                             </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/**
 * A wrapper component to handle suspense for search params.
 */
function ResourcesPageContent() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const searchParams = useSearchParams();
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(null);

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  const lessonsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'lessons');
  }, [firestore]);

  const { data: lessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
  
  // Effect to automatically select a lesson if an ID is in the URL params.
  useEffect(() => {
    if (lessons && lessons.length > 0) {
      const lessonId = searchParams.get('lesson');
      if (lessonId) {
        const lessonFromParam = lessons.find(l => l.id === lessonId);
        if (lessonFromParam) {
          setSelectedLesson(lessonFromParam);
        }
      }
    }
  }, [lessons, searchParams]);
  
  const grades = [1, 2, 3, 4, 5];
  
  const isLoading = isUserLoading || isStudentLoading || areLessonsLoading;

  const handleCompleteLesson = (lessonId: string) => {
    if (!studentDocRef) return;
    updateDoc(studentDocRef, {
        completedLessons: arrayUnion(lessonId)
    }).then(() => {
        // Go back to the list after marking as complete
        setSelectedLesson(null);
    });
  }

  const handleUncompleteLesson = (lessonId: string) => {
    if (!studentDocRef) return;
    updateDoc(studentDocRef, {
        completedLessons: arrayRemove(lessonId)
    });
    // No need to navigate away, user can now re-complete it from the same view.
  }

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
            <LessonView 
                lesson={selectedLesson} 
                onBack={() => setSelectedLesson(null)}
                onComplete={handleCompleteLesson}
                onUncomplete={handleUncompleteLesson}
                isCompleted={student?.completedLessons?.includes(selectedLesson.id) || false}
             />
        </div>
    )
  }
  
  // Define the topics for Grade 2 in order
  const grade2Topics = [
      "Addition", "Subtraction", "Place Value", "Comparing Numbers", 
      "Money & Time", "Measurement", "Data & Graphs", "Geometry"
  ];
  
  const defaultGradeTab = student?.grade ? `grade-${student.grade}` : 'grade-1';
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Resources</h1>
      <p className="text-muted-foreground">Explore lessons created by our teachers! Assigned lessons are marked with a <Star className="inline w-4 h-4 text-yellow-400 fill-yellow-400" />.</p>

      <Tabs defaultValue={defaultGradeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {grades.map(grade => (
            <TabsTrigger key={grade} value={`grade-${grade}`}>Grade {grade}</TabsTrigger>
          ))}
        </TabsList>
        
        {grades.map(grade => {
            // Special layout for Grade 2
            if (grade === 2) {
                return (
                    <TabsContent key={grade} value={`grade-2`}>
                        <Accordion type="multiple" className="w-full" defaultValue={['Addition']}>
                            {grade2Topics.map(topic => {
                                // Filter lessons once for the current topic
                                const topicLessons = lessons ? lessons.filter(l => l.grade === grade && l.topic === topic) : [];
                                return (
                                    <AccordionItem key={topic} value={topic}>
                                        <AccordionTrigger className="text-lg font-semibold">{topic}</AccordionTrigger>
                                        <AccordionContent>
                                            <TopicQuestPath 
                                                lessons={topicLessons} 
                                                student={student} 
                                                onSelect={setSelectedLesson}
                                                topicName={topic}
                                            />
                                        </AccordionContent>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                         {grade2Topics.length === 0 && <p className="text-muted-foreground text-center py-10">No topics available for Grade {grade} yet.</p>}
                    </TabsContent>
                )
            }
            
            // Default layout for other grades
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
                                            <LessonCard 
                                                key={lesson.id} 
                                                lesson={lesson} 
                                                onSelect={setSelectedLesson} 
                                                isCompleted={student?.completedLessons?.includes(lesson.id) || false}
                                                isAssigned={student?.assignedLessons?.includes(lesson.id) || false}
                                            />
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

/**
 * The main page for browsing all available learning lessons.
 * It organizes lessons into tabs by grade level and then into accordions by topic.
 * It now handles displaying the lesson content on the same page.
 */
export default function ResourcesPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ResourcesPageContent />
        </React.Suspense>
    );
}
