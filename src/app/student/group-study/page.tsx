
'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, where, Timestamp, addDoc, doc, getDocs, updateDoc, arrayUnion } from 'firebase/firestore';
import type { GroupStudySession, Student } from '@/lib/types';
import { format } from 'date-fns';
import { Calendar, Clock, Video, PlusCircle, Users, Edit, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { topics } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

// Zod schema for validating the new/edit group study form
const studyFormSchema = z.object({
  topic: z.string().min(1, "Please select a topic."),
  date: z.date({ required_error: "A date is required." }).optional(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:MM format.").optional(),
  durationMinutes: z.coerce.number().min(15, "Duration must be at least 15 minutes."),
  meetingLink: z.string().url("Please enter a valid URL."),
  invitedStudentUsernames: z.string().optional(),
});

function StudySessionDialog({ student, session, children }: { student: Student | null, session?: GroupStudySession, children: React.ReactNode }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isOpen, setIsOpen] = useState(false);
    const isEditMode = !!session;

    const defaultValues = isEditMode ? {
        topic: session.topic,
        durationMinutes: session.durationMinutes,
        meetingLink: session.meetingLink,
        invitedStudentUsernames: (session.invitedStudentUsernames || []).join(', '),
    } : {
        topic: '',
        time: '16:00',
        durationMinutes: 60,
        meetingLink: '',
        invitedStudentUsernames: ''
    };
    
    const form = useForm<z.infer<typeof studyFormSchema>>({
        resolver: zodResolver(studyFormSchema),
        defaultValues,
    });

    React.useEffect(() => {
        if (isEditMode) {
            form.reset(defaultValues);
        }
    }, [session, isEditMode, form]);

    const onSubmit = async (values: z.infer<typeof studyFormSchema>) => {
        if (!user || !student || !firestore) return;

        const invitedUsernames = values.invitedStudentUsernames ? values.invitedStudentUsernames.split(',').map(u => u.trim()).filter(Boolean) : [];

        // Validate usernames exist (only if they are changed or new)
        if (invitedUsernames.length > 0) {
            const usernamesCollection = collection(firestore, 'usernames');
            const q = query(usernamesCollection, where('__name__', 'in', invitedUsernames));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.docs.length !== invitedUsernames.length) {
                toast({ variant: 'destructive', title: 'Invalid Username', description: "One or more invited usernames could not be found." });
                return;
            }
        }
        
        try {
            if (isEditMode) {
                // Update existing session
                const sessionRef = doc(firestore, 'group_study_sessions', session.id);
                await updateDoc(sessionRef, {
                    topic: values.topic,
                    durationMinutes: values.durationMinutes,
                    meetingLink: values.meetingLink,
                    invitedStudentUsernames: invitedUsernames,
                });
                toast({ title: 'Success!', description: 'Your study session has been updated.' });

            } else {
                 // Create new session
                if (!values.date || !values.time) {
                    toast({ variant: 'destructive', title: 'Error', description: 'Date and time are required to create a session.' });
                    return;
                }
                const [hour, minute] = values.time.split(':').map(Number);
                const startTime = new Date(values.date);
                startTime.setHours(hour, minute);

                const newSession: Omit<GroupStudySession, 'id'> = {
                    hostId: user.uid,
                    hostName: student.name,
                    topic: values.topic,
                    startTime: Timestamp.fromDate(startTime),
                    durationMinutes: values.durationMinutes,
                    meetingLink: values.meetingLink,
                    invitedStudentUsernames: invitedUsernames,
                    attendingStudentIds: [user.uid],
                    attendingStudentNames: [student.name],
                };
                await addDoc(collection(firestore, 'group_study_sessions'), newSession);
                toast({ title: 'Success!', description: 'Your group study session has been created.' });
                form.reset(defaultValues);
            }
            
            setIsOpen(false);
        } catch (error) {
            console.error("Error saving session:", error);
            toast({ variant: 'destructive', title: 'Error', description: `Could not ${isEditMode ? 'update' : 'create'} the session.` });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit' : 'Create'} a Group Study Session</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? 'Update the details for your session.' : 'Set a topic and time to study with your friends.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="topic" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Topic</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger></FormControl>
                                    <SelectContent>{topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {isEditMode ? (
                            <div className="space-y-2">
                                <FormLabel>Date & Time</FormLabel>
                                <Input value={`${format(session.startTime.toDate(), 'PPP')} at ${format(session.startTime.toDate(), 'p')}`} disabled />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="date" render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild><FormControl>
                                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                    <Calendar className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl></PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <CalendarPicker mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="time" render={({ field }) => (
                                    <FormItem><FormLabel>Time</FormLabel><FormControl><Input placeholder="HH:MM" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        )}

                         <FormField control={form.control} name="durationMinutes" render={({ field }) => (
                            <FormItem><FormLabel>Duration (Minutes)</FormLabel><FormControl><Input type="number" placeholder="60" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="meetingLink" render={({ field }) => (
                            <FormItem><FormLabel>Meeting Link</FormLabel><FormControl><Input placeholder="https://meet.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="invitedStudentUsernames" render={({ field }) => (
                            <FormItem><FormLabel>Invite Students (by username)</FormLabel><FormControl><Input placeholder="username1, username2, ..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Session'}</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}


export default function GroupStudyPage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();

    const studentDocRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
    const { data: student, isLoading: isStudentLoading } = useDoc<Student>(studentDocRef);

    const hostedQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return query(collection(firestore, 'group_study_sessions'), where('hostId', '==', user.uid));
    }, [firestore, user]);

    const invitedQuery = useMemoFirebase(() => {
        if (!student || !firestore) return null;
        return query(collection(firestore, 'group_study_sessions'), where('invitedStudentUsernames', 'array-contains', student.username));
    }, [firestore, student]);

    const { data: hostedSessions, isLoading: areHostedLoading } = useCollection<GroupStudySession>(hostedQuery);
    const { data: invitedSessions, isLoading: areInvitedLoading } = useCollection<GroupStudySession>(invitedQuery);
    
    const isLoading = isUserLoading || isStudentLoading || areHostedLoading || areInvitedLoading;
    
    const handleJoinSession = async (session: GroupStudySession) => {
        if (!user || !student || !firestore) return;
        if (session.attendingStudentIds.includes(user.uid)) {
            toast({ description: "You are already in this session." });
            return;
        }
        
        try {
            const sessionRef = doc(firestore, 'group_study_sessions', session.id);
            await updateDoc(sessionRef, {
                attendingStudentIds: arrayUnion(user.uid),
                attendingStudentNames: arrayUnion(student.name),
            });
             toast({ title: 'Success!', description: `You've joined the study session for ${session.topic}.` });
        } catch (error) {
             console.error("Error joining session:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not join the session.' });
        }
    }


    if (isLoading) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold font-headline">Group Study</h1>
                    <Skeleton className="h-10 w-44" />
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                </div>
            </div>
        )
    }
    
    return (
        <div className="p-4 sm:p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-headline">Group Study</h1>
                <StudySessionDialog student={student}>
                     <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Session
                    </Button>
                </StudySessionDialog>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* My Hosted Sessions */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">My Hosted Sessions</h2>
                    {hostedSessions && hostedSessions.length > 0 ? (
                        hostedSessions.map(session => (
                            <Card key={session.id}>
                                <CardHeader><CardTitle>{session.topic}</CardTitle></CardHeader>
                                <CardContent className="space-y-2">
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>{format(session.startTime.toDate(), 'PPP')}</span></div>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{format(session.startTime.toDate(), 'p')}</span></div>
                                     <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="w-4 h-4" /><span>Attending: {session.attendingStudentNames.join(', ')}</span></div>
                                </CardContent>
                                <CardFooter className="gap-2">
                                    <Button asChild><Link href={session.meetingLink} target="_blank"><Video className="mr-2 h-4 w-4" />Start Session</Link></Button>
                                    <StudySessionDialog student={student} session={session}>
                                        <Button variant="outline"><Edit className="mr-2 h-4 w-4" />Edit</Button>
                                    </StudySessionDialog>
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <p className="text-muted-foreground">You haven't hosted any sessions yet.</p>
                    )}
                </div>

                {/* My Invitations */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">My Invitations</h2>
                    {invitedSessions && invitedSessions.length > 0 ? (
                         invitedSessions.map(session => {
                            const hasJoined = session.attendingStudentIds.includes(user?.uid || '');
                            return (
                                <Card key={session.id}>
                                    <CardHeader>
                                        <CardTitle>{session.topic}</CardTitle>
                                        <CardDescription>Hosted by {session.hostName}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>{format(session.startTime.toDate(), 'PPP')}</span></div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Clock className="w-4 h-4" /><span>{format(session.startTime.toDate(), 'p')}</span></div>
                                    </CardContent>
                                    <CardFooter className="gap-2">
                                        {hasJoined ? (
                                            <Button asChild><Link href={session.meetingLink} target="_blank"><Video className="mr-2 h-4 w-4" />Join Session</Link></Button>
                                        ) : (
                                            <Button onClick={() => handleJoinSession(session)}><UserPlus className="mr-2 h-4 w-4" />Join Session</Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            )
                         })
                    ) : (
                        <p className="text-muted-foreground">You have no pending invitations.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
    

    

    