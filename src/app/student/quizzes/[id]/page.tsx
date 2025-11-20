'use client';

import { notFound, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This page is now deprecated.
 * The quiz functionality has been moved to an inline view on the `/student/resources` page.
 * This component will now simply redirect the user back to the main resources page.
 *
 * @param {object} props - The component props provided by Next.js.
 * @param {object} props.params - An object containing the dynamic route parameters.
 * @param {string} props.params.id - The ID of the quiz to display.
 */
export default function DeprecatedQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect the user back to the main resources page.
    // The quiz will be handled by the inline QuizView there.
    router.replace('/student/resources');
  }, [router]);

  // Return null as the component will redirect before rendering anything.
  return null;
}
