
'use client';

import React from 'react';

/**
 * A cute, full-bodied knight character for the Grade 4 medieval theme.
 * Redesigned for a more coherent and friendly vector art style.
 */
export function MedievalKnight() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
        {/* Shield */}
        <g transform="translate(10, 50)">
          <path d="M 20 0 L 20 40 C 20 70, 45 85, 45 85 C 45 85, 70 70, 70 40 L 70 0 Z" fill="#E5E7EB" stroke="#4B5563" strokeWidth="3"/>
          <path d="M 45 0 L 45 82" stroke="#4B5563" strokeWidth="2.5"/>
          <path d="M 23 30 L 67 30" stroke="#4B5563" strokeWidth="2.5"/>
          <path d="M 45 15 C 40 25, 50 25, 45 15" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        </g>
      
        {/* Body */}
        <g transform="translate(45, 10)">
          <path d="M30 130 C 15 110, 15 80, 30 70 L 70 70 C 85 80, 85 110, 70 130 Z" fill="#D1D5DB" stroke="#4B5563" strokeWidth="3" />
          <rect x="25" y="125" width="50" height="10" rx="3" fill="#9CA3AF" stroke="#4B5563" strokeWidth="2" />
        
          {/* Arms */}
          <path d="M 20 80 C 5 70, 5 100, 20 110" stroke="#4B5563" strokeWidth="12" fill="none" strokeLinecap="round" />
          <path d="M 80 80 C 95 70, 95 100, 80 110" stroke="#4B5563" strokeWidth="12" fill="none" strokeLinecap="round" />

          {/* Helmet */}
          <path d="M 50 15 C 20 20, 20 65, 50 75 C 80 65, 80 20, 50 15 Z" fill="#9CA3AF" stroke="#4B5563" strokeWidth="3" />
          <path d="M 50 15 L 50 30" stroke="#F87171" strokeWidth="5" strokeLinecap="round"/>
          <path d="M 35 40 L 65 40 L 60 55 L 40 55 Z" fill="#374151" />
        </g>
    </svg>
  );
}
