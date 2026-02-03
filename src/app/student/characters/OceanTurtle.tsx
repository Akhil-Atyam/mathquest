
'use client';

import React from 'react';

/**
 * A more realistic, green, swimming turtle character for the Grade 2 ocean theme.
 */
export function OceanTurtle() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      <g transform="rotate(-20, 75, 75) translate(0, 10)">
        {/* Rear Flipper */}
        <path d="M 50 110 C 30 120, 60 130, 70 115" fill="#3A8E5A" stroke="#2B6B43" strokeWidth="2.5" strokeLinecap="round" />

        {/* Body */}
        <path d="M 50 80 C 20 50, 110 50, 120 80 C 140 110, 80 140, 50 120 C 20 100, 30 90, 50 80 Z" fill="#4C9A62" stroke="#2B6B43" strokeWidth="3"/>
        
        {/* Front Flipper */}
        <path d="M 40 70 C 10 60, 20 100, 45 90" fill="#3A8E5A" stroke="#2B6B43" strokeWidth="3" strokeLinecap="round" />
        
        {/* Head */}
        <circle cx="115" cy="70" r="22" fill="#4C9A62" stroke="#2B6B43" strokeWidth="3"/>
        <g transform="translate(120, 65)">
            <circle cx="0" cy="0" r="5" fill="white" />
            <circle cx="1" cy="0" r="2.5" fill="black" />
        </g>
        <path d="M 110 80 C 115 85, 122 84, 125 80" stroke="#2B6B43" strokeWidth="2" fill="none" strokeLinecap="round"/>

        {/* Shell */}
        <path d="M 50 85 C 50 120, 110 125, 110 85 C 110 60, 50 60, 50 85 Z" fill="#6B4F3A" stroke="#4A3728" strokeWidth="3"/>
        {/* Shell pattern */}
        <path d="M 75 70 L 60 87 L 75 105 L 90 87 Z" stroke="#8D6E4D" strokeWidth="2" fill="none"/>
        <path d="M 75 70 L 75 65" stroke="#8D6E4D" strokeWidth="2" fill="none"/>
        <path d="M 60 87 L 50 85" stroke="#8D6E4D" strokeWidth="2" fill="none"/>
        <path d="M 90 87 L 105 85" stroke="#8D6E4D" strokeWidth="2" fill="none"/>
        <path d="M 75 105 L 75 115" stroke="#8D6E4D" strokeWidth="2" fill="none"/>
      </g>
    </svg>
  );
}
