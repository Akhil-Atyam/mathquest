'use client';

import React from 'react';

export function Bubbles() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
        {/* Big bubble */}
        <circle cx="100" cy="100" r="50" fill="url(#bubbleGradient)" stroke="#99ccff" strokeWidth="2"/>
        {/* Highlight on big bubble */}
        <circle cx="120" cy="80" r="10" fill="white" opacity="0.6"/>
        
        {/* Medium bubble */}
        <circle cx="60" cy="130" r="30" fill="url(#bubbleGradient)" stroke="#99ccff" strokeWidth="2"/>
        <circle cx="70" cy="120" r="6" fill="white" opacity="0.6"/>
        
        {/* Small bubble */}
        <circle cx="150" cy="60" r="20" fill="url(#bubbleGradient)" stroke="#99ccff" strokeWidth="2"/>
        <circle cx="155" cy="50" r="4" fill="white" opacity="0.6"/>
        
        {/* Tiny bubble */}
        <circle cx="30" cy="40" r="10" fill="url(#bubbleGradient)" stroke="#99ccff" strokeWidth="2"/>
        <circle cx="33" cy="37" r="2" fill="white" opacity="0.6"/>
        
        {/* Gradient definition */}
        <defs>
            <radialGradient id="bubbleGradient" cx="50%" cy="50%" r="50%" fx="30%" fy="30%">
            <stop offset="0%" stopColor="#cce6ff"/>
            <stop offset="100%" stopColor="#99ccff"/>
            </radialGradient>
        </defs>
    </svg>
  );
}
