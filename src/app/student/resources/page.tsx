
'use client';

import type { Lesson, Student, Quiz, QuizQuestion } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, deleteField, writeBatch } from 'firebase/firestore';
import { BookOpen, ArrowLeft, CheckCircle2, RotateCcw, Star, Lock, CheckSquare, FileQuestion, Gamepad2, Play, Trophy, Leaf } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { OceanTurtle } from '../characters/OceanTurtle';
import { SpaceAlien } from '../characters/SpaceAlien';
import { DinoTrex } from '../characters/DinoTrex';
import { Campfire } from '../characters/Campfire';
import { ForestTrees } from '../characters/ForestTrees';
import { Seaweed } from '../characters/Seaweed';
import { Seahorse } from '../characters/Seahorse';
import { SchoolOfFish } from '../characters/SchoolOfFish';
import { Astronaut } from '../characters/Astronaut';
import { Rocket } from '../characters/Rocket';
import { Shield } from '../characters/Shield';
import { PrehistoricTrees } from '../characters/PrehistoricTrees';


const getLessonViewIcon = (lessonType: Lesson['type']) => {
    switch (lessonType) {
        case 'Video':
            return <Play className="w-8 h-8 text-primary" />;
        case 'Text':
            return <BookOpen className="w-8 h-8 text-primary" />;
        case 'Game':
            return <Gamepad2 className="w-8 h-8 text-primary" />;
        default:
            return <BookOpen className="w-8 h-8 text-primary" />;
    }
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
  const isGameLesson = lesson.type === 'Game';

  let videoId = '';
  if (isVideoLesson) {
    try {
        const url = new URL(lesson.content);
        if (url.hostname === 'youtu.be') {
          videoId = url.pathname.slice(1);
        } else {
          videoId = url.searchParams.get('v') || '';
        }
    } catch (e) {
        console.error("Invalid video URL", e);
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
             {getLessonViewIcon(lesson.type)}
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
          ) : isGameLesson ? (
            <div className="aspect-video">
                <iframe
                    className="w-full h-full rounded-md border"
                    src={lesson.content}
                    title={lesson.title}
                    frameBorder="0"
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

const getQuestNodeIcon = (item: Lesson | Quiz) => {
    if ('questions' in item) { // It's a Quiz
        if (item.isUnitTest) {
            return Trophy;
        }
        return CheckSquare;
    }
    // It's a Lesson
    switch (item.type) {
        case 'Video':
            return Play;
        case 'Game':
            return Gamepad2;
        case 'Text':
        default:
            return BookOpen;
    }
};

const themes: Record<number, { name: string; }> = {
    1: { name: 'Forest' },
    2: { name: 'Ocean' },
    3: { name: 'Space' },
    4: { name: 'Medieval' },
    5: { name: 'Dinosaur' },
};

const ThemeBackground = ({ grade }: { grade: number }) => {
    const leafStyles: React.CSSProperties[] = Array.from({ length: 15 }).map(() => ({
        position: 'absolute',
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animation: `fall ${Math.random() * 20 + 25}s linear infinite`,
        animationDelay: `${Math.random() * 10}s`,
        opacity: Math.random() * 0.1 + 0.05,
        transform: `rotate(${Math.random() * 360}deg) scale(${Math.random() * 0.5 + 0.5})`,
    }));
     const bubbleStyles: React.CSSProperties[] = Array.from({ length: 25 }).map(() => ({
        position: 'absolute',
        bottom: '-10px',
        left: `${Math.random() * 100}%`,
        width: `${Math.random() * 20 + 5}px`,
        height: `${Math.random() * 20 + 5}px`,
        borderRadius: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        animation: `bubble ${Math.random() * 10 + 5}s linear infinite`,
        animationDelay: `${Math.random() * 5}s`,
    }));

    switch (grade) {
        case 1: // Forest
            return (
                <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-green-100 to-green-200">
                    <style>{`
                        @keyframes fall {
                            0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
                            10% { opacity: 0.1; }
                            90% { opacity: 0.1; }
                            100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
                        }
                    `}</style>
                    {leafStyles.map((style, i) => (
                        <div key={i} style={style}><Leaf className="w-6 h-6 text-green-700" /></div>
                    ))}
                </div>
            );
        case 2: // Ocean
            return (
                 <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-cyan-200 to-blue-400">
                    <style>{`
                        @keyframes bubble {
                            0% { transform: translateY(0); opacity: 0.5; }
                            100% { transform: translateY(-100vh); opacity: 0; }
                        }
                    `}</style>
                    {/* Waves */}
                    <svg className="absolute bottom-0 w-full opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="0.5" d="M0,160L48,181.3C96,203,192,245,288,240C384,235,480,181,576,170.7C672,160,768,192,864,208C960,224,1056,224,1152,202.7C1248,181,1344,139,1392,117.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                    <svg className="absolute bottom-0 w-full opacity-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#ffffff" fillOpacity="0.7" d="M0,224L48,208C96,192,192,160,288,165.3C384,171,480,213,576,202.7C672,192,768,128,864,117.3C960,107,1056,149,1152,160C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>
                    
                    {/* Bubbles */}
                    {bubbleStyles.map((style, i) => (
                        <div key={i} style={style}></div>
                    ))}
                </div>
            );
        case 3: // Space
             return (
                 <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-slate-800 to-indigo-900">
                    <svg width="100%" height="100%" className="absolute inset-0 opacity-70">
                        {[...Array(100)].map((_, i) => <circle key={i} cx={`${Math.random()*100}%`} cy={`${Math.random()*100}%`} r={Math.random()*1.2} fill="white" />)}
                    </svg>
                </div>
            );
        case 4: // Medieval
            return (
                <div className="absolute inset-0 z-0 overflow-hidden bg-stone-400">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="brick" patternUnits="userSpaceOnUse" width="100" height="50">
                                <rect width="100" height="50" fill="#A8A29E" />
                                <rect x="0" y="22" width="100" height="6" fill="#78716C" />
                                <rect x="47" y="0" width="6" height="25" fill="#78716C" />
                                <rect x="-3" y="25" width="6" height="25" fill="#78716C" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#brick)" opacity="0.5" />
                    </svg>
                </div>
            );
        case 5: // Dinosaur
            return (
                 <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-amber-100 to-lime-200">
                    {/* Volcano silhouette */}
                    <svg className="absolute bottom-0 right-0 w-64 h-48 text-orange-800/20" viewBox="0 0 200 100">
                        <path d="M 0 100 L 80 100 L 120 20 L 140 40 L 200 100 Z" fill="currentColor" />
                    </svg>
                    {/* Fern */}
                     <svg className="absolute bottom-5 left-5 w-32 h-32 text-green-700/20" viewBox="0 0 100 100">
                        <path d="M50 90 C 20 70, 80 70, 50 90 M50 90 C 50 50, 20 60, 20 20 M50 90 C 50 50, 80 60, 80 20 M20 20 C 0 20, 30 20, 20 40 M20 40 C 0 40, 30 40, 20 60 M 80 20 C 100 20, 70 20, 80 40 M 80 40 C 100 40, 70 40, 80 60" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                </div>
            );
        default:
            return <div className="absolute inset-0 z-0 bg-gray-100" />;
    }
};

const UnitQuestPath = ({
    unit,
    lessons, 
    quizzes,
    student, 
    onSelectLesson,
    onSelectQuiz,
    grade,
}: { 
    unit: { id: string; title: string; grade: number, order: number };
    lessons: Lesson[], 
    quizzes: Quiz[],
    student: Student | null, 
    onSelectLesson: (lesson: Lesson) => void;
    onSelectQuiz: (quiz: Quiz) => void;
    grade: number;
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pathData, setPathData] = useState<{ progress: string, remaining: string }>({ progress: '', remaining: '' });
    const [nodePositions, setNodePositions] = useState<{x: number, y: number}[]>([]);
    const [sceneryPositions, setSceneryPositions] = useState<Record<string, { x: number; y: number }>>({});
    const [placementTestNodeY, setPlacementTestNodeY] = useState<number | null>(null);

    const theme = themes[grade] || themes[1];

    const isQuiz = (item: any): item is Quiz => 'questions' in item;
    const completedLessonIds = new Set(student?.completedLessons || []);
    const completedQuizIds = new Set(Object.keys(student?.quizScores || {}));
    const assignedIds = new Set([...(student?.assignedLessons || []), ...(student?.assignedQuizzes || [])]);
    const unlockedLessonIds = new Set(student?.unlockedLessons || []);
    const unlockedQuizIds = new Set(student?.unlockedQuizzes || []);

    const sortedItems = React.useMemo(() => {
        if (!unit) return [];
        const allItems: (Lesson | Quiz)[] = [...(lessons || []), ...(quizzes || [])];
        const unitItems = allItems.filter(l => l.topic === unit.title && String(l.grade) === String(unit.grade));
        return unitItems.sort((a, b) => (a.order || 0) - (b.order || 0));
    }, [lessons, quizzes, unit]);
    
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
                if (isQuiz(item) && item.isPlacementTest) {
                    setPlacementTestNodeY(y);
                }
                return { x, y };
            });
            setNodePositions(points);

            const newScenery: Record<string, { x: number; y: number }> = {};
            if (grade === 2) {
                if (points.length > 4) {
                    newScenery['seaweed'] = { x: points[4].x + 100, y: points[4].y };
                    newScenery['seahorse'] = { x: points[4].x + 130, y: points[4].y - 20 };
                }
                if (points.length > 7) {
                    newScenery['fishSchool'] = { x: centerX, y: points[7].y };
                }
            }
             if (grade === 3 && points.length > 3) {
                newScenery['rocket'] = { x: points[3].x - 150, y: points[3].y };
                newScenery['astronaut'] = { x: points[3].x - 90, y: points[3].y + 50 };
            }
            if (grade === 4 && points.length > 2) {
                newScenery['shield'] = { x: centerX, y: points[2].y + 100 };
            }
            if (grade === 5 && points.length > 1) {
                newScenery['trees1'] = { x: points[1].x + 100, y: points[1].y };
            }
            if (grade === 5 && points.length > 5) {
                newScenery['trees2'] = { x: points[5].x - 150, y: points[5].y };
            }
            setSceneryPositions(newScenery);


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
    }, [sortedItems, completedLessonIds, completedQuizIds, grade]);


    if (sortedItems.length === 0) {
        return <p className="text-muted-foreground text-center py-8">No lessons found for this unit. Check back soon!</p>
    }
    
    const firstNodePos = nodePositions[0] || { x: 0, y: 0 };


    return (
        <Card className="overflow-hidden">
            <CardHeader>
                <CardTitle>{unit.title}</CardTitle>
                <CardDescription>Complete the lessons in order to unlock the next one!</CardDescription>
            </CardHeader>
            <CardContent>
                <div id="tutorial-topic-list" className="relative w-full overflow-x-auto p-4 rounded-lg">
                    <ThemeBackground grade={grade} />
                    <div ref={containerRef} className="relative" style={{ minHeight: `${sortedItems.length * 10 + 5}rem`}}>
                        <svg className="absolute top-0 left-0 w-full h-full z-0" overflow="visible">
                            {pathData.remaining && (
                                <path
                                    d={pathData.remaining}
                                    stroke="hsl(var(--primary))"
                                    strokeOpacity="0.5"
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

                        {/* Grade 1 Scenery */}
                        {grade === 1 && firstNodePos && (
                            <>
                                <div className="absolute z-10 w-24 h-32" style={{ top: firstNodePos.y - 40, left: firstNodePos.x + 90 }}>
                                    <ForestTrees />
                                </div>
                                <div className="absolute z-10 w-20 h-20" style={{ top: firstNodePos.y + 40, left: firstNodePos.x + 80 }}>
                                    <Campfire />
                                </div>
                            </>
                        )}
                        
                        {/* Grade 2 Scenery */}
                        {grade === 2 && firstNodePos && (
                             <>
                                <div className="absolute z-10 w-40 h-40 transition-transform hover:scale-110" style={{ top: firstNodePos.y - 80, left: firstNodePos.x - 200 }}>
                                    <OceanTurtle />
                                </div>
                                 <div className="absolute z-10 w-32 h-32 transition-transform hover:scale-110 opacity-80" style={{ top: firstNodePos.y - 40, left: firstNodePos.x - 150 }}>
                                    <OceanTurtle />
                                </div>
                                {sceneryPositions.seaweed && (
                                    <div className="absolute z-10 w-24 h-48" style={{ top: sceneryPositions.seaweed.y - 80, left: sceneryPositions.seaweed.x }}>
                                        <Seaweed />
                                    </div>
                                )}
                                 {sceneryPositions.seahorse && (
                                    <div className="absolute z-10 w-16 h-32" style={{ top: sceneryPositions.seahorse.y, left: sceneryPositions.seahorse.x + 20 }}>
                                        <Seahorse />
                                    </div>
                                )}
                                {sceneryPositions.fishSchool && (
                                     <div className="absolute z-10 w-48 h-32" style={{ top: sceneryPositions.fishSchool.y, left: sceneryPositions.fishSchool.x, transform: 'translateX(-50%)' }}>
                                        <SchoolOfFish />
                                    </div>
                                )}
                            </>
                        )}

                        {/* Grade 3 Scenery */}
                        {grade === 3 && firstNodePos && (
                            <div className="absolute z-10 w-40 h-40 transition-transform hover:scale-110" style={{ top: firstNodePos.y - 80, left: firstNodePos.x - 120, transform: 'translateX(-50%)' }}>
                                <SpaceAlien />
                            </div>
                        )}
                        {grade === 3 && sceneryPositions.rocket && (
                            <>
                                <div className="absolute z-10 w-24 h-48 transition-transform hover:scale-105" style={{ top: sceneryPositions.rocket.y - 80, left: sceneryPositions.rocket.x }}>
                                    <Rocket />
                                </div>
                                <div className="absolute z-10 w-20 h-32 transition-transform hover:scale-105" style={{ top: sceneryPositions.astronaut.y - 40, left: sceneryPositions.astronaut.x }}>
                                    <Astronaut />
                                </div>
                            </>
                        )}

                        {/* Grade 4 Scenery */}
                        {grade === 4 && sceneryPositions.shield && (
                            <div className="absolute z-10 w-24 h-32 opacity-70" style={{ top: sceneryPositions.shield.y, left: sceneryPositions.shield.x, transform: 'translateX(-50%)' }}>
                                <Shield />
                            </div>
                        )}
                         
                        {/* Grade 5 Scenery */}
                         {grade === 5 && firstNodePos && (
                            <div className="absolute z-10 w-40 h-40 transition-transform hover:scale-110" style={{ top: firstNodePos.y - 120, left: firstNodePos.x - 120, transform: 'translateX(-50%)' }}>
                                <DinoTrex />
                            </div>
                        )}
                        {grade === 5 && sceneryPositions.trees1 && (
                            <div className="absolute z-10 w-32 h-40" style={{ top: sceneryPositions.trees1.y, left: sceneryPositions.trees1.x }}>
                                <PrehistoricTrees />
                            </div>
                        )}
                        {grade === 5 && sceneryPositions.trees2 && (
                            <div className="absolute z-10 w-32 h-40" style={{ top: sceneryPositions.trees2.y, left: sceneryPositions.trees2.x }}>
                                <PrehistoricTrees />
                            </div>
                        )}


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
                                    className="absolute z-20"
                                    style={{
                                        top: `${position.y - 48}px`,
                                        left: `${position.x}px`,
                                        transform: 'translateX(-50%)',
                                    }}
                                >
                                    <QuestNode 
                                        title={item.title}
                                        subtitle={`Topic: ${item.topic}`}
                                        icon={getQuestNodeIcon(item)}
                                        isCompleted={isCompleted}
                                        isUnlocked={isUnlocked}
                                        isAssigned={isExplicitlyAssigned && !isCompleted}
                                        onClick={() => isItemQuiz ? onSelectQuiz(item) : onSelectLesson(item as Lesson)}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
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

  // New state for filters
  const [selectedGrade, setSelectedGrade] = useState<string | undefined>();
  const [selectedUnitId, setSelectedUnitId] = useState<string | undefined>(); // This now stores the topic name

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
  
  const isLoading = isUserLoading || isStudentLoading || areLessonsLoading || areQuizzesLoading;

  // Memoized list of "units" derived from topics for the selected grade
  const unitsForSelectedGrade = useMemo(() => {
    if (!lessons || !quizzes || !selectedGrade) return [];

    const allContentForGrade = [...lessons, ...quizzes].filter(
      item => String(item.grade) === selectedGrade
    );
    const uniqueTopics = [...new Set(allContentForGrade.map(item => item.topic))].sort();

    // Mimic the Unit structure for consistency
    return uniqueTopics.map((topic, index) => ({
      id: topic,
      title: topic,
      grade: parseInt(selectedGrade, 10),
      order: index,
    }));
  }, [lessons, quizzes, selectedGrade]);
  
  // Effect to set default filters once data is loaded
  useEffect(() => {
    if (student && !selectedGrade) {
        setSelectedGrade(String(student.grade));
    }
    // If grade changes, or on initial load, set the selected unit to the first available one
    if (selectedGrade && unitsForSelectedGrade.length > 0) {
        // Check if the current selectedUnitId is valid for the new list of units
        const currentUnitExists = unitsForSelectedGrade.some(u => u.id === selectedUnitId);
        if (!currentUnitExists) {
            setSelectedUnitId(unitsForSelectedGrade[0].id);
        }
    } else if (selectedGrade && unitsForSelectedGrade.length === 0) {
        setSelectedUnitId(undefined); // No units for this grade
    }
  }, [student, unitsForSelectedGrade, selectedGrade, selectedUnitId]);


  const selectedUnit = useMemo(() => {
      if (!unitsForSelectedGrade || !selectedUnitId) return null;
      return unitsForSelectedGrade.find(u => u.id === selectedUnitId);
  }, [unitsForSelectedGrade, selectedUnitId]);

  // Handler for changing grade
  const handleGradeChange = (grade: string) => {
      setSelectedGrade(grade);
      setSelectedUnitId(undefined); // Reset unit when grade changes, useEffect will pick the new default
  };


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
            <p className="text-muted-foreground">Explore lessons created by our teachers! Assigned items are marked with a <Star className="inline w-4 h-4 text-yellow-400 fill-yellow-400" />.</p>
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
  
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Resources</h1>
      <p className="text-muted-foreground">Explore lessons created by our teachers! Assigned items are marked with a <Star className="inline w-4 h-4 text-yellow-400 fill-yellow-400" />.</p>

        <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
                <Label htmlFor="grade-filter">Grade</Label>
                <Select value={selectedGrade} onValueChange={handleGradeChange}>
                    <SelectTrigger id="grade-filter" data-ai-hint="grade dropdown">
                        <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                    <SelectContent>
                        {[1,2,3,4,5].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex-1 space-y-2">
                <Label htmlFor="unit-filter">Unit</Label>
                 <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={!selectedGrade || unitsForSelectedGrade.length === 0}>
                    <SelectTrigger id="unit-filter" data-ai-hint="unit dropdown">
                        <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                        {unitsForSelectedGrade.map(u => <SelectItem key={u.id} value={u.id}>{u.title}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </div>
        
        {selectedUnit && selectedGrade ? (
            <UnitQuestPath
                unit={selectedUnit}
                lessons={lessons || []}
                quizzes={quizzes || []}
                student={student}
                onSelectLesson={setSelectedLesson}
                onSelectQuiz={setSelectedQuiz}
                grade={parseInt(selectedGrade)}
            />
        ) : (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    <p>{selectedGrade ? "No units found for this grade." : "Select a grade to see available units."}</p>
                </CardContent>
            </Card>
        )}
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
