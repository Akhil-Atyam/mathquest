# Firebase Studio

This is a NextJS starter project for MathQuest, an online learning hub to make math fun and interactive.

To get started with local development, take a look at `src/app/page.tsx`.

---

## Deploying to Vercel

Vercel is a cloud platform that offers a seamless experience for deploying Next.js applications. Here are the steps to deploy your MathQuest app to Vercel.

### Step 1: Sign up for Vercel
- Go to [vercel.com](https://vercel.com) and create an account. A free "Hobby" account is a great place to start.

### Step 2: Create a New Project
- Once you are on your Vercel dashboard, click **"Add New... > Project"**.
- Import your Git repository where this project is stored (e.g., from GitHub, GitLab, or Bitbucket).

### Step 3: Configure Your Project
Vercel will automatically detect that this is a Next.js project and set the build commands correctly. The most important step here is to add your Environment Variables.

- In the **"Configure Project"** screen, expand the **"Environment Variables"** section.
- You will need to add the Firebase and Genkit configuration keys. These keys allow Vercel to securely connect to your backend services during the build process and in production.

Add the following variables one by one:

| Name                        | Value                                            |
| --------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key                          |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain                    |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID                     |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your Firebase App ID                         |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `GEMINI_API_KEY`            | Your Google AI (Gemini) API Key                  |

**Where to find these values:**
- **Firebase Values**: You can find all the `NEXT_PUBLIC_FIREBASE_*` values in your `src/firebase/config.ts` file.
- **Gemini API Key**: You can get your `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step 4: Deploy
- After adding the environment variables, click the **"Deploy"** button.
- Vercel will start building and deploying your application. You'll get a unique URL for your live site once it's complete.

That's it! Your MathQuest application will be live on Vercel. Any future pushes to your connected Git branch (e.g., `main`) will automatically trigger a new deployment.