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
  initiateEmailSignIn,
  setTeacherRole,
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

const studentSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const teacherSignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  teacherCode: z.string().min(1, 'Teacher code is required.'),
});

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required.'),
});

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

  const formSchema =
    role === 'teacher' && isSignUp ? teacherSignUpSchema : isSignUp ? studentSignUpSchema : signInSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      ...(role === 'teacher' && isSignUp && { teacherCode: '' }),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (role === 'teacher') {
          if ('teacherCode' in values && values.teacherCode !== process.env.NEXT_PUBLIC_TEACHER_SECRET_CODE) {
            throw new Error('Invalid Teacher Code.');
          }
        }

        const userCredential = await initiateEmailSignUp(
          auth,
          values.email,
          values.password
        );

        if (role === 'teacher') {
           await setTeacherRole(userCredential.user.uid);
        }
        toast({
          title: 'Account Created',
          description: "You're all set! Redirecting to your dashboard.",
        });
      } else {
        await initiateEmailSignIn(auth, values.email, values.password);
        toast({
          title: 'Signed In',
          description: "Welcome back! Redirecting to your dashboard.",
        });
      }
      router.push(`/${role}/dashboard`);
    } catch (error: any) {
      console.error(`${isSignUp ? 'Sign-up' : 'Sign-in'} error:`, error);
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description:
          error.message ||
          `Could not ${
            isSignUp ? 'create your account' : 'sign you in'
          }. Please try again.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <Button type="submit" className="w-full" disabled={isLoading}>
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
        <Tabs defaultValue="student" className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
          </TabsList>
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
