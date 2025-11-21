
'use client';

import { BrainCircuit } from 'lucide-react';

export function Mascot() {
  return (
    <div className="relative w-32 h-48">
      {/* Head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 bg-card rounded-full border-2 border-primary flex items-center justify-center">
        <BrainCircuit className="w-12 h-12 text-primary" />
        {/* Eyes */}
        <div className="absolute top-1/2 -mt-1 flex gap-3">
          <div className="w-2 h-2 bg-primary rounded-full"></div>
          <div className="w-2 h-2 bg-primary rounded-full"></div>
        </div>
        {/* Smile */}
        <div className="absolute bottom-4 w-6 h-3 border-b-2 border-l-2 border-r-2 border-primary rounded-b-full"></div>
      </div>
      {/* Body */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-1 h-16 bg-primary"></div>
      {/* Arms */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-16 h-1">
        <div className="absolute left-0 top-0 w-8 h-1 bg-primary transform -rotate-45 origin-right"></div>
        <div className="absolute right-0 top-0 w-8 h-1 bg-primary transform rotate-45 origin-left"></div>
      </div>
       {/* Legs */}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12">
            <div className="absolute left-0 bottom-0 w-1 h-10 bg-primary transform rotate-12 origin-bottom-left"></div>
            <div className="absolute right-0 bottom-0 w-1 h-10 bg-primary transform -rotate-12 origin-bottom-right"></div>
        </div>
    </div>
  );
}
