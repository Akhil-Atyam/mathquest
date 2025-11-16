'use client';

import { resources } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

/**
 * A dynamic page component that displays the content of a single resource.
 * The resource to display is determined by the `id` parameter in the URL.
 *
 * @param {object} props - The component props provided by Next.js.
 * @param {object} props.params - An object containing the dynamic route parameters.
 * @param {string} props.params.id - The ID of the resource to display.
 */
export default function LessonPage({ params }: { params: { id: string } }) {
  // Find the specific resource from the mock data array using the ID from the URL.
  const resource = resources.find(r => r.id === params.id);

  // If no resource is found with the given ID, render the 404 Not Found page.
  if (!resource) {
    notFound();
  }

  // Render the details of the found resource.
  return (
    <div className="p-4 sm:p-6 space-y-6">
       {/* A "Back" button to navigate the user back to the main resources page. */}
       <Button variant="ghost" asChild>
        <Link href="/student/resources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
        </Link>
       </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
             {/* The resource's associated icon is rendered dynamically. */}
             <resource.icon className="w-8 h-8 text-primary" />
            {resource.title}
          </CardTitle>
          <CardDescription>
            Grade {resource.grade} &middot; {resource.topic}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* The `prose` classes from Tailwind Typography are used for nicely styled article content. */}
          <div className="prose dark:prose-invert max-w-none">
            <p>{resource.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
