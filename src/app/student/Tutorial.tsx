
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MascotBrainy } from './MascotBrainy';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

type TutorialStep = {
  elementId?: string;
  title: string;
  text: string;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  navigateTo?: string;
  page?: string; // Which page this step belongs to
};

const allSteps: TutorialStep[] = [
  // --- Initial Page Load / Any page ---
  {
    page: 'any',
    elementId: 'tutorial-dashboard',
    title: 'Welcome to your Dashboard!',
    text: 'This is your home base. Click Next to see your progress, assignments, and earned badges.',
    position: 'right',
    navigateTo: '/student/dashboard',
  },
  // --- Dashboard Page ---
  {
    page: '/student/dashboard',
    elementId: 'tutorial-progress-card',
    title: 'Track Your Progress',
    text: "This card shows how many of your assigned items you've completed. Keep filling up that bar!",
    position: 'bottom',
  },
  {
    page: '/student/dashboard',
    elementId: 'tutorial-badges-card',
    title: 'Earn Badges',
    text: 'Collect cool badges for mastering topics and completing quizzes. Can you get them all?',
    position: 'bottom',
  },
   {
    page: '/student/dashboard',
    elementId: 'tutorial-assignments-tab',
    title: 'Your Assignments',
    text: "Here you can see all the lessons and quizzes your teacher has assigned just for you.",
    position: 'bottom',
  },
  {
    page: '/student/dashboard',
    elementId: 'tutorial-resources',
    title: 'Explore Learning Resources',
    text: 'Ready for more? Click Next to explore all lessons and quizzes!',
    position: 'right',
    navigateTo: '/student/resources',
  },
  // --- Resources Page ---
  {
    page: '/student/resources',
    elementId: 'tutorial-grade-tabs',
    title: 'Find Your Grade Level',
    text: "All our content is organized by grade. Your current grade is already selected for you.",
    position: 'bottom',
  },
  {
    page: '/student/resources',
    elementId: 'tutorial-topic-list', // Changed from a generic container
    title: 'Your Learning Path',
    text: "This is your adventure! Complete lessons and quizzes to move along the path and unlock new challenges.",
    position: 'bottom',
  },
  {
    page: '/student/resources',
    elementId: 'tutorial-book-session',
    title: 'Book a Tutoring Session',
    text: "Need extra help? Let's go schedule a one-on-one or group session with one of our friendly teachers.",
    position: 'right',
    navigateTo: '/student/tutoring',
  },
  // --- Tutoring Page ---
   {
    page: '/student/tutoring',
    elementId: 'tutorial-my-sessions', // Sidebar link
    title: 'Your Booked Sessions',
    text: 'After you book a session, you can see all of your scheduled tutoring here. Let\'s go see it.',
    position: 'right',
    navigateTo: '/student/my-tutoring-sessions',
  },
  // --- My Tutoring Sessions Page ---
  {
    page: '/student/my-tutoring-sessions',
    elementId: 'tutorial-my-sessions-header',
    title: 'Your Booked Sessions',
    text: 'This page lists all your upcoming and past tutoring sessions. Now, let\'s check out group study!',
    position: 'bottom',
    navigateTo: '/student/group-study',
  },
  {
    page: '/student/my-tutoring-sessions',
    elementId: 'tutorial-group-study', // Sidebar link
    title: 'Study With Friends',
    text: "You can also create your own study sessions and invite your friends. Let's check it out!",
    position: 'right',
    navigateTo: '/student/group-study',
  },
  // --- Final Step (on Group Study page) ---
  {
    page: '/student/group-study',
    elementId: 'tutorial-end',
    title: "You're all set!",
    text: "That's the grand tour! You're ready to start your math adventure. Have fun!",
    position: 'center',
  }
];

// Helper to get the current step index from localStorage
const getInitialStepIndex = (): number => {
    if (typeof window === 'undefined') return 0;
    const savedIndex = localStorage.getItem('tutorialStep');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
};


