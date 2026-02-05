
'use client';

import React from 'react';

export function Shield() {
  return (
    <svg viewBox="0 0 90 95" className="w-full h-full">
        <g transform="translate(10, 5)">
          <path d="M 20 0 L 20 40 C 20 70, 45 85, 45 85 C 45 85, 70 70, 70 40 L 70 0 Z" fill="#E5E7EB" stroke="#4B5563" strokeWidth="3"/>
          <path d="M 45 0 L 45 82" stroke="#4B5563" strokeWidth="2.5"/>
          <path d="M 23 30 L 67 30" stroke="#4B5563" strokeWidth="2.5"/>
          <path d="M 45 15 C 40 25, 50 25, 45 15" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
        </g>
    </svg>
  );
}
