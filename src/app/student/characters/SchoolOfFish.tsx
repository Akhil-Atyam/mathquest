
'use client';

import React from 'react';

/**
 * A component for a school of fish swimming.
 */
export function SchoolOfFish() {
  const fish = [
    { x: 10, y: 30, scale: 0.8, delay: '0s' },
    { x: 30, y: 10, scale: 1, delay: '0.2s' },
    { x: 50, y: 40, scale: 0.9, delay: '0.1s' },
    { x: 70, y: 20, scale: 1.1, delay: '0.3s' },
    { x: 90, y: 50, scale: 0.7, delay: '0s' },
    { x: 20, y: 60, scale: 1, delay: '0.4s' },
    { x: 60, y: 70, scale: 0.8, delay: '0.2s' },
  ];

  return (
    <svg viewBox="0 0 120 80" className="w-full h-full overflow-visible">
      <style>{`
        .fish-body {
          animation: swim 4s ease-in-out infinite;
        }
        @keyframes swim {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(10px); }
        }
      `}</style>
      {fish.map((f, i) => (
        <g key={i} transform={`translate(${f.x}, ${f.y}) scale(${f.scale})`} className="fish-body" style={{ animationDelay: f.delay }}>
          <path d="M 0 5 C 10 0, 20 0, 30 5 S 40 10, 30 15 C 20 20, 10 20, 0 15 S -10 10, 0 5 Z" fill="#FBBF24" />
          <path d="M 28 5 L 35 0 L 35 10 Z" fill="#F97316" />
          <circle cx="5" cy="6" r="1.5" fill="black" />
        </g>
      ))}
    </svg>
  );
}
