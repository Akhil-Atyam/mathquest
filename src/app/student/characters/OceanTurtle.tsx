
'use client';

import React from 'react';

/**
 * A friendly, swimming turtle character for the Grade 2 ocean theme.
 * Redesigned for a more coherent and friendly vector art style.
 */
export function OceanTurtle() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      <g transform="rotate(-15, 75, 75) translate(5, 5)">
          {/* Bubbles */}
          <circle cx="20" cy="30" r="5" fill="#A5F3FC" opacity="0.7"/>
          <circle cx="30" cy="45" r="3" fill="#A5F3FC" opacity="0.6"/>
          <circle cx="130" cy="110" r="6" fill="#A5F3FC" opacity="0.8"/>

          {/* Body */}
          <path d="M 50 80 C 20 50, 110 50, 120 80 C 140 110, 80 140, 50 120 C 20 100, 30 90, 50 80 Z" fill="#2DD4BF" stroke="#047857" strokeWidth="3"/>
          
          {/* Flippers */}
          <path d="M 40 70 C 10 60, 20 100, 45 90" fill="#2DD4BF" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
          <path d="M 125 80 C 145 70, 145 100, 120 95" fill="#2DD4BF" stroke="#047857" strokeWidth="3" strokeLinecap="round" />
          <path d="M 50 120 C 30 130, 60 140, 70 125" fill="#2DD4BF" stroke="#047857" strokeWidth="3" strokeLinecap="round" />

          {/* Head */}
          <circle cx="115" cy="70" r="22" fill="#2DD4BF" stroke="#047857" strokeWidth="3"/>
          <g transform="translate(120, 65)">
              <circle cx="0" cy="0" r="5" fill="white" />
              <circle cx="1" cy="0" r="2.5" fill="black" />
          </g>
          <path d="M 110 80 C 115 85, 122 84, 125 80" stroke="#047857" strokeWidth="2" fill="none" strokeLinecap="round"/>

          {/* Shell */}
          <path d="M 50 85 C 50 120, 110 125, 110 85 C 110 60, 50 60, 50 85 Z" fill="#14B8A6" stroke="#065F46" strokeWidth="3"/>
          <path d="M 75 70 L 60 87 L 75 105 L 90 87 Z" stroke="#064E3B" strokeWidth="2" fill="none"/>
          <path d="M 75 70 L 75 65" stroke="#064E3B" strokeWidth="2" fill="none"/>
          <path d="M 60 87 L 50 85" stroke="#064E3B" strokeWidth="2" fill="none"/>
          <path d="M 90 87 L 105 85" stroke="#064E3B" strokeWidth="2" fill="none"/>
          <path d="M 75 105 L 75 115" stroke="#064E3B" strokeWidth="2" fill="none"/>
      </g>
    </svg>
  );
}
