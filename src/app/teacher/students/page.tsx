'use client';

import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Student } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

/**
 * A page for teachers to view a list of all students in the system.
 */
export default function StudentsListPage() {
    const firestore = useFirestore();

    const studentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'users') : null, [firestore]);
    const { data: students, isLoading } = useCollection<Student>(studentsQuery);

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
                                        <TableCell className="text-right">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/teacher/students/${student.id}`}>
                                                    View Progress <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
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