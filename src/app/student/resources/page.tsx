import { resources, topics } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

export default function ResourcesPage() {
  const grades = [1, 2, 3, 4, 5];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <h1 className="text-3xl font-bold font-headline">Resources</h1>
      <p className="text-muted-foreground">Explore lessons, videos, games, and more!</p>

      <Tabs defaultValue="grade-1" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {grades.map(grade => (
            <TabsTrigger key={grade} value={`grade-${grade}`}>Grade {grade}</TabsTrigger>
          ))}
        </TabsList>
        
        {grades.map(grade => {
            const gradeResources = resources.filter(r => r.grade === grade);
            const gradeTopics = [...new Set(gradeResources.map(r => r.topic))];

            return (
                <TabsContent key={grade} value={`grade-${grade}`}>
                    <Accordion type="multiple" className="w-full">
                        {gradeTopics.map(topic => {
                            const topicResources = gradeResources.filter(r => r.topic === topic);
                            return (
                                <AccordionItem key={topic} value={topic}>
                                    <AccordionTrigger className="text-lg font-semibold">{topic}</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {topicResources.map(resource => (
                                            <Card key={resource.id}>
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-2 text-base">
                                                        <resource.icon className="w-6 h-6 text-primary" />
                                                        {resource.title}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground mb-4">{resource.type}</p>
                                                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Start</Button>
                                                </CardContent>
                                            </Card>
                                        ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                     {gradeTopics.length === 0 && <p className="text-muted-foreground text-center py-10">No resources available for Grade {grade} yet.</p>}
                </TabsContent>
            )
        })}
      </Tabs>
    </div>
  );
}
