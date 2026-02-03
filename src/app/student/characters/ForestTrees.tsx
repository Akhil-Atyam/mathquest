
'use client';

import React from 'react';

/**
 * A component for two realistic, close-together trees.
 */
export function ForestTrees() {
  return (
    <svg viewBox="0 0 150 180" className="w-full h-full" style={{ filter: 'drop-shadow(3px 3px 3px rgba(0,0,0,0.15))' }}>
      {/* Tree 1 */}
      <g transform="translate(-20, 0)">
        <rect x="50" y="120" width="15" height="60" fill="#8B4513" />
        <polygon points="57,60 20,130 95,130" fill="#228B22" />
        <polygon points="57,20 25,80 90,80" fill="#3CB371" />
      </g>
      {/* Tree 2 (smaller, closer) */}
      <g transform="translate(10, 20)">
        <rect x="70" y="110" width="10" height="50" fill="#A0522D" />
        <polygon points="75,80 50,120 100,120" fill="#2E8B57" />
        <polygon points="75,50 55,90 95,90" fill="#3CB371" />
      </g>
    </svg>
  );
}
