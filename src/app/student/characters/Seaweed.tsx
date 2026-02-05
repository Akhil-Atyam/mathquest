'use client';

import React from 'react';

export function Seaweed() {
  return (
    <svg viewBox="70 70 100 330" className="w-full h-full overflow-visible">
      {/* Kelp Strand 1 */}
      <path d="
        M 80 400
        C 70 330, 110 300, 85 240
        C 60 180, 110 150, 80 80"
        stroke="#2e7d32"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"/>

      {/* Leaves */}
      <ellipse cx="95" cy="310" rx="18" ry="10" fill="#43a047" transform="rotate(35 95 310)"/>
      <ellipse cx="65" cy="240" rx="18" ry="10" fill="#43a047" transform="rotate(-25 65 240)"/>
      <ellipse cx="95" cy="165" rx="18" ry="10" fill="#43a047" transform="rotate(30 95 165)"/>

      {/* Kelp Strand 2 */}
      <path d="
        M 140 400
        C 155 320, 120 280, 150 220
        C 180 160, 135 120, 155 70"
        stroke="#2e7d32"
        strokeWidth="14"
        fill="none"
        strokeLinecap="round"/>

      <ellipse cx="125" cy="300" rx="18" ry="10" fill="#43a047" transform="rotate(-35 125 300)"/>
      <ellipse cx="165" cy="225" rx="18" ry="10" fill="#43a047" transform="rotate(30 165 225)"/>
      <ellipse cx="130" cy="145" rx="18" ry="10" fill="#43a047" transform="rotate(-25 130 145)"/>
    </svg>
  );
}
