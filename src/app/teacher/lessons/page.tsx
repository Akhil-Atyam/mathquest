'use client';
import { LessonManager } from '../dashboard/LessonManager';

export default function LessonsPage() {
    return (
        <div className="p-4 sm:p-6 space-y-6">
             <h1 className="text-3xl font-bold font-headline">Manage Lessons</h1>
            <LessonManager />
        </div>
    )
}
