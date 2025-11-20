'use client';
import { LessonManager } from './LessonManager';
import { QuizManager } from './QuizManager';


export default function LearningPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
             <h1 className="text-3xl font-bold font-headline">Manage Learning Content</h1>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <LessonManager />
                </div>
                <div>
                    <QuizManager />
                </div>
             </div>
        </div>
    )
}
