'use client';
import { useState } from 'react';
import { LessonManager } from './LessonManager';
import { QuizManager } from './QuizManager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


export default function LearningPage() {
    const [selectedGrade, setSelectedGrade] = useState<string>('all');

    return (
        <div className="p-4 sm:p-6 space-y-6">
             <h1 className="text-3xl font-bold font-headline">Manage Learning Content</h1>
            
             <div className="max-w-xs space-y-2">
                <Label htmlFor="grade-filter">Filter by Grade</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                    <SelectTrigger id="grade-filter">
                        <SelectValue placeholder="Filter by grade..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {[1,2,3,4,5].map(g => <SelectItem key={g} value={String(g)}>Grade {g}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="space-y-6">
                    <LessonManager selectedGrade={selectedGrade} />
                </div>
                <div>
                    <QuizManager selectedGrade={selectedGrade} />
                </div>
             </div>
        </div>
    )
}
