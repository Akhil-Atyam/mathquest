
'use client';

import React from 'react';

/**
 * A seaweed SVG component.
 */
export function Seaweed() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full text-green-600/70">
        <path d="M 50 200 C 20 150, 80 100, 50 50 S 20 0, 50 0" fill="none" stroke="currentColor" strokeWidth="6" />
        <path d="M 50 180 C 60 160, 40 140, 50 120" fill="none" stroke="currentColor" strokeWidth="4" />
        <path d="M 50 90 C 40 70, 60 50, 50 30" fill="none" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}
