import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';

/**
 * SEO metadata for the application.
 * This object is used by Next.js to set the title and description meta tags
 * for search engine optimization and browser tab information.
 */
export const metadata: Metadata = {
  title: 'MathQuest: The Fun Way to Learn Math',
  description: 'An online learning hub created by students, for students to make math fun and interactive.',
};

/**
 * RootLayout is the main layout component that wraps every page in the application.
 * It sets up the basic HTML structure, includes global stylesheets, fonts, and providers.
 *
 * @param {object} props - The properties for the component.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout (i.e., the current page).
 * @returns {JSX.Element} The root layout structure for the application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The `suppressHydrationWarning` prop is used here to prevent warnings from browser extensions that might modify the HTML.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts domains for performance improvement. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Link to the PT Sans font used in the application. */}
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased min-h-screen bg-background">
        {/* `FirebaseClientProvider` initializes Firebase on the client-side and provides it to the app via context. */}
        <FirebaseClientProvider>
          {children}
          {/* The `Toaster` component is responsible for displaying toast notifications throughout the app. */}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
