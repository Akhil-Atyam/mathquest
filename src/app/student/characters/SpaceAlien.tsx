
'use client';

import React from 'react';

/**
 * A cute alien in a flying saucer character for the Grade 3 space theme.
 * Redesigned for a more coherent and friendly vector art style.
 */
export function SpaceAlien() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      <g transform="translate(5, 15)">
        {/* UFO Saucer */}
        <path d="M 20 80 Q 75 40, 130 80 Z" fill="#94A3B8" stroke="#475569" strokeWidth="3"/>
        <ellipse cx="75" cy="80" rx="60" ry="20" fill="#E2E8F0" stroke="#475569" strokeWidth="3"/>
        
        {/* UFO Lights */}
        <circle cx="45" cy="82" r="4" fill="#FBBF24" stroke="white" strokeWidth="1"/>
        <circle cx="75" cy="84" r="4" fill="#F87171" stroke="white" strokeWidth="1"/>
        <circle cx="105" cy="82" r="4" fill="#4ADE80" stroke="white" strokeWidth="1"/>
        
        {/* Alien Body */}
        <path d="M60 55 C 40 80, 110 80, 90 55 Z" fill="#86EFAC" stroke="#166534" strokeWidth="3" />
        
        {/* Alien Head */}
        <g transform="translate(0, -10)">
            <path d="M75,10 C 50,10 40,50 75,55 C 110,50 100,10 75,10 Z" fill="#86EFAC" stroke="#166534" strokeWidth="3"/>
            
            {/* Eye */}
            <circle cx="75" cy="35" r="10" fill="black" />
            <circle cx="78" cy="32" r="4" fill="white" />

            {/* Mouth */}
            <path d="M70 48 C 75 52, 80 48, 70 48" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round" />
            
            {/* Antenna */}
            <path d="M 75 10 L 75 0" stroke="#166534" strokeWidth="2"/>
            <circle cx="75" cy="-3" r="4" fill="#FBBF24" stroke="#166534" strokeWidth="2"/>
        </g>
      </g>
    </svg>
  );
}
