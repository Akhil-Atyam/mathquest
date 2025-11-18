import type { LucideIcon } from "lucide-react";
import type { Timestamp } from "firebase/firestore";

/**
 * @fileoverview This file contains TypeScript type definitions for the main data
 * entities used throughout the MathQuest application. Centralizing these types
 * helps ensure data consistency and provides better autocompletion and type-checking
 * during development.
 */

/**
 * Represents a single learning resource, which can be a lesson, video, game, or worksheet.
 */
export type Resource = {
  id: string; // Unique identifier for the resource.
  title: string; // The display title of the resource.
  type: 'Lesson' | 'Video' | 'Game' | 'Worksheet'; // The category of the resource.
  topic: string; // The math topic it covers (e.g., "Addition").
  grade: number; // The target grade level.
  icon: LucideIcon; // The icon component to be displayed for this resource type.
  content: string; // The main content or description of the resource.
};

/**
 * Represents a single quiz.
 */
export type Quiz = {
  id: string; // Unique identifier for the quiz.
  title: string; // The title of the quiz.
  topic: string; // The math topic it covers.
  grade: number; // The target grade level.
};

/**
 * Represents a badge that a student can earn for achievements.
 */
export type Badge = {
  id: string; // Unique identifier for the badge.
  name: string; // The name of the badge (e.g., "Addition Ace").
  icon: LucideIcon; // The icon component for the badge.
};

/**
 * Represents a student user.
 * This type is used for data fetched from the `/users/{userId}` collection in Firestore.
 */
export type Student = {
  id: string; // Unique identifier, typically the Firebase Auth UID.
  name:string; // The student's name.
  username: string; // The student's unique username.
  email: string; // The student's email address.
  grade: number; // The student's grade level.
  completedLessons?: string[]; // An array of resource IDs that the student has completed.
  quizScores?: Record<string, number>; // A map of quiz IDs to the scores the student received.
  badges?: string[]; // An array of badge IDs the student has earned.
};

/**
 * Represents a teacher user.
 * This type is used for data fetched from the `/teachers/{teacherId}` collection in Firestore.
 */
export type Teacher = {
  id: string; // Unique identifier, typically the Firebase Auth UID.
  name: string; // The teacher's name.
  username: string; // The teacher's unique username.
  email: string; // The teacher's email address.
  // A record mapping a day offset (as a string, e.g., "1" for tomorrow) to an array of available time slots (e.g., "09:00").
  availability?: Record<string, string[]>; 
};

/**
 * Represents a booked tutoring session between a student and a teacher.
 */
export type Booking = {
  id: string; // Unique identifier for the booking.
  studentId: string; // The ID of the student.
  studentName: string; // The name of the student (denormalized for easy display).
  grade: number; // The grade of the student at the time of booking.
  topic: string; // The topic for the session.
  startTime: Timestamp; // The exact start date and time of the session.
  status: 'Confirmed' | 'Completed' | 'Cancelled'; // The status of the booking.
  teacherId: string; // The ID of the teacher.
  teacherName: string; // The name of the teacher (denormalized for easy display).
  meetingLink?: string; // An optional link to the virtual meeting.
  attended?: boolean; // An optional flag to mark if the student attended.
};
