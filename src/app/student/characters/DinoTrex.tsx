
'use client';

import React from 'react';

/**
 * A cute, green, baby T-Rex character for the Grade 5 dinosaur theme.
 * Redesigned for a more recognizable and friendly appearance.
 */
export function DinoTrex() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      <g transform="translate(0, 5)">
        {/* Tail */}
        <path d="M25 110 C 10 120, 10 135, 28 135 C 45 140, 55 120, 45 110 Z" fill="#4ADE80" />
        <path d="M25 110 C 10 120, 10 135, 28 135 C 45 140, 55 120, 45 110 Z" stroke="#166534" strokeWidth="3" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        
        {/* Left Leg */}
        <path d="M60 135 C 55 120, 70 120, 70 135" stroke="#166534" strokeWidth="3" fill="#4ADE80" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M 62 134 L 58 140 L 72 140 L 68 134" fill="#F7FEE7" />

        {/* Body */}
        <path d="M50,135 C40,90 80,60 110,65 C130,70 140,110 115,135 Z" fill="#4ADE80" stroke="#166534" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
        
        {/* Belly Patch */}
        <path d="M75,134 C70,110 95,100 110,100 C 120,105 118,125 112,134 Z" fill="#F0FDF4" />
        
        {/* Right Leg */}
        <path d="M85 135 C 80 120, 95 120, 95 135" stroke="#166534" strokeWidth="3" fill="#4ADE80" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M 87 134 L 83 140 L 97 140 L 93 134" fill="#F7FEE7" />
        
        {/* Arms */}
        <path d="M95 100 C 90 95, 95 90, 100 92" stroke="#166534" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        
        {/* Head */}
        <g transform="translate(85, 40)">
            <path d="M 25 25 C -20 35, -5 80, 25 70 C 50 60, 55 35, 25 25 Z" fill="#4ADE80" stroke="#166534" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round"/>
            
            {/* Eye */}
            <g transform="translate(10, 35)">
                <circle cx="0" cy="0" r="8" fill="white" />
                <circle cx="1" cy="1" r="5" fill="black" />
                <circle cx="0" cy="-1" r="2" fill="white" />
            </g>

            {/* Mouth */}
            <path d="M 35 60 C 30 65, 20 65, 15 60" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round"/>

            {/* Nostril */}
            <path d="M-2 45 C-1 43, 1 43, 2 45" stroke="#166534" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </g>
      </g>
    </svg>
  );
}
