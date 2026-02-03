
'use client';

import React from 'react';

export function SpaceAlien() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      {/* UFO */}
      <path d="M 20 80 Q 75 40, 130 80 Z" fill="#E5E7EB" stroke="#6B7280" strokeWidth="3"/>
      <ellipse cx="75" cy="80" rx="60" ry="20" fill="#E5E7EB" stroke="#6B7280" strokeWidth="3"/>
      {/* Body */}
      <path d="M 60 80 C 60 100, 90 100, 90 80 Z" fill="#A78BFA" stroke="#6D28D9" strokeWidth="3"/>
      {/* Eye */}
      <circle cx="75" cy="90" r="12" fill="white" stroke="#6D28D9" strokeWidth="2"/>
      <circle cx="75" cy="90" r="6" fill="black"/>
      {/* Antenna */}
      <path d="M 75 50 L 75 60" stroke="#6B7280" strokeWidth="2"/>
      <circle cx="75" cy="45" r="5" fill="#FBBF24" stroke="#6B7280" strokeWidth="2"/>
    </svg>
  );
}
