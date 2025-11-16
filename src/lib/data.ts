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
  { id: 'res-1', title: 'Intro to Addition', type: 'Lesson', topic: 'Addition', grade: 1, icon: Book, content: 'This is a lesson about the basics of addition. We will learn how to add small numbers together.' },
  { id: 'res-2', title: 'Addition Fun!', type: 'Video', topic: 'Addition', grade: 1, icon: Video, content: 'Watch this fun video to see addition in action!' },
  { id: 'res-3', title: 'Counting Game', type: 'Game', topic: 'Addition', grade: 1, icon: Gamepad2, content: 'Play a game to practice your counting and addition skills.' },
  { id: 'res-4', title: 'Addition Worksheet', type: 'Worksheet', topic: 'Addition', grade: 1, icon: FileText, content: 'Download and complete this worksheet to test your addition knowledge.' },
  { id: 'res-5', title: 'Subtraction Basics', type: 'Lesson', topic: 'Subtraction', grade: 1, icon: Book, content: 'This lesson covers the fundamentals of subtracting numbers.' },
  { id: 'res-6', title: 'What are Shapes?', type: 'Lesson', topic: 'Geometry', grade: 1, icon: Shapes, content: 'Learn to identify common shapes like circles, squares, and triangles.' },
  { id: 'res-7', title: 'Advanced Addition', type: 'Lesson', topic: 'Addition', grade: 2, icon: Book, content: 'Take your addition skills to the next level with carrying and larger numbers.' },
  { id: 'res-8', title: 'Intro to Multiplication', type: 'Video', topic: 'Multiplication', grade: 2, icon: Video, content: 'Multiplication is just repeated addition! This video shows you how.' },
  { id: 'res-9', title: 'Measuring Length', type: 'Lesson', topic: 'Measurement', grade: 2, icon: Ruler, content: 'Learn how to use a ruler to measure inches and centimeters.' },
  { id: 'res-10', title: 'Understanding Fractions', type: 'Lesson', topic: 'Fractions', grade: 3, icon: Book, content: 'What is a fraction? This lesson will explain parts of a whole.' },
  { id: 'res-11', title: 'Fraction Pizza Party', type: 'Game', topic: 'Fractions', grade: 3, icon: Gamepad2, content: 'Design pizzas with different toppings to learn about fractions.' },
  { id: 'res-12', title: 'Intro to Division', type: 'Lesson', topic: 'Division', grade: 3, icon: Book, content: 'Learn how to share items equally through division.' },
  { id: 'res-13', title: 'Long Division', type: 'Lesson', topic: 'Division', grade: 4, icon: Book, content: 'Master the process of long division with this step-by-step lesson.' },
  { id: 'res-14', title: 'Complex Shapes', type: 'Video', topic: 'Geometry', grade: 4, icon: Shapes, content: 'Explore polygons, polyhedrons, and other complex geometric shapes.' },
  { id: 'res-15', title: 'Decimal Points', type: 'Lesson', topic: 'Fractions', grade: 5, icon: Atom, content: 'Understand the relationship between fractions and decimals.' },
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

const getFutureDate = (daysToAdd: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    date.setHours(0, 0, 0, 0); // Set to start of the day
    return date.toISOString().split('T')[0];
}

export const teachers: Teacher[] = [
    {
        id: 'teacher-1',
        name: 'Mr. Davison',
        availability: {
            [getFutureDate(1)]: ["09:00", "10:00", "11:00", "14:00"],
            [getFutureDate(2)]: ["10:00", "11:00", "15:00"],
            [getFutureDate(3)]: ["09:00", "10:00", "13:00", "14:00", "15:00"],
        }
    },
    {
        id: 'teacher-2',
        name: 'Ms. Frizzle',
        availability: {
            [getFutureDate(1)]: ["13:00", "14:00", "15:00"],
            [getFutureDate(4)]: ["09:00", "10:00", "11:00", "12:00"],
            [getFutureDate(5)]: ["11:00", "12:00"],
        }
    }
];

// This is now just for initial structure, will be replaced by firestore data
export const bookings: Booking[] = []
