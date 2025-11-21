
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
  requireClick?: boolean;
  navigateTo?: string;
  page?: string; // Which page this step belongs to
};

const allSteps: TutorialStep[] = [
  // --- Initial Page Load / Any page ---
  {
    page: 'any',
    elementId: 'tutorial-dashboard',
    title: 'Welcome to your Dashboard!',
    text: 'This is your home base. Click here to see your progress, assignments, and earned badges.',
    position: 'right',
    requireClick: true,
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

  const step = useMemo(() => allSteps[currentStepIndex], [currentStepIndex]);

  // Update localStorage whenever the step index changes
  useEffect(() => {
    localStorage.setItem('tutorialStep', String(currentStepIndex));
  }, [currentStepIndex]);

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
        // Manage highlight class
        if (highlightedElementRef.current !== element) {
            highlightedElementRef.current?.classList.remove('tutorial-highlight');
            element.classList.add('tutorial-highlight');
            highlightedElementRef.current = element;
        }
    } else {
        setTargetRect(null);
    }
  }, [step]);
  
  // Recalculate spotlight on scroll and resize
  useEffect(() => {
    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);
    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    }
  }, [currentStepIndex, pathname, updateTargetRect]);

  const handleNext = () => {
    if (currentStepIndex >= allSteps.length - 1) {
      onComplete();
      localStorage.removeItem('tutorialStep');
      if (highlightedElementRef.current) {
          highlightedElementRef.current.classList.remove('tutorial-highlight');
      }
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleElementClick = useCallback((e: MouseEvent) => {
    if (step?.requireClick && step.elementId) {
        const targetElement = document.getElementById(step.elementId);
        if (targetElement && targetElement.contains(e.target as Node)) {
            e.preventDefault();
            e.stopPropagation();

            if (step.navigateTo) {
                router.push(step.navigateTo);
            }
            handleNext();
        }
    }
  }, [step, router]);


  // Effect to manage step logic and event listeners
  useEffect(() => {
    if (!step) {
        onComplete();
        return;
    };
    
    // Page validation
    const currentPathMatches = step.page === pathname;
    const isInitialStep = step.page === 'any';
    if (!currentPathMatches && !isInitialStep) {
        // If we are on the wrong page, maybe do nothing or try to find the correct step
        const correctStepIndex = allSteps.findIndex(s => s.page === pathname);
        if (correctStepIndex !== -1) {
            setCurrentStepIndex(correctStepIndex);
        }
        return;
    }

    const timer = setTimeout(updateTargetRect, 100);

    if (step.requireClick) {
        document.body.addEventListener('click', handleElementClick, true);
    }

    return () => {
        clearTimeout(timer);
        if (highlightedElementRef.current) {
            highlightedElementRef.current.classList.remove('tutorial-highlight');
            highlightedElementRef.current = null;
        }
        if (step.requireClick) {
            document.body.removeEventListener('click', handleElementClick, true);
        }
    }
  }, [currentStepIndex, pathname, step, updateTargetRect, handleElementClick, onComplete]);


  const overlayStyle: React.CSSProperties = useMemo(() => {
     return {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 51,
        transition: 'all 0.3s ease-in-out',
        pointerEvents: step?.requireClick ? 'auto' : 'none',
     }
  }, [step]);
  
  const spotlightStyle: React.CSSProperties = useMemo(() => {
      const baseStyle: React.CSSProperties = {
          position: 'fixed',
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
          borderRadius: '1rem',
          pointerEvents: 'none',
      };
      
      if (!targetRect || !step?.elementId || step.elementId === 'tutorial-end') {
         // This makes the spotlight invisible when centered or not needed.
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
    const position = step?.position || 'right';
    const baseStyle: React.CSSProperties = {
        position: 'fixed',
        zIndex: 52,
        transition: 'all 0.3s ease-in-out',
        willChange: 'transform, top, left',
    };

    if (!targetRect || step?.elementId === 'tutorial-end') {
        return {
            ...baseStyle,
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
            return {...baseStyle, top: `${top}px`, left: `${left}px`};
        case 'left':
            top = targetRect.top;
            left = targetRect.left - offset;
            return {...baseStyle, top: `${top}px`, left: `${left}px`, transform: 'translateX(-100%)'};
        case 'bottom':
            top = targetRect.bottom + offset;
            left = targetRect.left;
            return {...baseStyle, top: `${top}px`, left: `${left}px`};
        case 'top':
            top = targetRect.top - offset;
            left = targetRect.left;
            return {...baseStyle, top: `${top}px`, left: `${left}px`, transform: 'translateY(-100%)'};
        default:
             return {...baseStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    }
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
            {!step.requireClick && (
              <Button onClick={handleNext}>
                {currentStepIndex < allSteps.length - 1 ? "Next" : "Got it!"}
              </Button>
            )}
            {step.requireClick && (
                 <p className="text-sm font-semibold text-primary animate-pulse">Click the highlighted item to continue!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
