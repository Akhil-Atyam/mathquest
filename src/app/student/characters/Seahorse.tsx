
'use client';

import React from 'react';

/**
 * A realistic seahorse SVG component.
 */
export function Seahorse() {
  return (
    <svg viewBox="0 0 50 100" className="w-full h-full">
        <path 
            d="M35 10 C 45 5, 50 20, 40 30 S 20 35, 25 50 C 30 65, 45 75, 30 90 C 15 105, 20 85, 20 70 C 20 55, 10 50, 15 40 C 20 30, 25 15, 35 10 Z" 
            fill="#F9A825" 
            stroke="#C7881A" 
            strokeWidth="2"
        />
        <path d="M30 75 C 35 70, 40 75, 45 80" fill="none" stroke="#C7881A" strokeWidth="1.5" />
        <path d="M32 80 C 37 75, 42 80, 47 85" fill="none" stroke="#C7881A" strokeWidth="1.5" />
        <circle cx="38" cy="22" r="2" fill="black" />
    </svg>
  );
}
