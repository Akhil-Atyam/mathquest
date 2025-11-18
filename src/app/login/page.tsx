'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';
import {
  initiateEmailSignUp,
  createUserProfile,
  initiateEmailSignIn,
  setTeacherRole,
  getUserEmailForUsername,
  isTeacher as isTeacherRole,
} from '@/firebase/auth/auth-provider';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import type { Student, Teacher } from '@/lib/types';
import { FirebaseError } from 'firebase/app';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Zod schema for validating the student sign-up form.
const studentSignUpSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  grade: z.string().refine(val => !isNaN(parseInt(val)), { message: "Please select a grade." }),
});

// Zod schema for validating the teacher sign-up form.
const teacherSignUpSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

// Zod schema for validating the sign-in form.
const signInSchema = z.object({
  username: z.string().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.'),
});

/**
 * A reusable authentication form component for sign-up and sign-in.
 * It handles form state, validation, and submission for both students and teachers.
 * @param {object} props - The component props.
 * @param {'student' | 'teacher' | 'signin'} props.formType - The type of form to render.
 */
function AuthForm({
  formType,
}: {
  formType: 'student' | 'teacher' | 'signin';
}) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamically select the correct validation schema based on the form type.
  const formSchema = 
    formType === 'signin' 
      ? signInSchema 
      : formType === 'teacher'
      ? teacherSignUpSchema
      : studentSignUpSchema;

  // Initialize react-hook-form with the selected schema.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      ...(formType !== 'signin' && { name: '', email: '' }),
      ...(formType === 'student' && { grade: '' }),
    },
  });

  /**
   * Handles the form submission logic.
   * It calls the appropriate Firebase authentication and database functions.
   * @param {object} values - The validated form values.
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (formType === 'student' || formType === 'teacher') {
        if ('email' in values && 'password' in values) {
            
            // Create the user account with email and password.
            const userCredential = await initiateEmailSignUp(
                auth,
                values.email,
                values.password
            );
    
            const user = userCredential.user;
            // If sign-up is successful, create a user profile document in Firestore.
            if ('name' in values && 'username' in values) {
    
            if (formType === 'student' && 'grade' in values) {
                const profileData = {
                    id: user.uid,
                    name: values.name,
                    username: values.username,
                    email: user.email!,
                    grade: parseInt(values.grade, 10),
                };
                await createUserProfile(
                    user.uid,
                    profileData as Omit<
                        Student,
                        'completedLessons' | 'quizScores' | 'badges'
                    >,
                    'student'
                );
            } else if (formType === 'teacher') {
                const profileData = {
                    id: user.uid,
                    name: values.name,
                    username: values.username,
                    email: user.email!,
                };
                await createUserProfile(
                    user.uid,
                    profileData as Omit<Teacher, 'availability'>,
                    'teacher'
                );
            }
            }
    
            // If the role is teacher, assign the teacher role in Firestore for DBAC.
            if (formType === 'teacher') {
              await setTeacherRole(user.uid);
            }

            toast({
              title: 'Account Created',
              description: "You're all set! Redirecting to your dashboard.",
            });
            router.push(`/${formType}/dashboard`);
        }
      } else { // Sign In
        if ('username' in values) {
            const email = await getUserEmailForUsername(values.username);
            if (!email) {
                throw new Error("Username not found.");
            }
            const userCredential = await initiateEmailSignIn(auth, email, values.password);
            
            // After sign-in, check if the user is a teacher to redirect correctly
            const isTeacher = await isTeacherRole(userCredential.user.uid);
            const redirectPath = isTeacher ? '/teacher/dashboard' : '/student/dashboard';

            toast({
              title: 'Signed In',
              description: "Welcome back! Redirecting to your dashboard.",
            });
            router.push(redirectPath);
        }
      }
    } catch (error: any) {
      console.error(`${formType !== 'signin' ? 'Sign-up' : 'Sign-in'} error:`, error);
      
      let description = `Could not ${ formType !== 'signin' ? 'create your account' : 'sign you in' }. Please try again.`;
      if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
        description = "This email is already registered. Please try signing in or use a different email.";
      } else if (error.message) {
        description = error.message;
      }
      
      // Display an error toast on failure.
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: description,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (formType === 'signin') {
      return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="your_username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Sign In'}
              </Button>
          </form>
      </Form>
      )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="your_username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {formType === 'student' && (
          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your grade level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(grade => (
                        <SelectItem key={grade} value={String(grade)}>Grade {grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? 'Processing...'
            : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
}

/**
 * The main login page component.
 * It uses a tabbed interface to switch between sign-in and sign-up forms.
 */
export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <Tabs defaultValue="signin" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Create Account</TabsTrigger>
          </TabsList>
          
          {/* Sign In Form */}
          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Access your MathQuest dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AuthForm formType="signin" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sign Up Forms */}
          <TabsContent value="signup">
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="student">I'm a Student</TabsTrigger>
                <TabsTrigger value="teacher">I'm a Teacher</TabsTrigger>
              </TabsList>
              <TabsContent value="student">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Student Account</CardTitle>
                    <CardDescription>
                      Start your math adventure today!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuthForm formType="student" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="teacher">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Teacher Account</CardTitle>
                    <CardDescription>
                      Create an account to manage sessions and resources.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuthForm formType="teacher" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
