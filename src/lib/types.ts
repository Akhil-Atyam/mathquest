import type { LucideIcon } from "lucide-react";

export type Resource = {
  id: string;
  title: string;
  type: 'Lesson' | 'Video' | 'Game' | 'Worksheet';
  topic: string;
  grade: number;
  icon: LucideIcon;
  content: string;
};

export type Quiz = {
  id: string;
  title: string;
  topic: string;
  grade: number;
};

export type Badge = {
  id: string;
  name: string;
  icon: LucideIcon;
};

export type Student = {
  id: string;
  name:string;
  grade: number;
  completedLessons: string[];
  quizScores: Record<string, number>;
  badges: string[];
};

export type Teacher = {
  id: string;
  name: string;
  availability: Record<string, string[]>; 
};

export type Booking = {
  id: string;
  studentName: string;
  grade: number;
  topic: string;
  dateTime: Date;
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  teacherId: string;
  meetingLink?: string;
  attended?: boolean;
};

    