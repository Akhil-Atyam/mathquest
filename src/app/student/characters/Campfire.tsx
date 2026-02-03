
'use client';

import React from 'react';

/**
 * A realistic campfire SVG component.
 */
export function Campfire() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))' }}>
      {/* Logs */}
      <g stroke="#6B4226" strokeWidth="6" strokeLinecap="round">
        <path d="M 20 85 L 80 75" />
        <path d="M 20 75 L 80 85" />
      </g>
      
      {/* Flames */}
      <g>
        <path d="M 50 80 C 40 70, 40 50, 50 50 C 60 50, 60 70, 50 80" fill="#FDB813" />
        <path d="M 50 75 C 45 68, 45 55, 50 55 C 55 55, 55 68, 50 75" fill="#F88624" />
        <path d="M 50 70 C 48 65, 48 58, 50 58 C 52 58, 52 65, 50 70" fill="#F2490C" />
      </g>
    </svg>
  );
}
