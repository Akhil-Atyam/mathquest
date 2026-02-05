
'use client';
import React from 'react';
export function Rocket() {
  return (
    <svg viewBox="0 0 100 150" className="w-full h-full">
      <g transform="translate(10,0)">
        {/* Body */}
        <path d="M 40 140 L 40 40 L 60 40 L 60 140 Z" fill="#E5E7EB" stroke="#6B7280" strokeWidth="3"/>
        {/* Tip */}
        <path d="M 50 0 L 30 40 L 70 40 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3"/>
        {/* Window */}
        <circle cx="50" cy="60" r="10" fill="#BFDBFE" stroke="#3B82F6" strokeWidth="2.5"/>
        {/* Fins */}
        <path d="M 40 140 L 10 140 L 40 110 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3"/>
        <path d="M 60 140 L 90 140 L 60 110 Z" fill="#EF4444" stroke="#991B1B" strokeWidth="3"/>
      </g>
    </svg>
  );
}
