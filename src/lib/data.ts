import type { Student, Teacher, Resource, Quiz, Badge, Booking } from '@/lib/types';
import { Award, Star, Trophy } from 'lucide-react';

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
  { id: 'badge-1', name: 'Addition Ace', icon: Award },
  { id: 'badge-2', name: 'Subtraction Star', icon: Star },
  { id: 'badge-3', name: 'Fraction Fanatic', icon: Trophy },
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
