'use client';

import { resources } from '@/lib/data';
import type { Resource } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react';

/**
 * A reusable component that displays a single learning resource in a card format.
 * It shows the resource's title, type, and provides a "Start" button to navigate to its page.
 *
 * @param {object} props - The component props.
 * @param {Resource} props.resource - The resource object to display.
 */
function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <resource.icon className="w-6 h-6 text-primary" />
          {resource.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">{resource.type}</p>
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/student/resources/${resource.id}`}>Start</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * The main page for browsing all available learning resources.
 * It organizes resources into tabs by grade level and then into accordions by topic.
 */
export default function ResourcesPage() {
  // Define the grade levels to be displayed as tabs.
  const grades = [1, 2, 3, 4, 5];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Resources</h1>
      <p className="text-muted-foreground">Explore lessons, videos, games, and more!</p>

      {/* Tabs component to switch between different grade levels. */}
      <Tabs defaultValue="grade-1" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {grades.map(grade => (
            <TabsTrigger key={grade} value={`grade-${grade}`}>Grade {grade}</TabsTrigger>
          ))}
        </TabsList>
        
        {/* Generate a TabsContent section for each grade level. */}
        {grades.map(grade => {
            // Filter resources to get only those for the current grade.
            const gradeResources = resources.filter(r => r.grade === grade);
            // Get a unique list of topics available for that grade.
            const gradeTopics = [...new Set(gradeResources.map(r => r.topic))];

            return (
                <TabsContent key={grade} value={`grade-${grade}`}>
                    {/* Accordion component to group resources by topic. */}
                    <Accordion type="multiple" className="w-full">
                        {gradeTopics.map(topic => {
                            // Filter resources for the current topic.
                            const topicResources = gradeResources.filter(r => r.topic === topic);
                            return (
                                <AccordionItem key={topic} value={topic}>
                                    <AccordionTrigger className="text-lg font-semibold">{topic}</AccordionTrigger>
                                    <AccordionContent>
                                        {/* Grid layout to display the resource cards. */}
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {topicResources.map(resource => (
                                            <ResourceCard key={resource.id} resource={resource} />
                                        ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                     {/* Display a message if no resources are available for a grade. */}
                     {gradeTopics.length === 0 && <p className="text-muted-foreground text-center py-10">No resources available for Grade {grade} yet.</p>}
                </TabsContent>
            )
        })}
      </Tabs>
    </div>
  );
}
