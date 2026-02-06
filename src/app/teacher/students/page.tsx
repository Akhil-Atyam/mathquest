
'use client';

import React, { useState } from 'react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, deleteDoc, doc, getDoc, writeBatch } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { StudentProgressDetail } from './StudentProgressDetail';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


/**
 * A page for teachers to view a list of all students in the system.
 * It now handles displaying both the list and the detailed view of a single student.
 */
export default function StudentsListPage() {
    const firestore = useFirestore();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const { toast } = useToast();

    const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: students, isLoading } = useCollection<Student>(studentsQuery);

    const handleDeleteStudent = async (studentToDelete: Student) => {
        if (!firestore) return;

        const userDocRef = doc(firestore, 'users', studentToDelete.id);
        
        try {
            const batch = writeBatch(firestore);

            // Delete the main user profile document
            batch.delete(userDocRef);

            // Only attempt to delete the username document if a username exists
            if (studentToDelete.username) {
                const usernameDocRef = doc(firestore, 'usernames', studentToDelete.username);
                batch.delete(usernameDocRef);
            }

            await batch.commit();
            
            toast({
                title: "Student Data Deleted",
                description: `${studentToDelete.name}'s application data has been successfully deleted.`
            })
            // If the deleted student was the one being viewed, go back to the list
            if(selectedStudent?.id === studentToDelete.id) {
                setSelectedStudent(null);
            }
        } catch (error) {
             console.error("Error deleting student:", error);
             toast({
                variant: 'destructive',
                title: "Error Deleting Student",
                description: `Could not delete ${studentToDelete.name}. Please try again.`
             })
        }
    }

    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                <h1 className="text-3xl font-bold font-headline">My Students</h1>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }
    
    if (selectedStudent) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                 <Button variant="ghost" onClick={() => setSelectedStudent(null)} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Students
                </Button>
                <StudentProgressDetail student={selectedStudent} />
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 space-y-6">
             <h1 className="text-3xl font-bold font-headline">My Students</h1>
            <Card>
                <CardHeader>
                    <CardTitle>All Students</CardTitle>
                    <CardDescription>Select a student to view their progress and manage their assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {students && students.length > 0 ? (
                                students.map(student => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.name}</TableCell>
                                        <TableCell>{student.grade}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedStudent(student)}>
                                                View Progress <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                             <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the application data
                                                        for <strong>{student.name}</strong>, including their progress and assignments.
                                                        It will NOT delete their core login credential from Firebase Authentication.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteStudent(student)}>
                                                        Yes, delete student data
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
