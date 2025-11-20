'use client';
import { LessonManager } from '../dashboard/LessonManager';

export default function LearningPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
             <h1 className="text-3xl font-bold font-headline">Manage Learning Content</h1>
            <LessonManager />
        </div>
    )
}
