'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import type { Quiz, Lesson } from '@/lib/types';
import { topics } from '@/lib/data';
import { Edit, PlusCircle, Trash2, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Zod schema for a single question
const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text cannot be empty.'),
  options: z.array(z.string().min(1, 'Option cannot be empty.')).min(2, 'Must have at least two options.'),
  correctAnswer: z.string().min(1, 'Please select a correct answer.'),
});

// Zod schema for the entire quiz
const quizSchema = z.object({
  title: z.string().min(3, 'Title is too short.'),
  lessonId: z.string().optional(),
  grade: z.string().optional(),
  topic: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'A quiz must have at least one question.'),
  order: z.coerce.number().optional(),
  isPlacementTest: z.boolean().optional(),
}).refine(data => {
    return data.lessonId !== 'none' || (data.grade && data.topic);
}, {
    message: "If not linked to a lesson, Grade and Topic are required.",
    path: ['grade'], // You can point to a specific field
});


// Form for creating/editing a quiz
function QuizForm({ quiz, lessons, onSave, onClose }: { quiz?: Partial<Quiz>; lessons: Lesson[]; onSave: (data: z.infer<typeof quizSchema>) => void; onClose: () => void; }) {
  const form = useForm<z.infer<typeof quizSchema>>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: quiz?.title || '',
      lessonId: quiz?.lessonId || 'none',
      grade: String(quiz?.grade || ''),
      topic: quiz?.topic || '',
      questions: quiz?.questions || [{ questionText: '', options: ['', ''], correctAnswer: '' }],
      order: quiz?.order || 0,
      isPlacementTest: quiz?.isPlacementTest || false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });
  
  const { toast } = useToast();
  
  const onSubmit = (data: z.infer<typeof quizSchema>) => {
    for (const [index, q] of data.questions.entries()) {
      if (!q.options.includes(q.correctAnswer)) {
        toast({
          variant: 'destructive',
          title: 'Invalid Correct Answer',
          description: `The correct answer for question ${index + 1} is not one of the available options.`,
        });
        return;
      }
    }
    onSave(data);
  };
  
  const lessonId = form.watch('lessonId');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Quiz Metadata */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="col-span-2"><FormLabel>Quiz Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="lessonId" render={({ field }) => (
            <FormItem>
              <FormLabel>Linked Lesson</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a lesson" /></SelectTrigger></FormControl>
                <SelectContent><SelectItem value="none">None (Standalone Quiz)</SelectItem>{lessons.map(l => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Order (Advanced)</FormLabel>
                <FormControl><Input type="number" placeholder="e.g., 2" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>

        {lessonId === 'none' && (
             <div className="grid grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Grade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {[1, 2, 3, 4, 5].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="topic"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Topic</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {topics.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
        )}

         <FormField
          control={form.control}
          name="isPlacementTest"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Make this a placement test
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  If the student scores above an 80% on this, all previous lessons will be unlocked and so will the next lesson.
                </p>
              </div>
            </FormItem>
          )}
        />
        <hr/>
        
        {/* Questions Field Array */}
        <div className="space-y-6">
          <Label className='text-lg font-semibold'>Questions</Label>
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4 relative bg-background border">
                 <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => remove(index)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
                <div className="space-y-4">
                    <FormField control={form.control} name={`questions.${index}.questionText`} render={({ field }) => (
                        <FormItem><FormLabel>Question {index + 1}</FormLabel><FormControl><Input placeholder="e.g., What is 2 + 2?" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <Controller
                        control={form.control}
                        name={`questions.${index}.options`}
                        render={({ field }) => (
                            <div className="space-y-2">
                                <Label>Options</Label>
                                {field.value.map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center gap-2">
                                        <Input 
                                            value={option}
                                            onChange={(e) => {
                                                const newOptions = [...field.value];
                                                newOptions[optIndex] = e.target.value;
                                                field.onChange(newOptions);
                                            }}
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => {
                                            const newOptions = field.value.filter((_, i) => i !== optIndex);
                                            field.onChange(newOptions);
                                        }}>
                                            <XCircle className="w-4 h-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ))}
                                 <Button type="button" size="sm" variant="outline" onClick={() => field.onChange([...field.value, ''])}>Add Option</Button>
                            </div>
                        )}
                    />

                    <FormField control={form.control} name={`questions.${index}.correctAnswer`} render={({ field: RHFfield }) => (
                        <FormItem>
                          <FormLabel>Correct Answer</FormLabel>
                          <Select onValueChange={RHFfield.onChange} value={RHFfield.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select the correct option" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {form.getValues(`questions.${index}.options`).map((opt, optIndex) => (
                                  opt && <SelectItem key={optIndex} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )} />
                </div>
            </Card>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={() => append({ questionText: '', options: ['', ''], correctAnswer: '' })}>Add Question</Button>
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Quiz</Button>
        </div>
      </form>
    </Form>
  );
}


// Main component to manage quizzes
export function QuizManager({ selectedGrade }: { selectedGrade: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Partial<Quiz> | undefined>(undefined);

  const quizzesQuery = useMemoFirebase(() => user ? query(collection(firestore, 'quizzes'), where('teacherId', '==', user.uid)) : null, [user, firestore]);
  const lessonsQuery = useMemoFirebase(() => user ? query(collection(firestore, 'lessons'), where('teacherId', '==', user.uid)) : null, [user, firestore]);
  
  const { data: quizzes, isLoading: areQuizzesLoading } = useCollection<Quiz>(quizzesQuery);
  const { data: lessons, isLoading: areLessonsLoading } = useCollection<Lesson>(lessonsQuery);

  const filteredQuizzes = React.useMemo(() => {
    if (!quizzes) return [];
    if (selectedGrade === 'all') return quizzes;
    return quizzes.filter(q => String(q.grade) === selectedGrade);
  }, [quizzes, selectedGrade]);

  const sortedQuizzes = React.useMemo(() => {
    if (!filteredQuizzes) return [];
    return [...filteredQuizzes].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [filteredQuizzes]);

  const isLoading = areQuizzesLoading || areLessonsLoading;
  
  const handleOpenForm = (quiz?: Quiz) => {
    if (quiz) {
      setEditingQuiz(quiz);
    } else {
       // If creating a new quiz and a grade is filtered, pre-fill it.
       const newQuiz: Partial<Quiz> = {};
       if (selectedGrade !== 'all') {
         newQuiz.grade = parseInt(selectedGrade, 10);
       }
      setEditingQuiz(newQuiz);
    }
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setEditingQuiz(undefined);
    setIsFormOpen(false);
  };
  
  const handleSaveQuiz = async (data: z.infer<typeof quizSchema>) => {
     if (!user || !firestore || !lessons || !quizzes) return;
     
     let finalQuizData: Omit<Quiz, 'id'>;
     let gradeForOrder: string | undefined;

     if (data.lessonId && data.lessonId !== 'none') {
        const linkedLesson = lessons.find(l => l.id === data.lessonId);
        if (!linkedLesson) {
            toast({ variant: "destructive", title: "Error", description: "Selected lesson not found." });
            return;
        }
        gradeForOrder = String(linkedLesson.grade);
        finalQuizData = {
            title: data.title,
            lessonId: data.lessonId,
            questions: data.questions,
            isPlacementTest: data.isPlacementTest,
            grade: linkedLesson.grade,
            topic: linkedLesson.topic,
            teacherId: user.uid,
        };
     } else {
        if (!data.grade || !data.topic) {
             toast({ variant: "destructive", title: "Error", description: "Grade and topic are required for standalone quizzes." });
             return;
        }
        gradeForOrder = data.grade;
        finalQuizData = {
            title: data.title,
            questions: data.questions,
            isPlacementTest: data.isPlacementTest,
            grade: parseInt(data.grade),
            topic: data.topic,
            teacherId: user.uid,
        };
     }

    let finalOrder = data.order;
    if (!editingQuiz?.id && gradeForOrder) { // Only auto-increment for new quizzes and if grade is known
        const allContentForGrade = [
            ...(lessons?.filter(l => String(l.grade) === gradeForOrder) || []),
            ...(quizzes?.filter(q => String(q.grade) === gradeForOrder) || [])
        ];
        finalOrder = (allContentForGrade.length > 0)
            ? Math.max(...allContentForGrade.map(c => c.order || 0)) + 1
            : 1;
    }
    
    try {
        if (editingQuiz && 'id' in editingQuiz) {
            const quizRef = doc(firestore, 'quizzes', editingQuiz.id!);
            await updateDoc(quizRef, { ...finalQuizData, order: data.order });
            toast({ title: 'Success', description: 'Quiz updated successfully.' });
        } else {
            await addDoc(collection(firestore, 'quizzes'), { ...finalQuizData, order: finalOrder });
            toast({ title: 'Success', description: 'Quiz created successfully.' });
        }
        handleCloseForm();
    } catch(e) {
        console.error("Error saving quiz: ", e);
        toast({ variant: "destructive", title: 'Error', description: 'Could not save the quiz.' });
    }
  };
  
   const handleDeleteQuiz = async (quizId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'quizzes', quizId));
      toast({ title: 'Success', description: 'Quiz deleted successfully.' });
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the quiz.' });
    }
  };

  if (isLoading) {
    return <Card><CardHeader><CardTitle>Manage Quizzes</CardTitle></CardHeader><CardContent><Skeleton className="h-48 w-full" /></CardContent></Card>
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Quizzes</CardTitle>
          <CardDescription>Create and edit quizzes for your lessons.</CardDescription>
        </div>
        <Dialog open={isFormOpen} onOpenChange={(open) => {
            if (!open) handleCloseForm();
            else setIsFormOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenForm()}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingQuiz && 'id' in editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</DialogTitle>
            </DialogHeader>
            <QuizForm quiz={editingQuiz} lessons={lessons || []} onSave={handleSaveQuiz} onClose={handleCloseForm} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedQuizzes && sortedQuizzes.length > 0 ? (
            sortedQuizzes.map(quiz => (
              <Card key={quiz.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{quiz.title} {quiz.isPlacementTest && <span className="text-xs font-semibold text-accent border border-accent/50 bg-accent/10 px-2 py-1 rounded-full ml-2">Placement Test</span>}</p>
                  <p className="text-sm text-muted-foreground">
                    Grade {quiz.grade} &middot; {quiz.topic} &middot; Order: {quiz.order ?? 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(quiz)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>This will permanently delete the quiz.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteQuiz(quiz.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">{selectedGrade === 'all' ? "You haven't created any quizzes yet." : `No quizzes found for Grade ${selectedGrade}.`}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
