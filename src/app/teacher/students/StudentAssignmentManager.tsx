'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Student, Lesson, Quiz } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { topics as hardcodedTopics } from '@/lib/data';

/**
 * A component for teachers to manage lesson and quiz assignments for a specific student.
 * It allows filtering by grade and topic before assigning.
 * @param {object} props - Component props.
 * @param {Student} props.student - The student whose assignments are being managed.
 */
export function StudentAssignmentManager({ student }: { student: Student }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // Local state to manage assignments for immediate UI feedback
    const [assignedLessonIds, setAssignedLessonIds] = useState(new Set(student.assignedLessons || []));
    const [assignedQuizIds, setAssignedQuizIds] = useState(new Set(student.assignedQuizzes || []));

    // Effect to sync local state when the student prop changes
    useEffect(() => {
        setAssignedLessonIds(new Set(student.assignedLessons || []));
        setAssignedQuizIds(new Set(student.assignedQuizzes || []));
    }, [student.assignedLessons, student.assignedQuizzes]);

    // State for the filter dropdowns
    const [selectedGrade, setSelectedGrade] = useState<string>(String(student.grade));
    const [selectedTopic, setSelectedTopic] = useState<string>('all');

    const lessonsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'lessons');
    }, [user, firestore]);
    
    const quizzesQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'quizzes');
    }, [user, firestore]);
    
    const { data: allLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
    const { data: allQuizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);
    
    const isLoading = areLessonsLoading || areQuizzesLoading;

    // Memoized list of filtered lessons based on selected grade and topic
    const filteredLessons = useMemo(() => {
        if (!allLessons) return [];
        return allLessons.filter(lesson => {
            const gradeMatch = selectedGrade ? String(lesson.grade) === selectedGrade : true;
            const topicMatch = selectedTopic && selectedTopic !== 'all' ? lesson.topic === selectedTopic : true;
            return gradeMatch && topicMatch;
        });
    }, [allLessons, selectedGrade, selectedTopic]);
    
    const filteredQuizzes = useMemo(() => {
        if (!allQuizzes) return [];
        return allQuizzes.filter(quiz => {
            const gradeMatch = selectedGrade ? String(quiz.grade) === selectedGrade : true;
            const topicMatch = selectedTopic && selectedTopic !== 'all' ? quiz.topic === selectedTopic : true;
            return gradeMatch && topicMatch;
        });
    }, [allQuizzes, selectedGrade, selectedTopic]);

    // Handler for changing a lesson's assignment status
    const handleLessonAssignmentChange = async (lessonId: string, isAssigned: boolean) => {
        if (!firestore) return;

        // --- Immediate UI update ---
        const newAssignedLessonIds = new Set(assignedLessonIds);
        if (isAssigned) {
            newAssignedLessonIds.add(lessonId);
        } else {
            newAssignedLessonIds.delete(lessonId);
        }
        setAssignedLessonIds(newAssignedLessonIds);
        // --- End UI update ---

        const studentRef = doc(firestore, 'users', student.id);
        try {
            await updateDoc(studentRef, {
                assignedLessons: isAssigned ? arrayUnion(lessonId) : arrayRemove(lessonId)
            });
            toast({
                title: "Assignments updated",
                description: `${isAssigned ? 'Added' : 'Removed'} lesson for ${student?.name}.`
            });
        } catch (error) {
            console.error("Error updating lesson assignments: ", error);
            // Revert UI on error
            setAssignedLessonIds(new Set(student.assignedLessons || []));
            toast({
                variant: "destructive",
                title: "Update failed",
                description: "Could not update the student's lesson assignments."
            });
        }
    };
    
    const handleQuizAssignmentChange = async (quizId: string, isAssigned: boolean) => {
        if (!firestore) return;

        // --- Immediate UI update ---
        const newAssignedQuizIds = new Set(assignedQuizIds);
        if (isAssigned) {
            newAssignedQuizIds.add(quizId);
        } else {
            newAssignedQuizIds.delete(quizId);
        }
        setAssignedQuizIds(newAssignedQuizIds);
        // --- End UI update ---

        const studentRef = doc(firestore, 'users', student.id);
        try {
            await updateDoc(studentRef, {
                assignedQuizzes: isAssigned ? arrayUnion(quizId) : arrayRemove(quizId)
            });
            toast({
                title: "Assignments updated",
                description: `${isAssigned ? 'Added' : 'Removed'} quiz for ${student?.name}.`
            });
        } catch (error) {
            console.error("Error updating quiz assignments: ", error);
             // Revert UI on error
             setAssignedQuizIds(new Set(student.assignedQuizzes || []));
            toast({
                variant: "destructive",
                title: "Update failed",
                description: "Could not update the student's quiz assignments."
            });
        }
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader><CardTitle>Manage Assignments</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Assignments</CardTitle>
                <CardDescription>Filter by grade and topic, then select lessons and quizzes to assign to {student.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Grade Filter */}
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="grade-filter">Grade (Unit)</Label>
                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                            <SelectTrigger id="grade-filter">
                                <SelectValue placeholder="Filter by grade..." />
                            </SelectTrigger>
                            <SelectContent>
                                {[1,2,3,4,5].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Topic Filter */}
                    <div className="flex-1 space-y-2">
                        <Label htmlFor="topic-filter">Topic</Label>
                        <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                            <SelectTrigger id="topic-filter">
                                <SelectValue placeholder="Filter by topic..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Topics</SelectItem>
                                {hardcodedTopics.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                         <h4 className="font-semibold">Lessons</h4>
                         <div className="rounded-md border p-4 max-h-60 overflow-y-auto space-y-3">
                            {filteredLessons.length > 0 ? (
                                filteredLessons.map(lesson => (
                                    <div key={lesson.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`assign-lesson-${student.id}-${lesson.id}`}
                                            checked={assignedLessonIds.has(lesson.id)}
                                            onCheckedChange={(checked) => handleLessonAssignmentChange(lesson.id, !!checked)}
                                        />
                                        <Label htmlFor={`assign-lesson-${student.id}-${lesson.id}`} className="font-normal cursor-pointer">
                                            {lesson.title} (Lesson)
                                        </Label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No lessons found for the selected filters.
                                </p>
                            )}
                         </div>
                    </div>
                    <div className="space-y-3">
                        <h4 className="font-semibold">Quizzes</h4>
                         <div className="rounded-md border p-4 max-h-60 overflow-y-auto space-y-3">
                            {filteredQuizzes.length > 0 ? (
                                filteredQuizzes.map(quiz => (
                                    <div key={quiz.id} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`assign-quiz-${student.id}-${quiz.id}`}
                                            checked={assignedQuizIds.has(quiz.id)}
                                            onCheckedChange={(checked) => handleQuizAssignmentChange(quiz.id, !!checked)}
                                        />
                                        <Label htmlFor={`assign-quiz-${student.id}-${quiz.id}`} className="font-normal cursor-pointer">
                                            {quiz.title} (Quiz)
                                        </Label>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No quizzes found for the selected filters.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
