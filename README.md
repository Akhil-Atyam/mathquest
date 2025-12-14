h ba# Firebase Studio

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
- You will need to add the Firebase configuration keys. These keys allow Vercel to securely connect to your backend services during the build process and in production.

Add the following variables one by one:

| Name                        | Value                                            |
| --------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key                          |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain                    |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID                     |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your Firebase App ID                         |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |

### Step 4: Where to Find These Values

#### **Firebase Variables**
All of the `NEXT_PUBLIC_FIREBASE_*` variables can be found in the file `src/firebase/config.ts` in your project. The contents of that file will look something like this:

```typescript
export const firebaseConfig = {
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-api-key",
  "authDomain": "your-auth-domain.firebaseapp.com",
  // ... and so on
};
```
Simply copy the corresponding values from this file and paste them into the "Value" field on Vercel for each variable name.

### Step 5: Deploy
- After adding the environment variables, click the **"Deploy"** button.
- Vercel will start building and deploying your application. You'll get a unique URL for your live site once it's complete.

---

## Development and Deployment Workflow

It's important to understand how changes you make here are deployed to your live site on Vercel.

**This is a Local Development Environment:** Think of this editor as your local workshop. When we make changes to the code, those changes are being written directly to the files on this machine.

**Syncing with GitHub:** The changes we make here are **not** automatically synced to your GitHub repository. You need to manually save your progress using Git. The typical workflow is:
1.  **Make Changes:** We work together to edit the app.
2.  **Commit Changes:** Once you are happy with the changes, you need to "commit" them using Git. This is like saving a snapshot of your project. You can do this from the command line (`git add .`, `git commit -m "Your message"`) or using a Git client.
3.  **Push to GitHub:** After committing, you "push" your changes to your GitHub repository (`git push`).
4.  **Automatic Deployment:** Because your Vercel project is connected to your GitHub repository, Vercel will see this push and automatically start a new deployment with your latest changes.

That's it! Your MathQuest application will be live on Vercel, and any future pushes to your connected Git branch (e.g., `main`) will automatically trigger a new deployment.
