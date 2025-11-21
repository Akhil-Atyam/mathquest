
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
    const element = document.getElementById(step.elementId);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
    }
  }, [currentStep]);

  const spotlightStyle: React.CSSProperties = useMemo(() => {
    if (!targetRect) {
      return {
        clipPath: 'inset(0 0 0 0)',
      };
    }
    const padding = 10;
    return {
      clipPath: `inset(0 0 0 0 round 10px)`, // The outer part is visible
      WebkitMask: `
        radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + padding}px, black ${Math.max(targetRect.width, targetRect.height) / 2 + padding + 1}px)
      `,
      mask: `
        radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + padding}px, black ${Math.max(targetRect.width, targetRect.height) / 2 + padding + 1}px)
      `,
    };
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = steps[currentStep];

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50"
      style={{
        backdropFilter: 'blur(2px)',
      }}
    >
      {/* This div creates the spotlight effect by being "cut out" */}
       <div
            className="fixed inset-0"
            style={{
                background: `radial-gradient(circle at ${targetRect ? targetRect.left + targetRect.width/2 : window.innerWidth/2}px ${targetRect ? targetRect.top + targetRect.height/2 : window.innerHeight/2}px, transparent 100px, rgba(0,0,0,0.7) 101px)`,
                clipPath: targetRect ? `path('M0,0 H${window.innerWidth} V${window.innerHeight} H0Z M${targetRect.left - 10},${targetRect.top - 10} V${targetRect.bottom + 10} H${targetRect.right + 10} V${targetRect.top - 10}Z')` : 'none',
            }}
        ></div>

      <div className="fixed" style={contentStyle}>
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
