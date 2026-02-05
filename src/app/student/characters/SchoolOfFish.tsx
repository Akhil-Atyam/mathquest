'use client';
import React from 'react';

export function SchoolOfFish() {
  return (
    <svg viewBox="240 140 120 90" className="w-full h-full overflow-visible">
      {/* Fish 1 */}
      <g transform="translate(250,180)">
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="#7fd8be" stroke="#2a6f6b" strokeWidth="3"/>
        <polygon points="-22,0 -36,-10 -36,10" fill="#7fd8be" stroke="#2a6f6b" strokeWidth="3"/>
        <circle cx="8" cy="-3" r="3.5" fill="black"/>
        <circle cx="9.5" cy="-4.5" r="1.2" fill="white"/>
      </g>

      {/* Fish 2 */}
      <g transform="translate(290,210) scale(0.9)">
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="#6ec1ff" stroke="#2a5c8a" strokeWidth="3"/>
        <polygon points="-22,0 -36,-10 -36,10" fill="#6ec1ff" stroke="#2a5c8a" strokeWidth="3"/>
        <circle cx="8" cy="-3" r="3.5" fill="black"/>
        <circle cx="9.5" cy="-4.5" r="1.2" fill="white"/>
      </g>

      {/* Fish 3 */}
      <g transform="translate(270,150) scale(0.75)">
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="#ffd166" stroke="#b07d1c" strokeWidth="3"/>
        <polygon points="-22,0 -36,-10 -36,10" fill="#ffd166" stroke="#b07d1c" strokeWidth="3"/>
        <circle cx="8" cy="-3" r="3.5" fill="black"/>
        <circle cx="9.5" cy="-4.5" r="1.2" fill="white"/>
      </g>

      {/* Fish 4 */}
      <g transform="translate(310,170) scale(0.7)">
        <ellipse cx="0" cy="0" rx="22" ry="14" fill="#ff9ecf" stroke="#a24a75" strokeWidth="3"/>
        <polygon points="-22,0 -36,-10 -36,10" fill="#ff9ecf" stroke="#a24a75" strokeWidth="3"/>
        <circle cx="8" cy="-3" r="3.5" fill="black"/>
        <circle cx="9.5" cy="-4.5" r="1.2" fill="white"/>
      </g>
    </svg>
  );
}
