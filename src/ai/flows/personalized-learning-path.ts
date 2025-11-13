'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a personalized learning path for students.
 *
 * The flow analyzes student performance data and suggests a tailored learning path
 * consisting of recommended lessons and quizzes to address areas where the student needs the most improvement.
 *
 * @exports {function} generatePersonalizedLearningPath - The main function to trigger the learning path generation.
 * @exports {type} PersonalizedLearningPathInput - The input type for the generatePersonalizedLearningPath function.
 * @exports {type} PersonalizedLearningPathOutput - The output type for the generatePersonalizedLearningPath function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedLearningPathInputSchema = z.object({
  studentId: z.string().describe('The unique identifier of the student.'),
  gradeLevel: z.number().describe('The grade level of the student (1-5).'),
  completedLessons: z.array(z.string()).describe('List of lesson IDs the student has completed.'),
  quizScores: z.record(z.number()).describe('A map of quiz IDs to the student score on that quiz.'),
});
export type PersonalizedLearningPathInput = z.infer<typeof PersonalizedLearningPathInputSchema>;

const PersonalizedLearningPathOutputSchema = z.object({
  recommendedLessons: z.array(z.string()).describe('List of lesson IDs recommended for the student.'),
  recommendedQuizzes: z.array(z.string()).describe('List of quiz IDs recommended for the student.'),
  explanation: z.string().describe('Explanation of why these lessons and quizzes were recommended.'),
});
export type PersonalizedLearningPathOutput = z.infer<typeof PersonalizedLearningPathOutputSchema>;

export async function generatePersonalizedLearningPath(
  input: PersonalizedLearningPathInput
): Promise<PersonalizedLearningPathOutput> {
  return personalizedLearningPathFlow(input);
}

const personalizedLearningPathPrompt = ai.definePrompt({
  name: 'personalizedLearningPathPrompt',
  input: {schema: PersonalizedLearningPathInputSchema},
  output: {schema: PersonalizedLearningPathOutputSchema},
  prompt: `You are an AI learning assistant that can generate personalized learning paths for students.

  Analyze the student's performance data and suggest a learning path of lessons and quizzes to help them improve in areas where they are struggling.

  Student ID: {{{studentId}}}
  Grade Level: {{{gradeLevel}}}
  Completed Lessons: {{#if completedLessons}}{{#each completedLessons}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}
  Quiz Scores: {{#if quizScores}}{{#each quizScores key="@key"}}{{@key}}: {{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}None{{/if}}

  Based on this information, recommend a list of lessons and quizzes for the student to complete.  Also provide a brief explanation of your choices.
  Format your response as a JSON object matching the schema.
  `,
});

const personalizedLearningPathFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPathFlow',
    inputSchema: PersonalizedLearningPathInputSchema,
    outputSchema: PersonalizedLearningPathOutputSchema,
  },
  async input => {
    const {output} = await personalizedLearningPathPrompt(input);
    return output!;
  }
);
