'use client';

import { resources } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function LessonPage({ params }: { params: { id: string } }) {
  const resource = resources.find(r => r.id === params.id);

  if (!resource) {
    notFound();
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
       <Button variant="ghost" asChild>
        <Link href="/student/resources">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources
        </Link>
       </Button>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
             <resource.icon className="w-8 h-8 text-primary" />
            {resource.title}
          </CardTitle>
          <CardDescription>
            Grade {resource.grade} &middot; {resource.topic}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose dark:prose-invert max-w-none">
            <p>{resource.content}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
