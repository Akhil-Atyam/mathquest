
'use client';

import React from 'react';

export function OceanTurtle() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      {/* Shell */}
      <path d="M 40 80 C 20 120, 130 120, 110 80 C 110 60, 40 60, 40 80 Z" fill="#10B981" stroke="#047857" strokeWidth="3"/>
      {/* Shell pattern */}
      <path d="M 75 70 L 60 85 L 75 100 L 90 85 Z" fill="none" stroke="#065F46" strokeWidth="2"/>
      <path d="M 50 80 L 60 85" stroke="#065F46" strokeWidth="2"/>
      <path d="M 100 80 L 90 85" stroke="#065F46" strokeWidth="2"/>
      <path d="M 75 100 L 75 110" stroke="#065F46" strokeWidth="2"/>
      {/* Head */}
      <circle cx="110" cy="70" r="20" fill="#34D399" stroke="#059669" strokeWidth="3"/>
      <circle cx="115" cy="65" r="4" fill="white"/>
      <circle cx="116" cy="65" r="2" fill="black"/>
      {/* Flippers */}
      <path d="M 35 90 C 20 80, 20 100, 35 100" fill="#34D399" stroke="#059669" strokeWidth="2"/>
      <path d="M 115 90 C 130 80, 130 100, 115 100" fill="#34D399" stroke="#059669" strokeWidth="2"/>
    </svg>
  );
}
