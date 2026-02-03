
'use client';

import React from 'react';

export function ForestFox() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      {/* Head */}
      <path d="M 75 30 C 40 30, 30 70, 75 110 C 120 70, 110 30, 75 30 Z" fill="#F97316" stroke="#9A3412" strokeWidth="3"/>
      {/* Inner Face */}
      <path d="M 75 60 C 60 60, 55 80, 75 95 C 95 80, 90 60, 75 60 Z" fill="white"/>
      <path d="M 75 95 C 65 105, 85 105, 75 95 L 75 110" fill="white"/>
      {/* Ears */}
      <path d="M 45 45 C 35 25, 60 30, 45 45 Z" fill="#F97316" stroke="#9A3412" strokeWidth="3"/>
      <path d="M 105 45 C 115 25, 90 30, 105 45 Z" fill="#F97316" stroke="#9A3412" strokeWidth="3"/>
      <path d="M 50 45 C 45 35, 60 35, 50 45 Z" fill="white"/>
      <path d="M 100 45 C 105 35, 90 35, 100 45 Z" fill="white"/>
      {/* Nose */}
      <circle cx="75" cy="85" r="5" fill="black"/>
      {/* Eyes */}
      <circle cx="65" cy="70" r="4" fill="black"/>
      <circle cx="85" cy="70" r="4" fill="black"/>
    </svg>
  );
}
