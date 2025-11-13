import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';

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
                <div className="space-y-2">
                  <Label htmlFor="student-email">Email</Label>
                  <Input id="student-email" type="email" placeholder="student@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input id="student-password" type="password" />
                </div>
                <Button asChild className="w-full">
                    <Link href="/student/dashboard">Login as Student</Link>
                </Button>
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
                <div className="space-y-2">
                  <Label htmlFor="teacher-email">Email</Label>
                  <Input id="teacher-email" type="email" placeholder="teacher@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teacher-password">Password</Label>
                  <Input id="teacher-password" type="password" />
                </div>
                <Button asChild className="w-full">
                    <Link href="/teacher/dashboard">Login as Teacher</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
