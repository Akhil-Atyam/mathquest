'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * This page is deprecated and now redirects to the consolidated learning management page.
 */
export default function DeprecatedLessonsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new, consolidated page for managing lessons and quizzes.
    router.replace('/teacher/learning');
  }, [router]);

  // Render null as the page will redirect.
  return null;
}
