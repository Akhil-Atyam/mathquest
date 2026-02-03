
'use client';

import React from 'react';

/**
 * A fuller seaweed SVG component.
 */
export function Seaweed() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full text-green-700/60">
        <style>{`
            .seaweed-strand {
                animation: sway 8s ease-in-out infinite alternate;
            }
            @keyframes sway {
                from { transform: rotate(-3deg); }
                to { transform: rotate(3deg); }
            }
        `}</style>
        <g transform="translate(0, 20)">
            <path className="seaweed-strand" style={{animationDelay: '-1s'}} d="M 50 200 C 20 150, 80 100, 50 50 S 20 0, 50 0" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            <path className="seaweed-strand" style={{animationDelay: '-2s'}} d="M 40 200 C 70 150, 20 100, 40 50 S 70 0, 40 0" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            <path className="seaweed-strand" style={{animationDelay: '-3s'}} d="M 60 200 C 30 150, 90 100, 60 50 S 30 0, 60 0" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
            <path className="seaweed-strand" style={{animationDelay: '-4s'}} d="M 30 200 C 60 150, 10 100, 30 50 S 60 0, 30 0" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
            <path className="seaweed-strand" style={{animationDelay: '-5s'}} d="M 70 200 C 40 150, 100 100, 70 50 S 40 0, 70 0" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round"/>
        </g>
    </svg>
  );
}
