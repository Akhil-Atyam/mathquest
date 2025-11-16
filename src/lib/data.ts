import type { Student, Teacher, Resource, Quiz, Badge, Booking } from '@/lib/types';
import { Book, Video, Gamepad2, FileText, Award, Star, Trophy, Atom, Ruler, Shapes } from 'lucide-react';
import { format } from 'date-fns';

/**
 * @fileoverview This file contains mock data for the application.
 * In a real-world scenario, this data would be fetched from a database like Firestore.
 * Using mock data is useful for rapid prototyping and UI development without a live backend.
 */

// A simple array of math topics.
export const topics = [
  "Addition", "Subtraction", "Multiplication", "Division", "Fractions", "Geometry", "Measurement"
];

// Mock data for badges that students can earn.
export const badges: Badge[] = [
  { id: 'badge-1', name: 'Addition Ace', icon: Award },
  { id: 'badge-2', name: 'Subtraction Star', icon: Star },
  { id: 'badge-3', name: 'Fraction Fanatic', icon: Trophy },
];

// Mock data for learning resources (lessons, videos, etc.).
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

// Mock data for quizzes.
export const quizzes: Quiz[] = [
  { id: 'quiz-1', title: 'Addition Check', topic: 'Addition', grade: 1 },
  { id: 'quiz-2', title: 'Subtraction Skills', topic: 'Subtraction', grade: 1 },
  { id: 'quiz-3', title: 'Multiplication Test', topic: 'Multiplication', grade: 2 },
  { id: 'quiz-4', title: 'Fractions Fun', topic: 'Fractions', grade: 3 },
  { id: 'quiz-5', title: 'Division Drill', topic: 'Division', grade: 4 },
];

// A single mock student object for demonstration purposes.
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

/**
 * Helper function to generate a date string for a future date.
 * This is used to create dynamic but predictable dates for mock availability.
 * @param {number} dayOffset - The number of days from today.
 * @returns {string} A date formatted as 'yyyy-MM-dd'.
 */
const getFutureDate = (dayOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    return format(date, 'yyyy-MM-dd');
};

// Mock data for teachers, including their availability.
// The availability is stored as a map where the key is the day offset from today
// and the value is an array of available time slots.
export const teachers: Teacher[] = [
    {
        id: 'teacher-1',
        name: 'Mr. Davison',
        availability: {
            '1': ["09:00", "10:00", "11:00", "14:00"], // Tomorrow
            '2': ["10:00", "11:00", "15:00"], // Day after tomorrow
            '3': ["09:00", "10:00", "13:00", "14:00", "15:00"],
        }
    },
    {
        id: 'teacher-2',
        name: 'Ms. Frizzle',
        availability: {
            '1': ["13:00", "14:00", "15:00"],
            '4': ["09:00", "10:00", "11:00", "12:00"],
            '5': ["11:00", "12:00"],
        }
    }
];

// Mock data for tutoring session bookings.
export const bookings: Booking[] = [
  {
    id: 'booking-1',
    studentId: 'student-1',
    studentName: 'Alex',
    grade: 3,
    topic: 'Fractions',
    startTime: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
    status: 'Confirmed',
    teacherId: 'teacher-1',
    meetingLink: 'https://meet.google.com/xyz-abc-def'
  },
   {
    id: 'booking-2',
    studentId: 'student-2',
    studentName: 'Beth',
    grade: 4,
    topic: 'Long Division',
    startTime: new Date(new Date().setDate(new Date().getDate() + 2)), // Day after tomorrow
    status: 'Confirmed',
    teacherId: 'teacher-1',
  },
   {
    id: 'booking-3',
    studentId: 'student-3',
    studentName: 'Charlie',
    grade: 2,
    topic: 'Multiplication',
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
    status: 'Completed',
    teacherId: 'teacher-1',
    attended: true,
  }
];
