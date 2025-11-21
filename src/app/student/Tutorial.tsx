
'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Mascot } from './Mascot';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';

type TutorialStep = {
  elementId?: string;
  title: string;
  text: string;
  position?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  requireClick?: boolean;
  navigateTo?: string;
  page?: string; // Which page this step belongs to
};

const allSteps: TutorialStep[] = [
  // --- Initial Page Load ---
  {
    elementId: 'tutorial-dashboard',
    title: 'Welcome to your Dashboard!',
    text: 'This is your home base. Click here to see your progress, assignments, and earned badges.',
    position: 'right',
    requireClick: true,
    navigateTo: '/student/dashboard',
    page: 'initial',
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
    text: "Click here to see all the lessons and quizzes your teacher has assigned just for you.",
    position: 'bottom',
  },
  {
    page: '/student/dashboard',
    elementId: 'tutorial-resources',
    title: 'Explore Learning Resources',
    text: 'Ready for more? Click here to explore all lessons and quizzes!',
    position: 'right',
    requireClick: true,
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
    elementId: 'tutorial-quest-path',
    title: 'Your Learning Path',
    text: "This is your adventure! Complete lessons and quizzes to move along the path and unlock new challenges.",
    position: 'bottom',
  },
  {
    page: '/student/resources',
    elementId: 'tutorial-book-session',
    title: 'Book a Tutoring Session',
    text: "Need extra help? Schedule a one-on-one or group session with one of our friendly teachers.",
    position: 'right',
    requireClick: true,
    navigateTo: '/student/tutoring',
  },
    // --- Tutoring Page ---
  {
    page: '/student/tutoring',
    elementId: 'tutorial-my-sessions',
    title: 'View Your Sessions',
    text: 'Finally, click here to check your upcoming and past tutoring sessions.',
    position: 'right',
    requireClick: true,
    navigateTo: '/student/my-sessions',
  },
   // --- Final Step ---
  {
    page: '/student/my-sessions',
    elementId: 'tutorial-end',
    title: "You're all set!",
    text: "That's the grand tour! You're ready to start your math adventure. Have fun!",
    position: 'center',
  }
];

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isWaitingForClick, setIsWaitingForClick] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const highlightedElementRef = useRef<HTMLElement | null>(null);

  const step = useMemo(() => {
     // Find the current step in the global `allSteps` array
     return allSteps[currentStepIndex];
  }, [currentStepIndex]);


  // This useCallback will be our single source of truth for updating the spotlight position
  const updateTargetRect = useCallback(() => {
    if (!step?.elementId || step.elementId === 'tutorial-end') {
      setTargetRect(null);
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
        setTargetRect(null);
    }
  }, [step]);

  // Effect to update the spotlight when the step or page changes, or on window resize
  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    return () => window.removeEventListener('resize', updateTargetRect);
  }, [currentStepIndex, pathname, updateTargetRect]);

  // Effect to listen for scroll events and update the spotlight position
  useEffect(() => {
    window.addEventListener('scroll', updateTargetRect, true); // Use capture phase
    return () => window.removeEventListener('scroll', updateTargetRect, true);
  }, [updateTargetRect]);

  // Effect to manage step logic and highlighting
  useEffect(() => {
    if (!step) return;

    if (step.requireClick && step.navigateTo) {
        setIsWaitingForClick(true);
    } else {
        setIsWaitingForClick(false);
    }
    
    // Using a timeout to ensure the element is painted before getting its rect
    const timer = setTimeout(updateTargetRect, 200);

    return () => {
        clearTimeout(timer);
        if (highlightedElementRef.current) {
            highlightedElementRef.current.classList.remove('tutorial-highlight');
            highlightedElementRef.current = null;
        }
    }
  }, [currentStepIndex, pathname, step, updateTargetRect]);


  const overlayStyle: React.CSSProperties = useMemo(() => {
     const baseStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 51,
        transition: 'all 0.3s ease-in-out',
     };
     
     if (!targetRect) {
        // Full overlay for the final centered message or while waiting
        return {
            ...baseStyle,
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        }
     }
     // Create a "cutout" effect using box-shadow
     const padding = 20; // Increased padding to ensure mascot+dialog are included
     return {
        ...baseStyle,
        top: `${targetRect.top - padding}px`,
        left: `${targetRect.left - padding}px`,
        width: `${targetRect.width + padding * 2}px`,
        height: `${targetRect.height + padding * 2}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        borderRadius: '1rem', // Softer radius
     }
  }, [targetRect]);
  
  const contentStyle: React.CSSProperties = useMemo(() => {
    const position = step?.position || 'right';

    if (!targetRect) {
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
        }
    }
    
    let top = 0, left = 0;
    const offset = 20;

    switch(position) {
        case 'right':
            top = targetRect.top;
            left = targetRect.right + offset;
            break;
        case 'left':
            top = targetRect.top;
            left = targetRect.left - offset;
            break;
        case 'bottom':
            top = targetRect.bottom + offset;
            left = targetRect.left;
            break;
        case 'top':
            top = targetRect.top - offset;
            left = targetRect.left;
            break;
    }


    return {
      top: `${top}px`,
      left: `${left}px`,
      transform: position === 'left' ? 'translateX(-100%)' : position === 'top' ? 'translateY(-100%)' : 'none',
      transition: 'all 0.3s ease-in-out',
    };
  }, [targetRect, step]);

  const handleNext = () => {
    if (step.requireClick && step.navigateTo) {
        setIsWaitingForClick(true);
        router.push(step.navigateTo);
    }
    
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  if (!step) {
    return null; // No more steps
  }


  return (
    <div className="fixed inset-0 z-50">
       <div style={overlayStyle}></div>

      {/* The mascot and dialog content */}
      <div className="fixed z-[52]" style={contentStyle}>
        <div className={`flex items-center gap-4 ${step?.position === 'left' ? 'flex-row-reverse' : 'flex-row'}`}>
          <Mascot />
          <div className="bg-card p-6 rounded-lg shadow-2xl max-w-sm">
            <h3 className="text-xl font-bold font-headline mb-2">{step.title}</h3>
            <p className="text-muted-foreground mb-4">{step.text}</p>
            <Button onClick={handleNext}>
              {currentStepIndex < allSteps.length - 1 ? (step.requireClick ? 'Click the highlighted item!' : 'Next') : "Got it!"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
