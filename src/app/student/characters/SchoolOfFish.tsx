
'use client';

import React from 'react';

/**
 * A component for a school of fish swimming.
 */
export function SchoolOfFish() {
  const fish = [
    { x: 10, y: 30, scale: 0.8, delay: '0s' },
    { x: 40, y: 10, scale: 1, delay: '0.2s' },
    { x: 70, y: 40, scale: 0.9, delay: '0.1s' },
    { x: 90, y: 20, scale: 1.1, delay: '0.3s' },
  ];

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full overflow-visible">
      <style>{`
        .fish-body {
          animation: swim 6s ease-in-out infinite;
        }
        @keyframes swim {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(15px); }
        }
      `}</style>
      {fish.map((f, i) => (
        <g key={i} transform={`translate(${f.x}, ${f.y}) scale(${f.scale})`} className="fish-body" style={{ animationDelay: f.delay }}>
          <path d="M0,5 C15,0 25,0 30,8 L35,5 L30,12 C25,20 15,20 0,15 C-5,10 0,5 0,5Z" fill="#FBBF24" stroke="#F97316" strokeWidth="0.5"/>
          <circle cx="5" cy="8" r="1.5" fill="black" />
        </g>
      ))}
    </svg>
  );
}
