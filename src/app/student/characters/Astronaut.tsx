
'use client';
import React from 'react';
export function Astronaut() {
  return (
    <svg viewBox="0 0 100 150" className="w-full h-full">
      <g transform="translate(5, 5)">
        {/* Body */}
        <rect x="25" y="60" width="50" height="60" rx="15" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="3" />
        <rect x="35" y="75" width="30" height="20" rx="5" fill="#4B5563" stroke="#1F2937" strokeWidth="2"/>
        {/* Legs */}
        <rect x="30" y="115" width="15" height="25" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2.5" />
        <rect x="55" y="115" width="15" height="25" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2.5" />
        {/* Arms */}
        <path d="M 25 70 C 10 80, 10 100, 25 110" stroke="#9CA3AF" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d="M 75 70 C 90 80, 90 100, 75 110" stroke="#9CA3AF" strokeWidth="12" fill="none" strokeLinecap="round" />
        {/* Helmet */}
        <circle cx="50" cy="40" r="30" fill="#F9FAFB" stroke="#9CA3AF" strokeWidth="3"/>
        <circle cx="50" cy="40" r="22" fill="#1F2937" opacity="0.8"/>
        <circle cx="40" cy="35" r="3" fill="white" opacity="0.5"/>
      </g>
    </svg>
  );
}
