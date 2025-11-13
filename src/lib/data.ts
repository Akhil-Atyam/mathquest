import type { Student, Teacher, Resource, Quiz, Badge, Booking } from '@/lib/types';
import { Book, Video, Gamepad2, FileText, Award, Star, Trophy, Atom, Ruler, Shapes } from 'lucide-react';

export const topics = [
  "Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Geometry", "Measurement"
];

export const badges: Badge[] = [
  { id: 'badge-1', name: 'Addition Ace', icon: Award },
  { id: 'badge-2', name: 'Subtraction Star', icon: Star },
  { id: 'badge-3', name: 'Fraction Fanatic', icon: Trophy },
];

export const resources: Resource[] = [
  { id: 'res-1', title: 'Intro to Addition', type: 'Lesson', topic: 'Addition', grade: 1, icon: Book },
  { id: 'res-2', title: 'Addition Fun!', type: 'Video', topic: 'Addition', grade: 1, icon: Video },
  { id: 'res-3', title: 'Counting Game', type: 'Game', topic: 'Addition', grade: 1, icon: Gamepad2 },
  { id: 'res-4', title: 'Addition Worksheet', type: 'Worksheet', topic: 'Addition', grade: 1, icon: FileText },
  { id: 'res-5', title: 'Subtraction Basics', type: 'Lesson', topic: 'Subtraction', grade: 1, icon: Book },
  { id: 'res-6', title: 'What are Shapes?', type: 'Lesson', topic: 'Geometry', grade: 1, icon: Shapes },
  { id: 'res-7', title: 'Advanced Addition', type: 'Lesson', topic: 'Addition', grade: 2, icon: Book },
  { id: 'res-8', title: 'Intro to Multiplication', type: 'Video', topic: 'Multiplication', grade: 2, icon: Video },
  { id: 'res-9', title: 'Measuring Length', type: 'Lesson', topic: 'Measurement', grade: 2, icon: Ruler },
  { id: 'res-10', title: 'Understanding Fractions', type: 'Lesson', topic: 'Fractions', grade: 3, icon: Book },
  { id: 'res-11', title: 'Fraction Pizza Party', type: 'Game', topic: 'Fractions', grade: 3, icon: Gamepad2 },
  { id: 'res-12', title: 'Intro to Division', type: 'Lesson', topic: 'Division', grade: 3, icon: Book },
  { id: 'res-13', title: 'Long Division', type: 'Lesson', topic: 'Division', grade: 4, icon: Book },
  { id: 'res-14', title: 'Complex Shapes', type: 'Video', topic: 'Geometry', grade: 4, icon: Shapes },
  { id: 'res-15', title: 'Decimal Points', type: 'Lesson', topic: 'Fractions', grade: 5, icon: Atom },
];

export const quizzes: Quiz[] = [
  { id: 'quiz-1', title: 'Addition Check', topic: 'Addition', grade: 1 },
  { id: 'quiz-2', title: 'Subtraction Skills', topic: 'Subtraction', grade: 1 },
  { id: 'quiz-3', title: 'Multiplication Test', topic: 'Multiplication', grade: 2 },
  { id: 'quiz-4', title: 'Fractions Fun', topic: 'Fractions', grade: 3 },
  { id: 'quiz-5', title: 'Division Drill', topic: 'Division', grade: 4 },
];

export const student: Student = {
  id: 'student-1',
  name: 'Alex',
  grade: 3,
  completedLessons: ['res-1', 'res-2', 'res-5', 'res-6', 'res-7'],
  quizScores: {
    'quiz-1': 90,
    'quiz-2': 85,
  },
  badges: ['badge-1', 'badge-2'],
};

export const teachers: Teacher[] = [
    {
        id: 'teacher-1',
        name: 'Mr. Davison',
        availability: {
            "2024-07-29": ["09:00", "10:00", "11:00", "14:00"],
            "2024-07-30": ["10:00", "11:00", "15:00"],
            "2024-08-01": ["09:00", "10:00", "13:00", "14:00", "15:00"],
        }
    },
    {
        id: 'teacher-2',
        name: 'Ms. Frizzle',
        availability: {
            "2024-07-29": ["13:00", "14:00", "15:00"],
            "2024-07-31": ["09:00", "10:00", "11:00", "12:00"],
            "2024-08-02": ["11:00", "12:00"],
        }
    }
];

export const bookings: Booking[] = [
    {
        id: 'booking-1',
        studentName: 'Charlie',
        grade: 2,
        topic: 'Multiplication',
        dateTime: new Date('2024-07-29T10:00:00'),
        status: 'Confirmed',
        teacherId: 'teacher-1',
        meetingLink: 'https://meet.example.com/charlie-session'
    },
    {
        id: 'booking-2',
        studentName: 'Dana',
        grade: 4,
        topic: 'Long Division',
        dateTime: new Date('2024-07-31T11:00:00'),
        status: 'Confirmed',
        teacherId: 'teacher-2',
        meetingLink: 'https://meet.example.com/dana-session'
    },
    {
        id: 'booking-3',
        studentName: 'Eli',
        grade: 1,
        topic: 'Subtraction',
        dateTime: new Date('2024-07-25T14:00:00'),
        status: 'Completed',
        teacherId: 'teacher-1'
    }
]
