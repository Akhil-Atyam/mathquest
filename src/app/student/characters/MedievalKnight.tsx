
'use client';

import React from 'react';

export function MedievalKnight() {
  return (
    <svg viewBox="0 0 150 150" className="w-full h-full">
      {/* Shield */}
      <path d="M 40 40 L 40 80 C 40 120, 75 140, 75 140 C 75 140, 110 120, 110 80 L 110 40 Z" fill="#FBBF24" stroke="#B45309" strokeWidth="3"/>
      <path d="M 75 40 L 75 135" stroke="#B45309" strokeWidth="3"/>
      <path d="M 45 70 L 105 70" stroke="#B45309" strokeWidth="3"/>
      {/* Helmet */}
      <path d="M 60 20 C 50 50, 100 50, 90 20 L 75 10 Z" fill="#9CA3AF" stroke="#4B5563" strokeWidth="3"/>
      <rect x="65" y="30" width="20" height="8" fill="#4B5563"/>
    </svg>
  );
}
