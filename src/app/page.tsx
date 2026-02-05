'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpenIcon, Divide, Grip, Minus, Plus, TargetIcon, UsersIcon, X } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useEffect, useState } from 'react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';

/**
 * A client-side component to render decorative, animated icons.
 * This is done on the client to prevent hydration mismatches caused by animations.
 */
function DecorativeIcons() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <div className="absolute top-10 left-10 bg-accent/20 text-accent p-2 rounded-full animate-bounce">
        <Plus className="w-8 h-8" />
      </div>
      <div className="absolute top-10 right-10 bg-primary/20 text-primary p-2 rounded-full animate-pulse">
        <Minus className="w-8 h-8" />
      </div>
      <div className="absolute bottom-1/4 left-1/4 bg-destructive/20 text-destructive p-2 rounded-full animate-pulse delay-500">
        <X className="w-6 h-6" />
      </div>
      <div className="absolute bottom-10 right-1/4 bg-green-500/20 text-green-600 p-3 rounded-full animate-bounce delay-700">
        <Divide className="w-8 h-8" />
      </div>
      <div className="absolute bottom-10 right-1/2 bg-purple-500/20 text-purple-600 p-2 rounded-full animate-pulse delay-300">
        <Grip className="w-8 h-8" />
      </div>
    </>
  );
}

/**
 * A component that handles the conditional navigation for the main call-to-action buttons.
 * If the user is logged in, it directs them to the feature page.
 * If not, it directs them to the login page.
 */
function HeroButtons() {
    const { user, isUserLoading } = useUser();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        if (isUserLoading) return; // Do nothing while checking auth state

        if (user) {
            router.push(path);
        } else {
            router.push('/login');
        }
    };
    
    return (
        <div className="flex justify-center gap-4">
            <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => handleNavigation('/student/resources')}
                disabled={isUserLoading}
            >
              Start Learning
            </Button>
            <Button 
                asChild 
                size="lg" 
                variant="secondary"
                onClick={() => handleNavigation('/student/tutoring')}
                disabled={isUserLoading}
            >
              <Link href={user ? '/student/tutoring' : '/login'}>Book Tutoring</Link>
            </Button>
        </div>
    );
}


/**
 * The Home page component for MathQuest.
 * This is the main landing page for the application, showcasing its features
 * and providing navigation to key sections like login and learning resources.
 */
export default function Home() {
  // Get the current year for the footer copyright.
  const year = new Date().getFullYear();

  return (
    <div className="flex flex-col min-h-screen animated-gradient-background">
      {/* Header section with Logo and Login button */}
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
        {/* Hero section with a welcoming message and call-to-action buttons */}
        <section className="container mx-auto px-4 py-20 text-center relative">
          {/* Decorative math symbols floating around the hero text */}
          <DecorativeIcons />

          <h1 className="text-5xl md:text-7xl font-bold font-headline mb-4 relative bg-background/80">
            Welcome to MathQuest
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 relative bg-background/80">
            Where math becomes an adventure!
          </p>
          <HeroButtons />
        </section>

        {/* "Why MathQuest?" section highlighting key features of the app */}
        <section className="bg-card py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">Why MathQuest?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature Card: Fun Lessons */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-4 bg-primary/10 rounded-full inline-block mb-4">
                    <BookOpenIcon className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Fun Lessons</h3>
                  <p className="text-muted-foreground">Engaging lessons, videos, and games that make learning exciting.</p>
                </CardContent>
              </Card>
              {/* Feature Card: Track Progress */}
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="p-4 bg-accent/10 rounded-full inline-block mb-4">
                    <TargetIcon className="w-10 h-10 text-accent" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Track Progress</h3>
                  <p className="text-muted-foreground">Earn badges and see your skills grow with our progress tracker.</p>
                </CardContent>
              </Card>
              {/* Feature Card: Expert Tutors */}
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

      {/* Footer section with copyright information */}
      <footer className="bg-background border-t">
        <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
          &copy; {year} MathQuest. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
