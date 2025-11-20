'use client';
import { resources, quizzes, badges as allBadges } from '@/lib/data';
import type { Student, Lesson } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Award, ListChecks, BookOpen, Star } from 'lucide-react';
import { useUser, useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, updateDoc, arrayUnion, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

/**
 * The main page for the student dashboard.
 * This client component fetches and displays an overview of the logged-in student's progress,
 * including completed activities, earned badges, and assigned lessons.
 */
export default function StudentDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user?.uid]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

  const [lessons, setLessons] = useState<Lesson[] | null>(null);
  const [areLessonsLoading, setAreLessonsLoading] = useState(true);

  useEffect(() => {
    const fetchLessons = async () => {
      if (!firestore || !student) return;

      const lessonIds = [
        ...(student.assignedLessons || []),
        ...(student.completedLessons || []),
      ];
      
      // Remove duplicates
      const uniqueLessonIds = [...new Set(lessonIds)];

      if (uniqueLessonIds.length === 0) {
        setLessons([]);
        setAreLessonsLoading(false);
        return;
      }

      try {
        setAreLessonsLoading(true);
        const lessonsCollection = collection(firestore, 'lessons');
        // Firestore 'in' queries are limited to 30 items. We fetch in batches if needed.
        const lessonPromises = [];
        for (let i = 0; i < uniqueLessonIds.length; i += 30) {
          const batchIds = uniqueLessonIds.slice(i, i + 30);
          const q = query(lessonsCollection, where('__name__', 'in', batchIds));
          lessonPromises.push(getDocs(q));
        }
        
        const querySnapshots = await Promise.all(lessonPromises);
        const fetchedLessons: Lesson[] = [];
        querySnapshots.forEach(snapshot => {
          snapshot.forEach(doc => {
            fetchedLessons.push({ id: doc.id, ...doc.data() } as Lesson);
          });
        });
        
        setLessons(fetchedLessons);
      } catch (error) {
        console.error("Error fetching lessons:", error);
        setLessons([]);
      } finally {
        setAreLessonsLoading(false);
      }
    };

    fetchLessons();
  }, [firestore, student]);

  const isLoading = isUserLoading || isStudentLoading || areLessonsLoading;
  
  if (isLoading || !student || lessons === null) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // Once data is loaded, prepare it for rendering.
  const completedLessons = student.completedLessons || [];
  const assignedLessons = student.assignedLessons || [];
  
  const completedAssignedLessons = assignedLessons.filter(lessonId => completedLessons.includes(lessonId));

  const progressPercentage = assignedLessons.length > 0
    ? (completedAssignedLessons.length / assignedLessons.length) * 100
    : 0;
    
  const assignedLessonsData = lessons.filter(l => assignedLessons.includes(l.id));
  const completedLessonsData = lessons.filter(l => completedLessons.includes(l.id));
  const completedQuizzesData = quizzes.filter(q => Object.keys(student.quizScores || {}).includes(q.id));
  const earnedBadges = allBadges.filter(b => (student.badges || []).includes(b.id));
  
  const handleMarkComplete = (lessonId: string) => {
    if (!studentDocRef) return;
    updateDoc(studentDocRef, {
        completedLessons: arrayUnion(lessonId)
    });
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Welcome back, {student.name}!</h1>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">My Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {/* Card to display overall progress on assigned lessons */}
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <ListChecks /> My Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                    {completedAssignedLessons.length} of {assignedLessons.length} assigned lessons completed
                    </p>
                    <Progress value={progressPercentage} className="w-full" />
                    {assignedLessons.length > 0 && <p className="text-center text-sm mt-2 font-medium text-primary animate-pulse">Keep up the great work!</p>}
                    {assignedLessons.length === 0 && <p className="text-center text-sm mt-2 text-muted-foreground">Your teacher has not assigned any lessons yet.</p>}
                </CardContent>
                </Card>

                {/* Card to display earned badges */}
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Award /> My Badges
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {earnedBadges.length > 0 ? earnedBadges.map(badge => (
                    <Badge key={badge.id} variant="secondary" className="text-sm py-1 px-3">
                        <badge.icon className="w-4 h-4 mr-2 text-accent"/>
                        {badge.name}
                    </Badge>
                    )) : <p className="text-sm text-muted-foreground">Complete lessons and quizzes to earn badges!</p>}
                </CardContent>
                </Card>
            </div>

            {/* Card to display a list of completed activities */}
            <div className="mt-6">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 /> Completed Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                    {/* List of completed lessons */}
                    <div>
                        <h3 className="font-semibold mb-2">Lessons</h3>
                        <ul className="space-y-2">
                        {completedLessonsData.length > 0 ? completedLessonsData.map(lesson => (
                            <li key={lesson.id} className="text-sm text-muted-foreground">{lesson.title}</li>
                        )) : <p className="text-sm text-muted-foreground">No lessons completed yet.</p>}
                        </ul>
                    </div>
                    {/* List of completed quizzes and their scores */}
                    <div>
                        <h3 className="font-semibold mb-2">Quizzes</h3>
                        <ul className="space-y-2">
                        {completedQuizzesData.length > 0 ? completedQuizzesData.map(quiz => (
                            <li key={quiz.id} className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>{quiz.title}</span>
                            <span className="font-bold text-primary">{student.quizScores?.[quiz.id]}%</span>
                            </li>
                        )) : <p className="text-sm text-muted-foreground">No quizzes completed yet.</p>}
                        </ul>
                    </div>
                    </div>
                </CardContent>
                </Card>
            </div>
        </TabsContent>
        <TabsContent value="assignments">
            <Card>
                <CardHeader>
                    <CardTitle>Assigned Lessons</CardTitle>
                    <CardContent>
                        {assignedLessonsData.length > 0 ? (
                             <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                {assignedLessonsData.map(lesson => {
                                    const isCompleted = completedLessons.includes(lesson.id);
                                    return (
                                        <Card key={lesson.id}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2 text-base">
                                                    {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <BookOpen className="w-6 h-6 text-primary" />}
                                                    {lesson.title}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-muted-foreground">Topic: {lesson.topic}</p>
                                            </CardContent>
                                            <CardFooter>
                                                <Button className="w-full" onClick={() => router.push(`/student/resources?lesson=${lesson.id}`)}>
                                                    {isCompleted ? 'Review' : 'Start Lesson'}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">You have no assigned lessons. Explore the Resources tab to get started!</p>
                        )}
                    </CardContent>
                </CardHeader>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    