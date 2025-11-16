/**
 * @fileoverview Initializes and configures the Genkit AI instance.
 * This file serves as the central point for setting up the Genkit library with necessary plugins,
 * such as the Google AI plugin for accessing Gemini models.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

/**
 * The global Genkit AI instance.
 *
 * @description
 * This instance is configured with the `googleAI` plugin, which enables integration
 * with Google's Generative AI models (like Gemini). The `model` property sets the
 * default model to be used for generation tasks throughout the application.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
