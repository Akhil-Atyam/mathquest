
'use client';

import { Divide, Grip, Minus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * A client-side component to render decorative, animated math icons.
 * This is done on the client to prevent hydration mismatches caused by random animations and positioning.
 */
export function QuestPathDecorations() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // An array of decoration configurations
  const decorations = [
    { Icon: Plus, className: 'top-10 left-10 bg-accent/20 text-accent animate-bounce', size: 'w-8 h-8' },
    { Icon: Minus, className: 'top-1/4 right-10 bg-primary/20 text-primary animate-pulse', size: 'w-8 h-8' },
    { Icon: X, className: 'top-1/2 left-1/4 bg-destructive/20 text-destructive animate-pulse delay-500', size: 'w-6 h-6' },
    { Icon: Divide, className: 'bottom-1/4 right-1/4 bg-green-500/20 text-green-600 animate-bounce delay-700', size: 'w-8 h-8' },
    { Icon: Grip, className: 'bottom-10 right-1/2 bg-purple-500/20 text-purple-600 animate-pulse delay-300', size: 'w-8 h-8' },
    { Icon: Plus, className: 'top-2/3 left-1/3 bg-blue-500/20 text-blue-600 animate-bounce delay-200', size: 'w-6 h-6' },
    { Icon: Minus, className: 'bottom-1/2 left-1/2 bg-orange-500/20 text-orange-600 animate-pulse delay-400', size: 'w-7 h-7' },
  ];

  return (
    <>
      {decorations.map(({ Icon, className, size }, index) => (
        <div key={index} className={`absolute p-2 rounded-full z-[-1] ${className}`}>
          <Icon className={size} />
        </div>
      ))}
    </>
  );
}
