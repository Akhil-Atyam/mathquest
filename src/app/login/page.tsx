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
import { useEffect, useState } from 'react';
import type { Student, Teacher } from '@/lib/types';
import { FirebaseError } from 'firebase/app';

// Zod schema for validating the student sign-up form.
const studentSignUpSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

// Zod schema for validating the teacher sign-up form, including the teacher code.
const teacherSignUpSchema = z.object({
  name: z.string().min(2, 'Name is too short.'),
  username: z.string().min(3, 'Username must be at least 3 characters.'),
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  teacherCode: z.string().min(1, 'Teacher code is required.'),
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
 * @param {boolean} props.isSignUp - Flag to determine if the form is for sign-up or sign-in.
 * @param {'student' | 'teacher'} props.role - The role of the user.
 */
function AuthForm({
  isSignUp,
  role,
}: {
  isSignUp: boolean;
  role: 'student' | 'teacher';
}) {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamically select the correct validation schema based on the role and form type.
  const formSchema =
    role === 'teacher' && isSignUp
      ? teacherSignUpSchema
      : isSignUp
      ? studentSignUpSchema
      : signInSchema;

  // Initialize react-hook-form with the selected schema.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
      ...(isSignUp && { name: '', email: '' }),
      ...(role === 'teacher' && isSignUp && { teacherCode: '' }),
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
      if (isSignUp) {
        if ('email' in values && 'password' in values) {
            // For teacher sign-up, validate the secret code.
            if (role === 'teacher') {
                const teacherSecretCode = process.env.NEXT_PUBLIC_TEACHER_SECRET_CODE;
                if (
                    'teacherCode' in values &&
                    values.teacherCode !== teacherSecretCode
                ) {
                    throw new Error('Invalid Teacher Code.');
                }
            }
    
            // Create the user account with email and password.
            const userCredential = await initiateEmailSignUp(
                auth,
                values.email,
                values.password
            );
    
            const user = userCredential.user;
            // If sign-up is successful, create a user profile document in Firestore.
            if ('name' in values && 'username' in values) {
            const profileData = {
                id: user.uid,
                name: values.name,
                username: values.username,
                email: user.email!,
            };
    
            if (role === 'student') {
                createUserProfile(
                    user.uid,
                    profileData as Omit<
                        Student,
                        'grade' | 'completedLessons' | 'quizScores' | 'badges'
                    >,
                    'student'
                );
            } else {
                createUserProfile(
                    user.uid,
                    profileData as Omit<Teacher, 'availability'>,
                    'teacher'
                );
            }
            }
    
            // If the role is teacher, assign the teacher role in Firestore for DBAC.
            if (role === 'teacher') {
            setTeacherRole(user.uid);
            }
            toast({
            title: 'Account Created',
            description: "You're all set! Redirecting to your dashboard.",
            });
            router.push(`/${role}/dashboard`);
        }
      } else {
        // Handle sign-in.
        if ('username' in values) {
            const email = await getUserEmailForUsername(values.username);
            if (!email) {
                throw new Error("Username not found.");
            }
            await initiateEmailSignIn(auth, email, values.password);
            toast({
              title: 'Signed In',
              description: "Welcome back! Redirecting to your dashboard.",
            });
            router.push(`/${role}/dashboard`);
        }
      }
    } catch (error: any) {
      console.error(`${isSignUp ? 'Sign-up' : 'Sign-in'} error:`, error);
      
      let description = `Could not ${ isSignUp ? 'create your account' : 'sign you in' }. Please try again.`;
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Conditionally render the 'Name' field for sign-up forms. */}
        {isSignUp && (
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
        )}
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
        {isSignUp && (
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
        {/* Conditionally render the 'Teacher Code' field for teacher sign-up. */}
        {isSignUp && role === 'teacher' && (
          <FormField
            control={form.control}
            name="teacherCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Teacher Code</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Secret code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={
            isLoading
          }
        >
          {isLoading
            ? 'Processing...'
            : isSignUp
            ? 'Create Account'
            : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
}

/**
 * The main login page component.
 * It uses a tabbed interface to switch between student/teacher roles and sign-in/sign-up forms.
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
        {/* Tabs for selecting user role: Student or Teacher */}
        <Tabs defaultValue="student" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
          </TabsList>
          {/* Student Forms */}
          <TabsContent value="student">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Sign In</CardTitle>
                    <CardDescription>
                      Access your learning dashboard.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuthForm isSignUp={false} role="student" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="signup">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Student Account</CardTitle>
                    <CardDescription>
                      Start your math adventure today!
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuthForm isSignUp={true} role="student" />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
          {/* Teacher Forms */}
          <TabsContent value="teacher">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Create Account</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <Card>
                  <CardHeader>
                    <CardTitle>Teacher Sign In</CardTitle>
                    <CardDescription>
                      Manage your sessions and resources.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuthForm isSignUp={false} role="teacher" />
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="signup">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Teacher Account</CardTitle>
                    <CardDescription>
                      Enter the teacher code to create an account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AuthForm isSignUp={true} role="teacher" />
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
