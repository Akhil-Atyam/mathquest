'use client';

import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import type { Student, Lesson, Quiz } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Award, CheckCircle2, ListChecks } from 'lucide-react';
import { badges as allBadges } from '@/lib/data';
import { StudentAssignmentManager } from './StudentAssignmentManager';

/**
 * A component that displays detailed progress for a single student.
 * @param {object} props - Component props.
 * @param {Student} props.student - The student object to display progress for.
 */
export function StudentProgressDetail({ student }: { student: Student }) {
    const firestore = useFirestore();
    
    // We can assume student data is already loaded and passed as a prop.
    // So we only need to fetch lessons and quizzes.
    const lessonsCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'lessons') : null, [firestore]);
    const { data: lessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsCollectionRef);
    
    // Note: Quizzes are currently from mock data, but this setup allows for easy Firestore integration.
    const quizzesCollectionRef = useMemoFirebase(() => firestore ? collection(firestore, 'quizzes') : null, [firestore]);
    const { data: quizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesCollectionRef);

    const isLoading = areLessonsLoading || areQuizzesLoading;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-1/3 mb-4" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    const assignedLessons = student.assignedLessons || [];
    const completedLessons = student.completedLessons || [];
    const completedAssignedLessons = assignedLessons.filter(lessonId => completedLessons.includes(lessonId));
    const progressPercentage = assignedLessons.length > 0
        ? (completedAssignedLessons.length / assignedLessons.length) * 100
        : 0;

    const completedLessonsData = lessons?.filter(l => completedLessons.includes(l.id)) || [];
    // Assuming quizzes are still from mock data, otherwise fetch them.
    const completedQuizzesData = quizzes?.filter(q => Object.keys(student.quizScores || {}).includes(q.id)) || [];
    const earnedBadges = allBadges.filter(b => (student.badges || []).includes(b.id));

    return (
        <div className="space-y-6">
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
