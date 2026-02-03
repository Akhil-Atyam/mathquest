
'use client';

import React from 'react';

/**
 * A component for a school of fish swimming.
 */
export function SchoolOfFish() {
  const fish = [
    { x: 20, y: 40, scale: 0.8, delay: '0s' },
    { x: 60, y: 15, scale: 1, delay: '0.2s' },
    { x: 5, y: 10, scale: 0.9, delay: '0.1s' },
    { x: 80, y: 30, scale: 1.1, delay: '0.3s' },
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
          <path d="M 10 10 C 20 5, 30 5, 35 10 C 30 15, 20 15, 10 10 L 0 5 L 0 15 Z" fill="#FBBF24" stroke="#F97316" strokeWidth="1"/>
          <circle cx="30" cy="9" r="1.5" fill="black" />
        </g>
      ))}
    </svg>
  );
}
