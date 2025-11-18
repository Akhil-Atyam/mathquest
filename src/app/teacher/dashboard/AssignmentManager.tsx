'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Student, Lesson } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

function StudentAssignmentDetail({ studentId }: { studentId: string }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    const studentRef = useMemoFirebase(() => firestore ? doc(firestore, 'users', studentId) : null, [firestore, studentId]);
    const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentRef);

    const lessonsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'lessons');
    }, [user, firestore]);
    const { data: allLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
    
    const isLoading = isStudentLoading || areLessonsLoading;

    const handleAssignmentChange = async (lessonId: string, isAssigned: boolean) => {
        if (!studentRef) return;

        try {
            await updateDoc(studentRef, {
                assignedLessons: isAssigned ? arrayUnion(lessonId) : arrayRemove(lessonId)
            });
            toast({
                title: "Assignments updated",
                description: `${isAssigned ? 'Added' : 'Removed'} lesson for ${student?.name}.`
            });
        } catch (error) {
            console.error("Error updating assignments: ", error);
            toast({
                variant: "destructive",
                title: "Update failed",
                description: "Could not update the student's assignments."
            });
        }
    };

    if (isLoading) {
        return (
            <div className="mt-4 space-y-4">
                <Skeleton className="h-8 w-1/3" />
                <div className="space-y-2">
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                </div>
            </div>
        );
    }

    if (!student || !allLessons) {
        return <p className="mt-4 text-muted-foreground">Could not load student or lesson data.</p>;
    }

    const assignedLessonIds = new Set(student.assignedLessons || []);

    return (
        <div className="mt-4 space-y-4">
            <h3 className="font-semibold">Assign Lessons for {student.name} (Grade {student.grade})</h3>
            <div className="space-y-3 rounded-md border p-4">
                {allLessons.filter(l => l.grade === student.grade).length > 0 ? (
                    allLessons.filter(l => l.grade === student.grade).map(lesson => (
                        <div key={lesson.id} className="flex items-center space-x-2">
                            <Checkbox
                                id={`assign-${student.id}-${lesson.id}`}
                                checked={assignedLessonIds.has(lesson.id)}
                                onCheckedChange={(checked) => handleAssignmentChange(lesson.id, !!checked)}
                            />
                            <Label htmlFor={`assign-${student.id}-${lesson.id}`} className="font-normal">
                                {lesson.title} <span className="text-muted-foreground">({lesson.topic})</span>
                            </Label>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No lessons found for this student's grade level.</p>
                )}
            </div>
        </div>
    );
}

export function AssignmentManager() {
    const firestore = useFirestore();
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');

    const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: students, isLoading } = useCollection<Student>(studentsQuery);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Manage Assignments</CardTitle>
                    <CardDescription>Assign lessons to your students individually.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-10 w-1/2" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Assignments</CardTitle>
                <CardDescription>Assign lessons to your students individually.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="max-w-sm space-y-2">
                    <Label htmlFor="student-select">Select a Student</Label>
                    <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                        <SelectTrigger id="student-select">
                            <SelectValue placeholder="Select a student to manage..." />
                        </SelectTrigger>
                        <SelectContent>
                            {students && students.length > 0 ? (
                                students.map(student => (
                                    <SelectItem key={student.id} value={student.id}>{student.name} - Grade {student.grade}</SelectItem>
                                ))
                            ) : (
                                <SelectItem value="none" disabled>No students found</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {selectedStudentId && <StudentAssignmentDetail studentId={selectedStudentId} />}
            </CardContent>
        </Card>
    );
}
