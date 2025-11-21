
'use client';

import type { Lesson, Student, Quiz, QuizQuestion } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useRef } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, deleteField, writeBatch } from 'firebase/firestore';
import { BookOpen, ArrowLeft, CheckCircle2, RotateCcw, Star, Lock, CheckSquare, FileQuestion } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { RadioGroup } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { badges as allBadges } from '@/lib/data';
import { Progress } from '@/components/ui/progress';
import ReactMarkdown from 'react-markdown';
import { QuestPathDecorations } from './QuestPathDecorations';
import { Separator } from '@/components/ui/separator';

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
function LessonCard({ lesson, linkedQuiz, onSelect, onSelectQuiz, isCompleted, isAssigned }: { lesson: Lesson; linkedQuiz: Quiz | undefined; onSelect: (lesson: Lesson) => void; onSelectQuiz: (quiz: Quiz) => void; isCompleted: boolean; isAssigned: boolean; }) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-start justify-between text-base">
          <div className="flex items-center gap-2">
            {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <BookOpen className="w-6 h-6 text-primary" />}
            <span>{lesson.title}</span>
          </div>
          {isAssigned && !isCompleted && <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />}
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
            <Button onClick={() => onSelectQuiz(linkedQuiz)} variant="outline" className="w-full">
                <CheckSquare className="mr-2 h-4 w-4" />
                {linkedQuiz.isPlacementTest ? 'Placement Test' : 'Start Quiz'}
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
function LessonView({ lesson, onBack, onComplete, onUncomplete, isCompleted }: { lesson: Lesson; onBack: () => void; onComplete: (lessonId: string) => void; onUncomplete: (lessonId: string) => void; isCompleted: boolean}) {
  const isVideoLesson = lesson.type === 'Video' && lesson.content.includes('youtube.com');
  let videoId = '';
  if (isVideoLesson) {
    const url = new URL(lesson.content);
    if (url.hostname === 'youtu.be') {
      videoId = url.pathname.slice(1);
    } else {
      videoId = url.searchParams.get('v') || '';
    }
  }
  
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
          {isVideoLesson && videoId ? (
            <div className="aspect-video">
              <iframe
                className="w-full h-full rounded-md"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={lesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{lesson.content}</ReactMarkdown>
            </div>
          )}
        </CardContent>
        {lesson.citation && (
            <>
                <Separator className="my-4" />
                <CardFooter className="flex-col items-start text-xs">
                    <p className="font-semibold text-muted-foreground">Sources</p>
                    <p className="text-muted-foreground/80">{lesson.citation}</p>
                </CardFooter>
            </>
        )}
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

function QuizView({
  quiz,
  student,
  onBack,
  onQuizComplete,
  onRetryQuiz,
}: {
  quiz: Quiz;
  student: Student | null;
  onBack: () => void;
  onQuizComplete: (quizId: string, score: number) => void;
  onRetryQuiz: (quizId: string) => void;
}) {
  const form = useForm();
  const [view, setView] = useState<'quiz' | 'result'>('quiz');
  const [score, setScore] = useState(student?.quizScores?.[quiz.id] ?? null);

  useEffect(() => {
    // If there's already a score for this quiz, show the result screen first.
    if (student?.quizScores?.[quiz.id] !== undefined) {
      setScore(student.quizScores[quiz.id]);
      setView('result');
    } else {
      setView('quiz');
      setScore(null);
    }
  }, [quiz.id, student?.quizScores]);

  const onSubmit = (data: any) => {
    let correctAnswers = 0;
    quiz.questions.forEach((q, index) => {
      if (data[`question-${index}`] === q.correctAnswer) {
        correctAnswers++;
      }
    });
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    setView('result');
    onQuizComplete(quiz.id, finalScore);
  };
  
  const earnedBadges = view === 'result' ? allBadges.filter(b => b.id.includes(quiz.topic.toLowerCase())) : [];

  const handleRetry = () => {
    onRetryQuiz(quiz.id);
    // Reset internal state to show the quiz questions again
    setView('quiz');
    setScore(null);
    form.reset();
  };


  if (view === 'result' && score !== null) {
    return (
        <div className="space-y-6">
             <Button variant="ghost" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
            </Button>
            <Card className="text-center">
                <CardHeader>
                    <CardTitle className="text-4xl font-bold">Quiz Complete!</CardTitle>
                    <CardDescription>Your score:</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <p className="text-7xl font-bold text-primary">{score}%</p>
                     <Progress value={score} className="w-1/2 mx-auto" />
                     {earnedBadges.length > 0 && score >= 80 && (
                        <div className="pt-4">
                            <p className="font-semibold">You earned a new badge!</p>
                            <div className="flex justify-center flex-wrap gap-2 mt-2">
                               {earnedBadges.map(badge => (
                                 <Badge key={badge.id} variant="secondary" className="text-lg py-2 px-4">
                                     <badge.icon className="w-5 h-5 mr-2 text-accent"/>
                                     {badge.name}
                                 </Badge>
                               ))}
                            </div>
                        </div>
                     )}
                </CardContent>
                <CardFooter className="flex justify-center gap-2">
                    <Button onClick={onBack}>Continue Learning</Button>
                     <Button variant="outline" onClick={handleRetry}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retry Quiz
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Resources
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <CheckSquare className="w-8 h-8 text-primary" />
            {quiz.title}
          </CardTitle>
          <CardDescription>
            Grade {quiz.grade} &middot; {quiz.topic}
            {quiz.isPlacementTest && <span className="text-xs font-semibold text-accent border border-accent/50 bg-accent/10 px-2 py-1 rounded-full ml-2">Placement Test</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {quiz.questions.map((question, index) => (
              <div key={index}>
                <div className="font-medium mb-4 flex items-start gap-2">
                  <span>{index + 1}.</span>
                  <div className="prose dark:prose-invert max-w-none -mt-1">
                    <ReactMarkdown>{question.questionText}</ReactMarkdown>
                  </div>
                </div>
                <RadioGroup name={`question-${index}`} onChange={(e) => form.setValue(`question-${index}`, (e.target as HTMLInputElement).value)}>
                  {question.options.map(option => (
                    <div key={option} className="flex items-center space-x-2">
                       <input
                        type="radio"
                        id={`${index}-${option}`}
                        value={option}
                        {...form.register(`question-${index}`)}
                        className="peer hidden"
                      />
                       <Label
                        htmlFor={`${index}-${option}`}
                        className="flex items-center gap-2 cursor-pointer rounded-md p-2 border border-transparent peer-checked:border-primary peer-checked:bg-primary/10"
                      >
                        {/* Custom radio button appearance */}
                        <span className="w-4 h-4 rounded-full border border-primary flex items-center justify-center">
                            <span className="w-2 h-2 rounded-full bg-transparent peer-checked:bg-primary"></span>
                        </span>
                         {option}
                       </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            <Button type="submit" className='mt-6'>Submit Quiz</Button>
          </form>
        </CardContent>
        {quiz.citation && (
            <>
                <Separator className="my-4" />
                <CardFooter className="flex-col items-start text-xs">
                    <p className="font-semibold text-muted-foreground">Sources</p>
                    <p className="text-muted-foreground/80">{quiz.citation}</p>
                </CardFooter>
            </>
        )}
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
  isAssigned,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  isUnlocked: boolean;
  isCompleted: boolean;
  isAssigned: boolean;
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
              isCompleted ? "border-green-500 bg-green-100" : "border-primary",
              !isUnlocked && "border-muted bg-muted/50",
              isUnlocked && !isCompleted && "bg-card"
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
            {isAssigned && !isCompleted && isUnlocked && (
                <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400">
                    <Star className="h-5 w-5 text-white" />
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

// Helper function to create a smooth bezier curve through points
function getCurvePath(points: { x: number; y: number }[], tension = 0.4) {
    if (points.length < 2) return '';
    
    let d = `M ${points[0].x} ${points[0].y}`;
    
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[0];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension * 2;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension * 2;
        
        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension * 2;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension * 2;
        
        d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    
    return d;
}

const Grade2QuestPath = ({ 
    lessons, 
    quizzes,
    student, 
    onSelectLesson,
    onSelectQuiz,
}: { 
    lessons: Lesson[], 
    quizzes: Quiz[],
    student: Student | null, 
    onSelectLesson: (lesson: Lesson) => void;
    onSelectQuiz: (quiz: Quiz) => void;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pathData, setPathData] = useState<{ progress: string, remaining: string }>({ progress: '', remaining: '' });
    const [nodePositions, setNodePositions] = useState<{x: number, y: number}[]>([]);
    const [placementTestNodeY, setPlacementTestNodeY] = useState<number | null>(null);

    const isQuiz = (item: any): item is Quiz => 'questions' in item;
    const completedLessonIds = new Set(student?.completedLessons || []);
    const completedQuizIds = new Set(Object.keys(student?.quizScores || {}));
    const assignedIds = new Set([...(student?.assignedLessons || []), ...(student?.assignedQuizzes || [])]);
    const unlockedLessonIds = new Set(student?.unlockedLessons || []);
    const unlockedQuizIds = new Set(student?.unlockedQuizzes || []);

    const sortedItems = React.useMemo(() => {
        const allItems: (Lesson | Quiz)[] = [...(lessons || []), ...(quizzes || [])];
        const grade2Items = allItems.filter(l => l.grade === 2);
        return grade2Items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [lessons, quizzes]);
    
     useEffect(() => {
        const calculatePath = (containerWidth: number) => {
            if (sortedItems.length < 1 || !containerWidth) return;

            const centerX = containerWidth / 2;
            const amplitude = Math.min(containerWidth * 0.2, 150); // Cap amplitude
            const yStep = 160;
            const initialY = 80;

            const points = sortedItems.map((item, index) => {
                const y = initialY + index * yStep;
                const x = centerX + amplitude * Math.sin(index * Math.PI / 3);
                if (isQuiz(item) && item.isPlacementTest) {
                    setPlacementTestNodeY(y);
                }
                return { x, y };
            });
            setNodePositions(points);

            let lastCompletedIndex = -1;
            for (let i = 0; i < sortedItems.length; i++) {
                const item = sortedItems[i];
                const isItemCompleted = isQuiz(item) ? completedQuizIds.has(item.id) : completedLessonIds.has(item.id);
                if (isItemCompleted) {
                    lastCompletedIndex = i;
                } else {
                    break;
                }
            }
            
            const progressPoints = points.slice(0, lastCompletedIndex + 1);
            const remainingPoints = lastCompletedIndex === -1 ? points : points.slice(lastCompletedIndex);


            setPathData({
                progress: progressPoints.length > 1 ? getCurvePath(progressPoints) : '',
                remaining: remainingPoints.length > 1 ? getCurvePath(remainingPoints) : '',
            });
        };

        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentRect.width > 0) {
                  calculatePath(entry.contentRect.width);
                }
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };
    }, [sortedItems, completedLessonIds, completedQuizIds]);


    if (sortedItems.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No Grade 2 lessons found. Check back soon!</p>
    }

    return (
        <div id="tutorial-topic-list" className="relative w-full overflow-x-auto p-4">
            <div ref={containerRef} className="relative" style={{ minHeight: `${sortedItems.length * 10 + 5}rem`}}>
                <QuestPathDecorations />
                <svg className="absolute top-0 left-0 w-full h-full z-0" overflow="visible">
                     {/* Draw the remaining path first (bottom layer) */}
                    {pathData.remaining && (
                        <path
                            d={pathData.remaining}
                            stroke="hsl(var(--primary))"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                        />
                    )}
                    {/* Draw the progress path on top */}
                    {pathData.progress && (
                         <path
                            d={pathData.progress}
                            stroke="hsl(142 71% 45%)" // Green color
                            strokeWidth="10" // Make it slightly thicker to cover the underlying path
                            fill="none"
                            strokeLinecap="round"
                        />
                    )}
                    {placementTestNodeY && (
                        <line 
                            x1="0" 
                            y1={placementTestNodeY} 
                            x2="100%" 
                            y2={placementTestNodeY} 
                            stroke="hsl(var(--border))" 
                            strokeWidth="2" 
                            strokeDasharray="5,5" 
                        />
                    )}
                </svg>

                {sortedItems.map((item, index) => {
                    const isItemQuiz = isQuiz(item);
                    const isCompleted = isItemQuiz ? completedQuizIds.has(item.id) : completedLessonIds.has(item.id);
                    
                    let isSequentiallyUnlocked = false;
                    if (index === 0 || (isItemQuiz && item.isPlacementTest)) {
                        isSequentiallyUnlocked = true;
                    } else {
                        const prevItem = sortedItems[index-1];
                        isSequentiallyUnlocked = isQuiz(prevItem) ? completedQuizIds.has(prevItem.id) : completedLessonIds.has(prevItem.id);
                    }
                    
                    const isExplicitlyAssigned = assignedIds.has(item.id);
                    const isExplicitlyUnlocked = isItemQuiz ? unlockedQuizIds.has(item.id) : unlockedLessonIds.has(item.id);
                    const isUnlocked = isSequentiallyUnlocked || isExplicitlyAssigned || isCompleted || isExplicitlyUnlocked;
                    
                    const position = nodePositions[index];
                    if (!position) return null;

                    return (
                        <div
                            key={item.id}
                            className="absolute z-10"
                            style={{
                                top: `${position.y - 48}px`,
                                left: `${position.x}px`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <QuestNode 
                                title={item.title}
                                subtitle={`Topic: ${item.topic}`}
                                icon={isItemQuiz ? CheckSquare : BookOpen}
                                isCompleted={isCompleted}
                                isUnlocked={isUnlocked}
                                isAssigned={isExplicitlyAssigned && !isCompleted}
                                onClick={() => isItemQuiz ? onSelectQuiz(item) : onSelectLesson(item)}
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
    onSelectLesson,
    onSelectQuiz,
}: { 
    lessons: Lesson[], 
    quizzes: Quiz[],
    student: Student | null, 
    onSelectLesson: (lesson: Lesson) => void;
    onSelectQuiz: (quiz: Quiz) => void;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pathData, setPathData] = useState<{ progress: string, remaining: string }>({ progress: '', remaining: '' });
    const [nodePositions, setNodePositions] = useState<{x: number, y: number}[]>([]);
    const [placementTestNodeY, setPlacementTestNodeY] = useState<number | null>(null);

    const isQuiz = (item: any): item is Quiz => 'questions' in item;
    const completedLessonIds = new Set(student?.completedLessons || []);
    const completedQuizIds = new Set(Object.keys(student?.quizScores || {}));
    const assignedIds = new Set([...(student?.assignedLessons || []), ...(student?.assignedQuizzes || [])]);
    const unlockedLessonIds = new Set(student?.unlockedLessons || []);
    const unlockedQuizIds = new Set(student?.unlockedQuizzes || []);

    
    const sortedItems = React.useMemo(() => {
        const allItems: (Lesson | Quiz)[] = [...(lessons || []), ...(quizzes || [])];
        return allItems
            .filter(l => l.grade === 3)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [lessons, quizzes]);

    useEffect(() => {
        const calculatePath = (containerWidth: number) => {
            if (sortedItems.length < 1 || !containerWidth) return;

            const centerX = containerWidth / 2;
            const amplitude = Math.min(containerWidth * 0.2, 150);
            const yStep = 160;
            const initialY = 80;

             const points = sortedItems.map((item, index) => {
                const y = initialY + index * yStep;
                const x = centerX + amplitude * Math.sin(index * Math.PI / 3);
                if(isQuiz(item) && item.isPlacementTest) {
                    setPlacementTestNodeY(y);
                }
                return { x, y };
            });
            setNodePositions(points);

            let lastCompletedIndex = -1;
            for (let i = 0; i < sortedItems.length; i++) {
                const item = sortedItems[i];
                const isItemCompleted = isQuiz(item) ? completedQuizIds.has(item.id) : completedLessonIds.has(item.id);
                if (isItemCompleted) {
                    lastCompletedIndex = i;
                } else {
                    break;
                }
            }
            
            const progressPoints = points.slice(0, lastCompletedIndex + 1);
            const remainingPoints = lastCompletedIndex === -1 ? points : points.slice(lastCompletedIndex);
            
            setPathData({
                progress: progressPoints.length > 1 ? getCurvePath(progressPoints) : '',
                remaining: remainingPoints.length > 1 ? getCurvePath(remainingPoints) : '',
            });
        };
        
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                 if (entry.contentRect.width > 0) {
                    calculatePath(entry.contentRect.width);
                 }
            }
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
        };

    }, [sortedItems, completedLessonIds, completedQuizIds]);


    if (sortedItems.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No Grade 3 lessons found. Check back soon!</p>
    }

    return (
        <div className="relative w-full overflow-x-auto p-4">
            <div ref={containerRef} className="relative" style={{ minHeight: `${sortedItems.length * 10 + 5}rem`}}>
                <QuestPathDecorations />
                <svg className="absolute top-0 left-0 w-full h-full z-0" overflow="visible">
                    {pathData.remaining && (
                        <path
                            d={pathData.remaining}
                            stroke="hsl(var(--primary))"
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                        />
                    )}
                    {pathData.progress && (
                        <path
                            d={pathData.progress}
                            stroke="hsl(142 71% 45%)" // Green color
                            strokeWidth="10"
                            fill="none"
                            strokeLinecap="round"
                        />
                    )}
                    {placementTestNodeY && (
                        <line 
                            x1="0" 
                            y1={placementTestNodeY} 
                            x2="100%" 
                            y2={placementTestNodeY} 
                            stroke="hsl(var(--border))" 
                            strokeWidth="2" 
                            strokeDasharray="5,5" 
                        />
                    )}
                </svg>

                {sortedItems.map((item, index) => {
                    const isItemQuiz = isQuiz(item);
                    const isCompleted = isItemQuiz ? completedQuizIds.has(item.id) : completedLessonIds.has(item.id);
                    
                    let isSequentiallyUnlocked = false;
                    if (index === 0 || (isItemQuiz && item.isPlacementTest)) {
                        isSequentiallyUnlocked = true;
                    } else {
                        const prevItem = sortedItems[index-1];
                        isSequentiallyUnlocked = isQuiz(prevItem) ? completedQuizIds.has(prevItem.id) : completedLessonIds.has(prevItem.id);
                    }

                    const isExplicitlyAssigned = assignedIds.has(item.id);
                    const isExplicitlyUnlocked = isItemQuiz ? unlockedQuizIds.has(item.id) : unlockedLessonIds.has(item.id);
                    const isUnlocked = isSequentiallyUnlocked || isExplicitlyAssigned || isCompleted || isExplicitlyUnlocked;

                    const position = nodePositions[index];
                    if (!position) return null;

                    return (
                        <div
                            key={item.id}
                            className="absolute z-10"
                            style={{
                                top: `${position.y - 48}px`,
                                left: `${position.x}px`,
                                transform: 'translateX(-50%)',
                            }}
                        >
                            <QuestNode 
                                title={item.title}
                                subtitle={`Topic: ${item.topic}`}
                                icon={isItemQuiz ? CheckSquare : BookOpen}
                                isCompleted={isCompleted}
                                isUnlocked={isUnlocked}
                                isAssigned={isExplicitlyAssigned && !isCompleted}
                                onClick={() => isItemQuiz ? onSelectQuiz(item) : onSelectLesson(item)}
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
  const router = useRouter();
  const { toast } = useToast();
  const [selectedLesson, setSelectedLesson] = React.useState<Lesson | null>(null);
  const [selectedQuiz, setSelectedQuiz] = React.useState<Quiz | null>(null);

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  const lessonsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'lessons') : null, [firestore]);
  const quizzesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'quizzes') : null, [firestore]);

  const { data: lessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
  const { data: quizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);
  
  // Effect to automatically select a lesson or quiz if an ID is in the URL params.
  useEffect(() => {
    if (lessons && quizzes) {
      const lessonId = searchParams.get('lesson');
      const quizId = searchParams.get('quiz');
      if (lessonId) {
        const lessonFromParam = lessons.find(l => l.id === lessonId);
        if (lessonFromParam) setSelectedLesson(lessonFromParam);
      } else if (quizId) {
        const quizFromParam = quizzes.find(q => q.id === quizId);
        if (quizFromParam) setSelectedQuiz(quizFromParam);
      }
    }
  }, [lessons, quizzes, searchParams]);
  
  const grades = [1, 2, 3, 4, 5];
  
  const isLoading = isUserLoading || isStudentLoading || areLessonsLoading || areQuizzesLoading;

  const handleCompleteLesson = (lessonId: string) => {
    if (!studentDocRef) return;
    updateDoc(studentDocRef, {
        completedLessons: arrayUnion(lessonId)
    }).then(() => {
        toast({ title: "Lesson Complete!", description: "Great job! Keep up the good work." });
        setSelectedLesson(null);
        router.replace('/student/resources');
    });
  }

  const handleUncompleteLesson = (lessonId: string) => {
    if (!studentDocRef) return;
    updateDoc(studentDocRef, {
        completedLessons: arrayRemove(lessonId)
    });
  }
  
  const handleQuizComplete = async (quizId: string, score: number) => {
    if (!studentDocRef || !lessons || !quizzes) return;
    const quiz = quizzes.find(q => q.id === quizId);
    if (!quiz) return;
    
    const batch = writeBatch(firestore);

    let updates: any = {
        [`quizScores.${quizId}`]: score,
    };

    // If score is 80% or higher, mark as complete and check for other unlocks
    if (score >= 80) {
        // Use a Set to avoid duplicate entries and merge with existing completed quizzes
        const completedQuizzes = new Set(student?.completedQuizzes || []);
        completedQuizzes.add(quizId);
        updates.completedQuizzes = Array.from(completedQuizzes);
        
        const badgeId = allBadges.find(b => b.id.includes(quiz.topic.toLowerCase()))?.id;
        if (badgeId) {
            updates.badges = arrayUnion(badgeId);
        }
      
        // Placement test logic: if passed, unlock all previous lessons/quizzes in the same grade path
        if (quiz.isPlacementTest && quiz.order !== undefined) {
            const allItemsForGrade: (Lesson | Quiz)[] = [...lessons, ...quizzes].filter(item => item.grade === quiz.grade);
            const itemsToUnlock = allItemsForGrade.filter(item => (item.order || 0) < (quiz.order || 0));
            
            if (itemsToUnlock.length > 0) {
              const lessonIdsToUnlock = itemsToUnlock.filter(item => !('questions' in item)).map(item => item.id);
              const quizIdsToUnlock = itemsToUnlock.filter(item => 'questions' in item).map(item => item.id);
              
              if(lessonIdsToUnlock.length > 0) updates.unlockedLessons = arrayUnion(...lessonIdsToUnlock);
              if(quizIdsToUnlock.length > 0) updates.unlockedQuizzes = arrayUnion(...quizIdsToUnlock);
            }

            toast({
                title: "Path Unlocked!",
                description: "Great score! You've unlocked previous steps.",
            });
        }
    }

    batch.update(studentDocRef, updates);
    await batch.commit();
  }
  
  const handleRetryQuiz = async (quizId: string) => {
    if (!studentDocRef || !student || !lessons || !quizzes) return;

    const quiz = quizzes?.find(q => q.id === quizId);
    if (!quiz) return;

    const batch = writeBatch(firestore);

    // Find the badge related to the quiz topic
    const badgeId = allBadges.find(b => b.id.includes(quiz.topic.toLowerCase()))?.id;

    // Prepare the updates to Firestore
    const updates: { [key: string]: any } = {
      // Use dot notation to remove a specific field from a map
      [`quizScores.${quizId}`]: deleteField(),
      completedQuizzes: arrayRemove(quizId)
    };

    // If a badge was associated and the student has it, remove it
    if (badgeId && student.badges?.includes(badgeId)) {
      updates.badges = arrayRemove(badgeId);
    }
    
    // If it was a placement test, re-lock the lessons it unlocked.
    if (quiz.isPlacementTest && quiz.order !== undefined) {
        const isQuiz = (item: any): item is Quiz => 'questions' in item;
        const allItemsForGrade: (Lesson | Quiz)[] = [...lessons, ...quizzes].filter(item => item.grade === quiz.grade);
        const itemsToRelock = allItemsForGrade.filter(item => (item.order || 0) < (quiz.order || 0));
            
        if (itemsToRelock.length > 0) {
            const lessonIdsToRelock = itemsToRelock.filter(item => !isQuiz(item)).map(item => item.id);
            const quizIdsToRelock = itemsToRelock.filter(item => isQuiz(item)).map(item => item.id);
            
            if(lessonIdsToRelock.length > 0) updates.unlockedLessons = arrayRemove(...lessonIdsToRelock);
            if(quizIdsToRelock.length > 0) updates.unlockedQuizzes = arrayRemove(...quizIdsToRelock);
        }
    }

    batch.update(studentDocRef, updates);
    
    try {
        await batch.commit();
        toast({
            title: "Quiz Reset",
            description: "Your previous score has been cleared. Good luck!"
        });
    } catch (error) {
        console.error("Error retrying quiz:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not reset your quiz progress. Please try again."
        });
    }
  };
  
  const handleBack = () => {
    setSelectedLesson(null);
    setSelectedQuiz(null);
    router.replace('/student/resources');
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
                onBack={handleBack}
                onComplete={handleCompleteLesson}
                onUncomplete={handleUncompleteLesson}
                isCompleted={student?.completedLessons?.includes(selectedLesson.id) || false}
             />
        </div>
    )
  }
  
  if (selectedQuiz) {
    return (
        <div className="p-4 sm:p-6">
            <QuizView
                quiz={selectedQuiz}
                student={student}
                onBack={handleBack}
                onQuizComplete={handleQuizComplete}
                onRetryQuiz={handleRetryQuiz}
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
        <TabsList className="grid w-full grid-cols-5" id="tutorial-grade-tabs">
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
                                    onSelectLesson={setSelectedLesson}
                                    onSelectQuiz={setSelectedQuiz}
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
                                    onSelectLesson={setSelectedLesson}
                                    onSelectQuiz={setSelectedQuiz}
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
                    <Accordion type="multiple" className="w-full" defaultValue={gradeTopics} id="tutorial-topic-list">
                        {gradeTopics.map((topic, index) => {
                            const topicLessons = gradeLessons.filter(l => l.topic === topic);
                            return (
                                <AccordionItem key={topic} value={topic} id={index === 0 ? 'tutorial-first-topic' : undefined}>
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
                                                  onSelectQuiz={setSelectedQuiz}
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
