'use client';

import React, { useState, useMemo } from 'react';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import type { Student, Lesson, Topic } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

/**
 * A component for teachers to manage lesson assignments for a specific student.
 * It allows filtering lessons by grade and topic before assigning.
 * @param {object} props - Component props.
 * @param {Student} props.student - The student whose assignments are being managed.
 */
export function StudentAssignmentManager({ student }: { student: Student }) {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    
    // State for the filter dropdowns
    const [selectedGrade, setSelectedGrade] = useState<string>(String(student.grade));
    const [selectedTopic, setSelectedTopic] = useState<string>('all');

    const lessonsQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'lessons');
    }, [user, firestore]);
    const topicsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'topics') : null, [firestore]);
    
    const { data: allLessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);
    const { data: allTopics, isLoading: areTopicsLoading } = useCollection<Topic>(topicsQuery);
    
    const isLoading = isUserLoading || areLessonsLoading || areTopicsLoading;

    // Memoized list of filtered lessons based on selected grade and topic
    const filteredLessons = useMemo(() => {
        if (!allLessons) return [];
        return allLessons.filter(lesson => {
            const gradeMatch = selectedGrade ? String(lesson.grade) === selectedGrade : true;
            const topicMatch = selectedTopic && selectedTopic !== 'all' ? lesson.topic === selectedTopic : true;
            return gradeMatch && topicMatch;
        });
    }, [allLessons, selectedGrade, selectedTopic]);

    // Handler for changing a lesson's assignment status
    const handleAssignmentChange = async (lessonId: string, isAssigned: boolean) => {
        if (!firestore) return;
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
            <Card>
                <CardHeader><CardTitle>Manage Assignments</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-48 w-full" /></CardContent>
            </Card>
        );
    }
    
    const assignedLessonIds = new Set(student.assignedLessons || []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Assignments</CardTitle>
                <CardDescription>Filter by grade and topic, then select lessons to assign to {student.name}.</CardDescription>
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
                                {allTopics?.map(topic => <SelectItem key={topic.id} value={topic.name}>{topic.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3 rounded-md border p-4 max-h-60 overflow-y-auto">
                    {filteredLessons.length > 0 ? (
                        filteredLessons.map(lesson => (
                            <div key={lesson.id} className="flex items-center space-x-3">
                                <Checkbox
                                    id={`assign-${student.id}-${lesson.id}`}
                                    checked={assignedLessonIds.has(lesson.id)}
                                    onCheckedChange={(checked) => handleAssignmentChange(lesson.id, !!checked)}
                                />
                                <Label htmlFor={`assign-${student.id}-${lesson.id}`} className="font-normal cursor-pointer">
                                    {lesson.title}
                                </Label>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No lessons found for the selected filters.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
