'use client';
import { resources, quizzes, badges as allBadges } from '@/lib/data';
import type { Student } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Award, ListChecks } from 'lucide-react';
import { PersonalizedPathClient } from './PersonalizedPathClient';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * The main page for the student dashboard.
 * This client component fetches and displays an overview of the logged-in student's progress,
 * including completed activities, earned badges, and a personalized learning path.
 */
export default function StudentDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const studentDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);
  
  // While data is loading, show a skeleton UI to provide better user experience.
  if (isUserLoading || isStudentLoading || !student) {
    return (
      <div className="p-4 sm:p-6 space-y-6">
        <Skeleton className="h-9 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-6 w-32" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-24" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Once data is loaded, prepare it for rendering.
  // These fallback to empty arrays/objects if the student data isn't fully populated.
  const completedLessonsData = resources.filter(r => (student.completedLessons || []).includes(r.id));
  const completedQuizzesData = quizzes.filter(q => Object.keys(student.quizScores || {}).includes(q.id));
  const earnedBadges = allBadges.filter(b => (student.badges || []).includes(b.id));

  const progressPercentage = ((student.completedLessons?.length || 0) / resources.length) * 100;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Welcome back, {student.name}!</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Card to display overall progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks /> My Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">
              {student.completedLessons?.length || 0} of {resources.length} lessons completed
            </p>
            <Progress value={progressPercentage} className="w-full" />
            <p className="text-center text-sm mt-2 font-medium text-primary animate-pulse">Keep up the great work!</p>
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

      {/* Personalized Learning Path section, rendered by a client component */}
      <div>
        <PersonalizedPathClient student={student} />
      </div>

      {/* Card to display a list of completed activities */}
      <div>
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
                      <span className="font-bold text-primary">{student.quizScores[quiz.id]}%</span>
                    </li>
                  )) : <p className="text-sm text-muted-foreground">No quizzes completed yet.</p>}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
