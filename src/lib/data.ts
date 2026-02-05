import type { Student, Teacher, Resource, Quiz, Badge, Booking } from '@/lib/types';
import { Award, Star, Trophy, BookOpen, Library, Shield, BrainCircuit, GraduationCap } from 'lucide-react';

/**
 * @fileoverview This file contains mock data for the application.
 * In a real-world scenario, this data would be fetched from a database like Firestore.
 * Using mock data is useful for rapid prototyping and UI development without a live backend.
 */

// A hardcoded list of curriculum topics. This is now deprecated in favor of the dynamic topics collection.
export const topics: string[] = [
    'Addition',
    'Data & Graphs',
    'Decimals',
    'Division',
    'Fractions',
    'Geometry',
    'Measurement',
    'Money',
    'Multiplication',
    'Place Values',
    'Subtraction',
    'Time'
];

// Mock data for badges that students can earn.
export const badges: Badge[] = [
  // Topic Badges (awarded for high quiz scores)
  { id: 'badge-topic-addition', name: 'Addition Ace', icon: Award },
  { id: 'badge-topic-subtraction', name: 'Subtraction Star', icon: Star },
  { id: 'badge-topic-fractions', name: 'Fraction Fanatic', icon: Trophy },

  // Lesson Completion Badges
  { id: 'badge-lesson-1', name: 'First Step', icon: BookOpen },
  { id: 'badge-lesson-5', name: 'Bookworm', icon: Library },
  { id: 'badge-lesson-10', name: 'Knowledge Knight', icon: Shield },
  { id: 'badge-lesson-50', name: 'Wisdom Wizard', icon: BrainCircuit },
  { id: 'badge-lesson-100', name: 'Sage of the School', icon: GraduationCap },
];


// Mock data for learning resources (lessons, videos, etc.).
// This is now deprecated in favor of fetching live lessons from Firestore.
export const resources: Resource[] = [];

// Mock data for quizzes.
export const quizzes: Quiz[] = [];

// A single mock student object for demonstration purposes.
export const student: Student | null = null;

// Mock data for teachers.
export const teachers: Teacher[] = [];

// Mock data for tutoring session bookings.
export const bookings: Booking[] = [];
