
'use client';

import React from 'react';

export function DinoTrex() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      {/* Body */}
      <path d="M 50 130 C 30 100, 40 50, 80 50 C 120 50, 130 90, 120 120 C 110 150, 70 150, 50 130 Z" fill="#86EFAC" stroke="#166534" strokeWidth="3"/>
      {/* Belly */}
      <path d="M 70 125 C 80 140, 100 140, 110 125 L 110 90 C 100 80, 80 80, 70 90 Z" fill="#D1FAE5"/>
      {/* Tail */}
      <path d="M 50 130 C 20 140, 10 120, 20 100 C 30 80, 45 110, 50 130" fill="#86EFAC" stroke="#166534" strokeWidth="3"/>
      {/* Arms */}
      <path d="M 105 90 C 100 85, 110 80, 115 85" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M 108 100 C 103 95, 113 90, 118 95" stroke="#166534" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Face */}
      <circle cx="95" cy="70" r="8" fill="white" stroke="#166534" strokeWidth="2"/>
      <circle cx="97" cy="70" r="3" fill="black"/>
      <path d="M 90 85 C 95 90, 105 90, 110 85" stroke="#166534" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
