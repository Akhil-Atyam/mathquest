
'use client';

import { BrainCircuit } from 'lucide-react';

export function Mascot() {
  return (
    <div className="relative w-32 h-48 select-none">
      {/* Head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-24">
        {/* Brain SVG */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M50 10 C 25 10, 20 30, 20 50 C 20 70, 25 90, 50 90 C 75 90, 80 70, 80 50 C 80 30, 75 10, 50 10 Z" fill="#FFC0CB" stroke="#E5A9B4" strokeWidth="3"/>
            <path d="M50 10 Q 60 20, 50 30 Q 40 40, 50 50 Q 60 60, 50 70 Q 40 80, 50 90" fill="none" stroke="#E5A9B4" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 10 C 40 25, 40 35, 50 50" fill="none" stroke="#E5A9B4" strokeWidth="2" strokeLinecap="round" />
             <path d="M50 90 C 60 75, 60 65, 50 50" fill="none" stroke="#E5A9B4" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Eyes */}
        <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex gap-4">
          <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
          </div>
          <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
          </div>
        </div>
        {/* Smile */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-8 h-4 border-b-4 border-l-4 border-r-4 border-gray-800 rounded-b-full"></div>
      </div>
      
      {/* Body */}
      <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-20 h-24 bg-card rounded-t-xl rounded-b-3xl border-2 border-primary"></div>
      
      {/* Arms */}
      <div className="absolute top-[95px] left-1/2 -translate-x-[calc(50%+40px)] w-8 h-8 bg-card rounded-full border-2 border-primary transform -rotate-45"></div>
       <div className="absolute top-[95px] left-1/2 translate-x-[40px] w-8 h-8 bg-card rounded-full border-2 border-primary transform rotate-45"></div>

      {/* Legs */}
       <div className="absolute bottom-[-5px] left-1/2 -translate-x-[calc(50%+5px)] w-10 h-10 bg-card rounded-full border-2 border-primary"></div>
       <div className="absolute bottom-[-5px] left-1/2 -translate-x-[calc(50%-25px)] w-10 h-10 bg-card rounded-full border-2 border-primary"></div>
    </div>
  );
}
