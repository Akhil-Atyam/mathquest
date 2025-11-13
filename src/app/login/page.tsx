'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';
import { signInAnonymously } from '@/firebase/auth/auth-provider';
import { useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';

function AnonymousSignInButton({ role }: { role: 'student' | 'teacher' }) {
    const auth = useAuth();
    const router = useRouter();
  
    const handleSignIn = async () => {
      try {
        await signInAnonymously(auth);
        router.push(`/${role}/dashboard`);
      } catch (error)
      {
        console.error("Could not sign in anonymously", error);
      }
    };
  
    return <Button onClick={handleSignIn} className="w-full">Login as {role}</Button>;
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
      <main className="flex-1 flex items-center justify-center">
        <Tabs defaultValue="student" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
          </TabsList>
          <TabsContent value="student">
            <Card>
              <CardHeader>
                <CardTitle>Student Login</CardTitle>
                <CardDescription>Enter your details to access your dashboard.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnonymousSignInButton role="student" />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Login</CardTitle>
                <CardDescription>Welcome back! Manage your sessions and resources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnonymousSignInButton role="teacher" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