export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(getInitialStepIndex);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const highlightedElementRef = useRef<HTMLElement | null>(null);

  // Memoize the current step object.
  const step = useMemo(() => allSteps[currentStepIndex], [currentStepIndex]);

  // Update localStorage whenever the step index changes.
  useEffect(() => {
    localStorage.setItem('tutorialStep', String(currentStepIndex));
  }, [currentStepIndex]);


  const handleNext = useCallback(() => {
    // If the current step has a navigation action, perform it.
    // The useEffect that watches `pathname` will handle advancing the step.
    if (step?.navigateTo) {
        router.push(step.navigateTo);
    }
    
    const isLastStep = currentStepIndex >= allSteps.length - 1;
    if (isLastStep) {
      onComplete();
      localStorage.removeItem('tutorialStep');
      if (highlightedElementRef.current) {
        highlightedElementRef.current.classList.remove('tutorial-highlight');
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, onComplete, router, step]);


  // Effect to manage the main tutorial logic, including page validation.
  useEffect(() => {
    if (!step) {
      onComplete();
      return;
    };
    
    // Check if the current step is appropriate for the current page.
    const currentPathMatches = step.page === pathname;
    const isAnyPageStep = step.page === 'any';

    if (!currentPathMatches && !isAnyPageStep) {
        // If we are on the wrong page (e.g., due to navigation), find the correct step.
        const correctStepIndexForPage = allSteps.findIndex(s => s.page === pathname);
        const currentIndexOnWrongPage = allSteps[currentStepIndex]?.page !== pathname;

        if (correctStepIndexForPage !== -1 && currentIndexOnWrongPage) {
            setCurrentStepIndex(correctStepIndexForPage);
        }
        return;
    }
    
    // A timer to delay the spotlight calculation, allowing the UI to settle.
    const timer = setTimeout(() => updateTargetRect(), 100);

    // Cleanup function for when the component unmounts or the step changes.
    return () => {
      clearTimeout(timer);
      // Always remove the highlight class when the step changes.
      if (highlightedElementRef.current) {
          highlightedElementRef.current.classList.remove('tutorial-highlight');
          highlightedElementRef.current = null;
      }
    }
  }, [currentStepIndex, pathname, step, onComplete]);
  

  const updateTargetRect = useCallback(() => {
    if (!step?.elementId || step.elementId === 'tutorial-end') {
      setTargetRect(null);
      if (highlightedElementRef.current) {
        highlightedElementRef.current.classList.remove('tutorial-highlight');
        highlightedElementRef.current = null;
      }
      return;
    }
    
    const element = document.getElementById(step.elementId);
    if (element) {
        setTargetRect(element.getBoundingClientRect());
        if (highlightedElementRef.current !== element) {
            highlightedElementRef.current?.classList.remove('tutorial-highlight');
            element.classList.add('tutorial-highlight');
            highlightedElementRef.current = element;
        }
    } else {
        // If element not found, retry after a short delay
        const elementId = step.elementId;
        setTimeout(() => {
            const el = document.getElementById(elementId);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
                el.classList.add('tutorial-highlight');
                highlightedElementRef.current = el;
            } else {
                setTargetRect(null);
            }
        }, 300);
    }
  }, [step]);
  
  // Effect to recalculate the spotlight position on scroll and resize.
  useEffect(() => {
    updateTargetRect(); // Initial calculation
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true); // Use capture to handle nested scroll containers
    
    // Cleanup listeners on unmount.
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    }
  }, [updateTargetRect]);

  const overlayStyle: React.CSSProperties = useMemo(() => {
     return {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 51,
        transition: 'all 0.3s ease-in-out',
        pointerEvents: 'none',
     }
  }, []);
  
  const spotlightStyle: React.CSSProperties = useMemo(() => {
      const baseStyle: React.CSSProperties = {
          position: 'fixed',
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
          borderRadius: '1rem',
          pointerEvents: 'none',
      };
      
      if (!targetRect || !step?.elementId || step.elementId === 'tutorial-end') {
          return { ...baseStyle, opacity: 0, pointerEvents: 'none' };
      }
      
      const padding = 10;
      return {
          ...baseStyle,
          top: `${targetRect.top - padding}px`,
          left: `${targetRect.left - padding}px`,
          width: `${targetRect.width + padding * 2}px`,
          height: `${targetRect.height + padding * 2}px`,
      }
  }, [targetRect, step]);

  const contentStyle: React.CSSProperties = useMemo(() => {
    let position = step?.position || 'right';
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 52,
      transition: 'all 0.3s ease-in-out',
      willChange: 'transform, top, left',
      pointerEvents: 'auto',
      width: '480px', // Fixed width for mascot + dialog
    };

    if (!targetRect || step?.elementId === 'tutorial-end' || step?.position === 'center') {
      return {
        ...baseStyle,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
      };
    }

    const mascotWidth = 480;
    const mascotHeight = 300; 
    const offset = 20;
    let left: number, top: number, transform: string | undefined;

    // Automatically adjust position based on viewport
    if (position === 'right' && targetRect.right + mascotWidth + offset > window.innerWidth) {
      position = 'left';
    }
    if (position === 'left' && targetRect.left - mascotWidth - offset < 0) {
      position = 'right'; // Failsafe
    }
    if (position === 'bottom' && targetRect.bottom + mascotHeight + offset > window.innerHeight) {
      position = 'top';
    }
    if (position === 'top' && targetRect.top - mascotHeight - offset < 0) {
      position = 'bottom';
    }

    switch (position) {
      case 'right':
        left = targetRect.right + offset;
        top = targetRect.top;
        break;
      case 'left':
        left = targetRect.left - offset;
        top = targetRect.top;
        transform = 'translateX(-100%)';
        break;
      case 'bottom':
        left = targetRect.left;
        top = targetRect.bottom + offset;
        break;
      case 'top':
        left = targetRect.left;
        top = targetRect.top - offset;
        transform = 'translateY(-100%)';
        break;
      default:
        left = targetRect.right + offset;
        top = targetRect.top;
    }

    return { ...baseStyle, top: `${top}px`, left: `${left}px`, transform };
  }, [targetRect, step]);


  if (!step) return null;

  return (
    <div style={overlayStyle}>
       <div style={spotlightStyle}></div>

      {/* The mascot and dialog content */}
      <div style={contentStyle}>
        <div className={`flex items-center gap-4 ${step?.position === 'left' ? 'flex-row-reverse' : 'flex-row'}`}>
          <MascotBrainy />
          <div className="bg-card p-6 rounded-lg shadow-2xl max-w-sm">
            <h3 className="text-xl font-bold font-headline mb-2">{step.title}</h3>
            <p className="text-muted-foreground mb-4">{step.text}</p>
            <Button onClick={handleNext}>
              {currentStepIndex < allSteps.length - 1 ? "Next" : "Got it!"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
