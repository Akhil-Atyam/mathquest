'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Divide, Grip, Minus, Plus, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';

export default function Home() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="p-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Logo />
          <nav>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center relative">
          <div className="absolute top-20 left-10 bg-accent/20 text-accent p-2 rounded-full animate-bounce">
            <Plus className="w-8 h-8" />
          </div>
          <div className="absolute top-1/4 right-10 bg-primary/20 text-primary p-3 rounded-full animate-pulse">
            <Minus className="w-10 h-10" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 bg-destructive/20 text-destructive p-2 rounded-full animate-pulse delay-500">
            <X className="w-6 h-6" />
          </div>
          <div className="absolute bottom-1/3 right-1/4 bg-green-500/20 text-green-600 p-3 rounded-full animate-bounce delay-700">
            <Divide className="w-8 h-8" />
          </div>
          <div className="absolute bottom-10 right-1/2 bg-purple-500/20 text-purple-600 p-2 rounded-full animate-pulse delay-300">
            <Grip className="w-8 h-8" />
          </div>

          <h1 className="text-5xl md:text-7xl font-bold font-headline mb-4">
            Welcome to MathQuest
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Where math becomes an adventure!
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/student/resources">Start Learning</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/student/tutoring">Book Tutoring</Link>
            </Button>
          </div>
        </section>

        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Why MathQuest?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                    <BookOpenIcon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Fun Lessons</h3>
                  <p className="text-muted-foreground">Engaging lessons, videos, and games that make learning exciting.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-4 bg-accent/10 rounded-full inline-block mb-4">
                    <TargetIcon className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Track Progress</h3>
                  <p className="text-muted-foreground">Earn badges and see your skills grow with our progress tracker.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-4 bg-green-500/10 rounded-full inline-block mb-4">
                    <UsersIcon className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Expert Tutors</h3>
                  <p className="text-muted-foreground">Book one-on-one sessions with our friendly and experienced teachers.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          &copy; {year || new Date().getFullYear()} MathQuest. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function BookOpenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}


function TargetIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}


function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
