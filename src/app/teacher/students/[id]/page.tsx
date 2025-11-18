'use client';

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import type { Student, Lesson, Quiz } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, CheckCircle2, ListChecks } from 'lucide-react';
import { badges as allBadges } from '@/lib/data';
import { StudentAssignmentManager } from './StudentAssignmentManager';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * A dynamic page that displays detailed progress for a single student.
 * @param {object} props - Component props from Next.js.
 * @param {object} props.params - Dynamic route parameters.
 * @param {string} props.params.id - The ID of the student to display.
 */
export default function StudentProgressPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();

    const studentDocRef = useMemoFirebase(() => {
        if (!firestore || !params.id) return null;
        return doc(firestore, 'users', params.id);
    }, [firestore, params.id]);
    
    const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);
    
    const lessonsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'lessons') : null, [firestore]);
    const { data: lessons, isLoading: areLessonsLoading } = useDoc<Lesson[]>(lessonsCollectionRef);
    
    const quizzesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'quizzes') : null, [firestore]);
    const { data: quizzes, isLoading: areQuizzesLoading } = useDoc<Quiz[]>(quizzesCollectionRef);

    const isLoading = isStudentLoading || areLessonsLoading || areQuizzesLoading;

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    if (!student) {
        return notFound();
    }
    
    const assignedLessons = student.assignedLessons || [];
    const completedLessons = student.completedLessons || [];
    const completedAssignedLessons = assignedLessons.filter(lessonId => completedLessons.includes(lessonId));
    const progressPercentage = assignedLessons.length > 0
        ? (completedAssignedLessons.length / assignedLessons.length) * 100
        : 0;

    const completedLessonsData = lessons?.filter(l => completedLessons.includes(l.id)) || [];
    const completedQuizzesData = quizzes?.filter(q => Object.keys(student.quizScores || {}).includes(q.id)) || [];
    const earnedBadges = allBadges.filter(b => (student.badges || []).includes(b.id));

    return (
        <div className="p-4 sm:p-6 space-y-6">
            <Button variant="ghost" asChild className="mb-4">
                <Link href="/teacher/students">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Students
                </Link>
            </Button>
            <h1 className="text-3xl font-bold font-headline">Progress for {student.name}</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <ListChecks /> Assigned Progress
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                    {completedAssignedLessons.length} of {assignedLessons.length} assigned lessons completed
                    </p>
                    <Progress value={progressPercentage} className="w-full" />
                    {assignedLessons.length === 0 && <p className="text-center text-sm mt-2 text-muted-foreground">No lessons assigned yet.</p>}
                </CardContent>
                </Card>

                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Award /> Earned Badges
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {earnedBadges.length > 0 ? earnedBadges.map(badge => (
                    <Badge key={badge.id} variant="secondary" className="text-sm py-1 px-3">
                        <badge.icon className="w-4 h-4 mr-2 text-accent"/>
                        {badge.name}
                    </Badge>
                    )) : <p className="text-sm text-muted-foreground">No badges earned yet.</p>}
                </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 /> Completed Activities
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="font-semibold mb-2">Lessons</h3>
                            <ul className="space-y-2">
                            {completedLessonsData.length > 0 ? completedLessonsData.map(lesson => (
                                <li key={lesson.id} className="text-sm text-muted-foreground">{lesson.title}</li>
                            )) : <p className="text-sm text-muted-foreground">No lessons completed yet.</p>}
                            </ul>
                        </div>
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

            <StudentAssignmentManager student={student} />
        </div>
    )
}