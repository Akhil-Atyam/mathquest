
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Mascot } from './Mascot';
import { Button } from '@/components/ui/button';

const steps = [
  {
    elementId: 'tutorial-dashboard',
    title: 'Welcome to your Dashboard!',
    text: 'This is your home base. You can see your progress, assignments, and earned badges here.',
    position: 'right',
  },
  {
    elementId: 'tutorial-resources',
    title: 'Explore Learning Resources',
    text: 'Here you can find all the lessons, quizzes, and fun activities available for your grade.',
    position: 'right',
  },
  {
    elementId: 'tutorial-book-session',
    title: 'Book a Tutoring Session',
    text: "Need extra help? Schedule a one-on-one or group session with one of our friendly teachers.",
    position: 'right',
  },
  {
    elementId: 'tutorial-my-sessions',
    title: 'View Your Sessions',
    text: 'Check your upcoming and past tutoring sessions here. You can also find the meeting links for upcoming sessions.',
    position: 'right',
  },
  {
    elementId: 'tutorial-end',
    title: "You're all set!",
    text: "That's the grand tour! You're ready to start your math adventure. Have fun!",
    position: 'center',
  }
];

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    const step = steps[currentStep];
    if (step.elementId === 'tutorial-end') {
      setTargetRect(null); // Center the final message
      return;
    }
    // Using a timeout to ensure the element is painted before getting its rect
    const timer = setTimeout(() => {
        const element = document.getElementById(step.elementId);
        if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        // Highlight the element by adding a class
        element.classList.add('tutorial-highlight');
        }
    }, 100); // A small delay

    return () => {
        clearTimeout(timer);
        // Clean up the highlight class from the previous element
        if (currentStep > 0) {
            const prevStep = steps[currentStep-1];
            const prevElement = document.getElementById(prevStep.elementId);
            prevElement?.classList.remove('tutorial-highlight');
        }
    }
  }, [currentStep]);

  const overlayStyle: React.CSSProperties = useMemo(() => {
     if (!targetRect) {
        // Full overlay for the final centered message
        return {
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        }
     }
     // Create a "cutout" effect using box-shadow
     const padding = 10;
     return {
        position: 'absolute',
        top: `${targetRect.top - padding}px`,
        left: `${targetRect.left - padding}px`,
        width: `${targetRect.width + padding * 2}px`,
        height: `${targetRect.height + padding * 2}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.7)',
        borderRadius: '0.75rem', // Match shadcn's radius
        zIndex: 51, // Above the overlay, below the content
     }
  }, [targetRect]);
  
  const contentStyle: React.CSSProperties = useMemo(() => {
    if (!targetRect) {
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
        }
    }
    return {
      top: `${targetRect.top}px`,
      left: `${targetRect.right + 20}px`, // Position to the right of the highlighted element
    };
  }, [targetRect]);

  const handleNext = () => {
    // Before moving to next step, remove highlight from current element
    const currentElement = document.getElementById(steps[currentStep].elementId);
    currentElement?.classList.remove('tutorial-highlight');

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div
      className="fixed inset-0 z-50"
    >
       {/* The spotlight cutout div */}
       <div style={overlayStyle}></div>

      {/* The mascot and dialog content */}
      <div className="fixed z-50" style={contentStyle}>
        <div className="flex items-center gap-4">
          <Mascot />
          <div className="bg-card p-6 rounded-lg shadow-2xl max-w-sm">
            <h3 className="text-xl font-bold font-headline mb-2">{step.title}</h3>
            <p className="text-muted-foreground mb-4">{step.text}</p>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? 'Next' : 'Got it!'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
