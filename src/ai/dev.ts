/**
 * @fileoverview Development entry point for Genkit flows.
 * This file is used by the `genkit:dev` script to start the Genkit development server.
 * It imports all the flows that should be available for debugging and inspection.
 */

import { config } from 'dotenv';

// Loads environment variables from a .env file into process.env.
// This is especially important for Vercel deployments to load server-side variables.
config({ path: '.env.local' });
config(); 

// Import the flows to make them available to the Genkit development UI.
import '@/ai/flows/personalized-learning-path.ts';