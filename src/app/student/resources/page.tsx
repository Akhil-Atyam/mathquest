'use client';

import type { Lesson, Student, Quiz } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { BookOpen, ArrowLeft, CheckCircle2, RotateCcw, Star, Lock, FileQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * A reusable component that displays a single learning lesson in a card format.
 *
 * @param {object} props - The component props.
 * @param {Lesson} props.lesson - The lesson object to display.
 * @param {Quiz | undefined} props.linkedQuiz - The quiz object linked to this lesson, if any.
 * @param {(lesson: Lesson) => void} props.onSelect - Callback function when lesson is selected.
 * @param {boolean} props.isCompleted - Flag to indicate if the lesson is completed.
 * @param {boolean} props.isAssigned - Flag to indicate if the lesson is assigned.
 */
function LessonCard({ lesson, linkedQuiz, onSelect, isCompleted, isAssigned }: { lesson: Lesson; linkedQuiz: Quiz | undefined; onSelect: (lesson: Lesson) => void; isCompleted: boolean; isAssigned: boolean; }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-start justify-between text-base">
          <div className="flex items-center gap-2">
            {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <BookOpen className="w-6 h-6 text-primary" />}
            <span>{lesson.title}</span>
          </div>
          {isAssigned && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">Topic: {lesson.topic}</p>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button 
            onClick={() => onSelect(lesson)} 
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isCompleted ? 'Review Lesson' : 'Start Lesson'}
        </Button>
        {linkedQuiz && (
            <Button asChild variant="outline" className="w-full">
                <Link href={`/student/quizzes/${linkedQuiz.id}`}>
                    <FileQuestion className="mr-2 h-4 w-4" />
                    Start Quiz
                </Link>
            </Button>
        )}
      </CardFooter>
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


const Grade2QuestPath = ({ 
    lessons, 
    quizzes,
    student, 
    onSelect,
}: { 
    lessons: Lesson[], 
    quizzes: Quiz[],
    student: Student | null, 
    onSelect: (lesson: Lesson) => void;
}) => {
    const completedLessonIds = new Set(student?.completedLessons || []);
    
    // Detailed lesson order for Grade 2 curriculum.
    const lessonOrder = [
      // Topic: Add and Subtract within 20
      'Add within 20 visually',
      'Exercise: add within 20',
      'Exercise: adding with arrays',
      'Array word problems',
      'Quiz 1: Addition',
      'Subtract within 20 visually',
      'Exercise: subtract within 20',
      'Exercise: add and subtract within 20',
      'Exercise: add and subtract within 20 word problems',
      'Quiz 2: Subtraction',
      // Topic: Place Value
      'Place value blocks',
      'Exercise: Place value',
    ];

    const sortedLessons = React.useMemo(() => {
        const allItems: (Lesson | Quiz)[] = [...(lessons || []), ...(quizzes || [])];
        const grade2Items = allItems.filter(l => l.grade === 2);
        
        // Find the corresponding quiz object for title matching
        const quiz1 = grade2Items.find(item => isQuiz(item) && item.title === 'Quiz 1: Addition');
        const quiz2 = grade2Items.find(item => isQuiz(item) && item.title === 'Quiz 2: Subtraction');
        
        const itemsWithIdInTitle = grade2Items.map(item => {
            if (isQuiz(item) && item.title === 'Quiz 1: Addition' && quiz1) {
                return { ...item, title: `Quiz 1: Addition::${quiz1.id}` };
            }
            if (isQuiz(item) && item.title === 'Quiz 2: Subtraction' && quiz2) {
                return { ...item, title: `Quiz 2: Subtraction::${quiz2.id}` };
            }
            return item;
        })

        const lessonOrderWithIds = lessonOrder.map(title => {
            if (title === 'Quiz 1: Addition' && quiz1) return `Quiz 1: Addition::${quiz1.id}`;
            if (title === 'Quiz 2: Subtraction' && quiz2) return `Quiz 2: Subtraction::${quiz2.id}`;
            return title;
        })

        return itemsWithIdInTitle
            .sort((a, b) => {
                const aTitle = isQuiz(a) ? a.title : a.title;
                const bTitle = isQuiz(b) ? b.title : b.title;

                const indexA = lessonOrderWithIds.indexOf(aTitle);
                const indexB = lessonOrderWithIds.indexOf(bTitle);

                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
    }, [lessons, quizzes]);


    if (sortedLessons.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No Grade 2 lessons found. Check back soon!</p>
    }

    const isQuiz = (item: any): item is Quiz => 'questions' in item;

    return (
        <div className="relative w-full overflow-x-auto p-4">
            <div className="relative flex flex-col items-center py-10" style={{ minHeight: `${sortedLessons.length * 10}rem`}}>
                {/* SVG Path connecting the nodes */}
                {sortedLessons.length > 1 && (
                     <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
                        <path
                            d={
                                sortedLessons.slice(1).map((_, index) => {
                                    const y1 = 80 + index * 160;
                                    const y2 = 80 + (index + 1) * 160;
                                    
                                    const x1 = window.innerWidth / 2 + (window.innerWidth / 5) * Math.sin(index * Math.PI / 3);
                                    const x2 = window.innerWidth / 2 + (window.innerWidth / 5) * Math.sin((index + 1) * Math.PI / 3);

                                    const controlX = (x1 + x2) / 2;
                                    const controlY = (y1 + y2) / 2;

                                    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
                                }).join(' ')
                            }
                            stroke="hsl(var(--primary) / 0.2)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                )}


                {sortedLessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isUnlocked = index === 0 || (sortedLessons[index-1] && completedLessonIds.has(sortedLessons[index-1].id));
                    
                    const y = 80 + index * 160;
                    const xOffset = (window.innerWidth / 5) * Math.sin(index * Math.PI / 3);

                    const title = isQuiz(lesson) ? lesson.title.split('::')[0] : lesson.title;

                    return (
                        <div
                            key={lesson.id}
                            className="absolute"
                            style={{
                                top: `${y - 48}px`,
                                left: `calc(50% + ${xOffset}px)`,
                                transform: 'translateX(-50%)',
                                transition: 'top 0.5s ease-out, left 0.5s ease-out'
                            }}
                        >
                            <QuestNode 
                                title={title}
                                subtitle={`Topic: ${lesson.topic}`}
                                icon={isQuiz(lesson) ? FileQuestion : BookOpen}
                                isCompleted={isCompleted}
                                isUnlocked={isUnlocked}
                                onClick={() => isQuiz(lesson) ? window.location.href=`/student/quizzes/${lesson.id}` : onSelect(lesson as Lesson)}
                            />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

const Grade3QuestPath = ({ 
    lessons,
    quizzes,
    student, 
    onSelect,
}: { 
    lessons: Lesson[], 
    quizzes: Quiz[],
    student: Student | null, 
    onSelect: (lesson: Lesson) => void;
}) => {
    const completedLessonIds = new Set(student?.completedLessons || []);
    
    const topicOrder = [
      "Understanding Multiplication",
      "Properties of Multiplication",
      "Relating Multiplication and Division",
      "Multiplication Facts and Strategies",
      "Two-Step Word Problems",
    ];

    const sortedLessons = React.useMemo(() => {
        const allItems: (Lesson | Quiz)[] = [...(lessons || []), ...(quizzes || [])];
        return allItems
            .filter(l => l.grade === 3)
            .sort((a, b) => {
                const indexA = topicOrder.indexOf(a.topic);
                const indexB = topicOrder.indexOf(b.topic);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
    }, [lessons, quizzes]);


    if (sortedLessons.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No Grade 3 lessons found. Check back soon!</p>
    }

    const isQuiz = (item: any): item is Quiz => 'questions' in item;

    return (
        <div className="relative w-full overflow-x-auto p-4">
            <div className="relative flex flex-col items-center py-10" style={{ minHeight: `${sortedLessons.length * 10}rem`}}>
                {sortedLessons.length > 1 && (
                     <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: -1 }}>
                        <path
                            d={
                                sortedLessons.slice(1).map((_, index) => {
                                    const y1 = 80 + index * 160;
                                    const y2 = 80 + (index + 1) * 160;
                                    
                                    const x1 = window.innerWidth / 2 + (window.innerWidth / 5) * Math.sin(index * Math.PI / 3);
                                    const x2 = window.innerWidth / 2 + (window.innerWidth / 5) * Math.sin((index + 1) * Math.PI / 3);

                                    const controlX = (x1 + x2) / 2;
                                    const controlY = (y1 + y2) / 2;

                                    return `M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`;
                                }).join(' ')
                            }
                            stroke="hsl(var(--primary) / 0.2)"
                            strokeWidth="8"
                            fill="none"
                            strokeLinecap="round"
                        />
                    </svg>
                )}

                {sortedLessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.has(lesson.id);
                    const isUnlocked = index === 0 || (sortedLessons[index-1] && completedLessonIds.has(sortedLessons[index-1].id));
                    
                    const y = 80 + index * 160;
                    const xOffset = (window.innerWidth / 5) * Math.sin(index * Math.PI / 3);

                    return (
                        <div
                            key={lesson.id}
                            className="absolute"
                            style={{
                                top: `${y - 48}px`,
                                left: `calc(50% + ${xOffset}px)`,
                                transform: 'translateX(-50%)',
                                transition: 'top 0.5s ease-out, left 0.5s ease-out'
                            }}
                        >
                            <QuestNode 
                                title={lesson.title}
                                subtitle={`Topic: ${lesson.topic}`}
                                icon={isQuiz(lesson) ? FileQuestion : BookOpen}
                                isCompleted={isCompleted}
                                isUnlocked={isUnlocked}
                                onClick={() => isQuiz(lesson) ? window.location.href=`/student/quizzes/${lesson.id}` : onSelect(lesson as Lesson)}
                            />
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

  const lessonsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'lessons') : null, [firestore]);
  const quizzesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'quizzes') : null, [firestore]);

  const { data: lessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
  const { data: quizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);
  
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
  
  const isLoading = isUserLoading || isStudentLoading || areLessonsLoading || areQuizzesLoading;

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
            if (grade === 2) {
                return (
                    <TabsContent key={grade} value={`grade-${grade}`}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade 2 Learning Path</CardTitle>
                                <CardDescription>Complete the lessons in order to unlock the next one!</CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Grade2QuestPath 
                                    lessons={lessons || []}
                                    quizzes={quizzes || []}
                                    student={student}
                                    onSelect={setSelectedLesson}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                )
            }
             if (grade === 3) {
                return (
                    <TabsContent key={grade} value={`grade-${grade}`}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Grade 3 Learning Path</CardTitle>
                                <CardDescription>Complete the lessons in order to unlock the next one!</CardDescription>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <Grade3QuestPath 
                                    lessons={lessons || []}
                                    quizzes={quizzes || []}
                                    student={student}
                                    onSelect={setSelectedLesson}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                )
            }
            
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
                                        {topicLessons.map(lesson => {
                                            const linkedQuiz = quizzes?.find(q => q.lessonId === lesson.id);
                                            return (
                                              <LessonCard 
                                                  key={lesson.id} 
                                                  lesson={lesson}
                                                  linkedQuiz={linkedQuiz}
                                                  onSelect={setSelectedLesson} 
                                                  isCompleted={student?.completedLessons?.includes(lesson.id) || false}
                                                  isAssigned={student?.assignedLessons?.includes(lesson.id) || false}
                                              />
                                            )
                                        })}
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
