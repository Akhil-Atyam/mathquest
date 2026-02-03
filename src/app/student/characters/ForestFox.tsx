
'use client';

import React from 'react';

/**
 * A cute, full-bodied fox character for the Grade 1 forest theme.
 * Redesigned for a more coherent and friendly vector art style.
 */
export function ForestFox() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      <g transform="translate(5, 5)">
        {/* Tail */}
        <path d="M20 90 C 0 120, 30 140, 60 120 C 50 110, 40 100, 30 90" fill="#F97316" stroke="#9A3412" strokeWidth="3" strokeLinecap="round"/>
        <path d="M60 120 C 65 130, 55 135, 50 125" fill="white" stroke="#9A3412" strokeWidth="3" strokeLinecap="round" />
        
        {/* Body */}
        <path d="M30,90 C40,40 100,40 110,90 C120,130 90,145 65,140 C 40,145 20,130 30,90 Z" fill="#F97316" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round"/>
        
        {/* Inner Body */}
        <path d="M60,140 C60,110 80,110 80,140" fill="white" />
        <path d="M60,95 C70,115 80,95" fill="none" />
        <path d="M 60 95 C 70 105, 70 115, 60 140" stroke="white" strokeWidth="10" fill="none" />
        <path d="M 80 95 C 70 105, 70 115, 80 140" stroke="white" strokeWidth="10" fill="none" />
        
        {/* Head */}
        <g transform="translate(70, 70)">
            <path d="M0,0 C-30,-5 -40,30 0,35 C40,30 30,-5 0,0 Z" fill="#F97316" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M0,15 C-20,20 -15,35 0,35 C15,35 20,20 0,15 Z" fill="white" />

            {/* Ears */}
            <path d="M-15,-2 C-30,-20 -5,-20 -15,-2" fill="#F97316" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M15,-2 C30,-20 5,-20 15,-2" fill="#F9731d" stroke="#9A3412" strokeWidth="3" strokeLinejoin="round"/>
            <path d="M-14, -4 C-20, -15 -10, -15 -14, -4" fill="#4B0082" />

            {/* Eyes */}
            <circle cx="-10" cy="12" r="3" fill="black" />
            <circle cx="10" cy="12" r="3" fill="black" />

            {/* Nose */}
            <path d="M0,22 C-2,25 2,25 0,22" fill="black" />
        </g>
      </g>
    </svg>
  );
}
