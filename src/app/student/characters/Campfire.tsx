
'use client';

import React from 'react';

/**
 * A more realistic campfire SVG component.
 */
export function Campfire() {
  return (
    <svg viewBox="0 0 100 80" className="w-full h-full" style={{ filter: 'drop-shadow(2px 4px 6px rgba(0,0,0,0.1))' }}>
      <g>
        {/* Logs */}
        <path d="M 15 75 L 85 65" stroke="#6B4226" strokeWidth="8" strokeLinecap="round" />
        <path d="M 15 65 L 85 75" stroke="#5C3317" strokeWidth="8" strokeLinecap="round" />
        <path d="M 15 70 L 85 70" stroke="#4a2509" strokeWidth="4" strokeLinecap="round" />

        {/* Flames */}
        <g>
            <path d="M 50 70 C 30 60, 30 30, 50 30 C 70 30, 70 60, 50 70" fill="#FDB813" opacity="0.8" />
            <path d="M 50 65 C 40 58, 40 40, 50 40 C 60 40, 60 58, 50 65" fill="#F88624" opacity="0.9" />
            <path d="M 50 60 C 45 55, 45 45, 50 45 C 55 45, 55 55, 50 60" fill="#F2490C" />
            <path d="M 50 55 C 48 52, 48 48, 50 48 C 52 48, 52 52, 50 55" fill="yellow" />
        </g>
      </g>
    </svg>
  );
}
