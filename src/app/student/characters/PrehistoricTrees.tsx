'use client';
import React from 'react';

export function PrehistoricTrees() {
  return (
    <svg viewBox="0 0 150 180" className="w-full h-full" style={{ filter: 'drop-shadow(3px 3px 3px rgba(0,0,0,0.15))' }}>
      {/* Tree 1 */}
      <g transform="translate(-10, 0)">
        <path d="M60 180 C 60 150, 55 120, 50 100" stroke="#8B4513" strokeWidth="8" fill="none" />
        <path d="M50 100 L 20 70 M50 100 L 80 70 M50 100 L 30 100 M50 100 L 70 100 M50 100 L 40 120 M50 100 L 60 120" stroke="#228B22" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* Tree 2 */}
      <g transform="translate(30, 20)">
         <path d="M60 160 C 60 130, 65 100, 70 80" stroke="#A0522D" strokeWidth="6" fill="none" />
        <path d="M70 80 L 40 50 M70 80 L 100 50 M70 80 L 50 80 M70 80 L 90 80 M70 80 L 60 100 M70 80 L 80 100" stroke="#3CB371" strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}
