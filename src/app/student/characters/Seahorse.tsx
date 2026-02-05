'use client';

import React from 'react';

/**
 * A user-provided SVG of cute, singing seaweed pods for the Grade 2 Ocean theme.
 * This component file was previously a seahorse and has been repurposed for the new graphic.
 */
export function Seahorse() {
  return (
    <svg viewBox="50 0 250 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
      {/* Seaweed stalks (closer + varied heights) */}
      <g transform="translate(0, 20)">
        <path d="M130 260 C115 210, 120 160, 110 90"
              stroke="#3CB371" strokeWidth="14" fill="none" strokeLinecap="round"/>
        <path d="M150 260 C140 200, 155 140, 145 70"
              stroke="#2E8B57" strokeWidth="18" fill="none" strokeLinecap="round"/>
        <path d="M170 260 C165 215, 180 170, 175 110"
              stroke="#66CDAA" strokeWidth="14" fill="none" strokeLinecap="round"/>
        <path d="M190 260 C185 220, 200 180, 205 130"
              stroke="#3CB371" strokeWidth="12" fill="none" strokeLinecap="round"/>

        {/* Seaweed pods (clustered) */}
        <ellipse cx="110" cy="95" rx="15" ry="19" fill="#7FFFD4"/>
        <ellipse cx="145" cy="75" rx="18" ry="22" fill="#98FB98"/>
        <ellipse cx="175" cy="115" rx="15" ry="19" fill="#7FFFD4"/>
        <ellipse cx="205" cy="135" rx="14" ry="18" fill="#98FB98"/>

        {/* Faces */}
        {/* Pod 1 */}
        <circle cx="104" cy="92" r="2.5" fill="#333"/>
        <circle cx="116" cy="92" r="2.5" fill="#333"/>
        <path d="M106 100 Q110 104 114 100" stroke="#333" strokeWidth="2" fill="none"/>

        {/* Pod 2 */}
        <circle cx="139" cy="72" r="2.5" fill="#333"/>
        <circle cx="151" cy="72" r="2.5" fill="#333"/>
        <path d="M141 80 Q145 85 149 80" stroke="#333" strokeWidth="2" fill="none"/>

        {/* Pod 3 */}
        <circle cx="169" cy="112" r="2.5" fill="#333"/>
        <circle cx="181" cy="112" r="2.5" fill="#333"/>
        <path d="M171 120 Q175 124 179 120" stroke="#333" strokeWidth="2" fill="none"/>

        {/* Pod 4 */}
        <circle cx="199" cy="132" r="2.5" fill="#333"/>
        <circle cx="211" cy="132" r="2.5" fill="#333"/>
        <path d="M201 140 Q205 144 209 140" stroke="#333" strokeWidth="2" fill="none"/>
      </g>
      {/* Bubbles */}
      <circle cx="230" cy="55" r="6" fill="#BEEEEE" opacity="0.7"/>
      <circle cx="245" cy="35" r="4" fill="#BEEEEE" opacity="0.7"/>
      <circle cx="70" cy="45" r="5" fill="#BEEEEE" opacity="0.7"/>
    </svg>
  );
}
