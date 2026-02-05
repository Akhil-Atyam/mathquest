'use client';

import React from 'react';

/**
 * A cute, friendly green turtle character for the Grade 2 ocean theme.
 * The SVG is provided by the user.
 */
export function OceanTurtle() {
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Turtle rotated to face Northeast */}
      <g transform="rotate(45 200 200)">

        {/* ===== BACKMOST ELEMENTS ===== */}

        {/* Tail */}
        <path d="
          M 200 295
          C 185 315, 175 335, 200 350
          C 225 335, 215 315, 200 295
          Z"
          fill="#A8E6CF"
          stroke="#2d6a4f"
          strokeWidth="3"/>

        {/* Back Flippers */}
        <ellipse cx="150" cy="300" rx="32" ry="18"
                 fill="#A8E6CF" stroke="#2d6a4f" strokeWidth="3"/>

        <ellipse cx="250" cy="300" rx="32" ry="18"
                 fill="#A8E6CF" stroke="#2d6a4f" strokeWidth="3"/>

        {/* ===== FRONT FLIPPERS (UNDER SHELL) ===== */}

        <ellipse cx="110" cy="210" rx="42" ry="22"
                 fill="#A8E6CF" stroke="#2d6a4f" strokeWidth="3"/>

        <ellipse cx="290" cy="210" rx="42" ry="22"
                 fill="#A8E6CF" stroke="#2d6a4f" strokeWidth="3"/>

        {/* ===== SHELL (NOW ABOVE FRONT LIMBS) ===== */}

        <ellipse cx="200" cy="220" rx="95" ry="75"
                 fill="#6BCB77" stroke="#2d6a4f" strokeWidth="4"/>

        {/* Shell Pattern */}
        <circle cx="200" cy="220" r="26" fill="#2d6a4f"/>
        <circle cx="160" cy="205" r="18" fill="#2d6a4f"/>
        <circle cx="240" cy="205" r="18" fill="#2d6a4f"/>
        <circle cx="175" cy="255" r="18" fill="#2d6a4f"/>
        <circle cx="225" cy="255" r="18" fill="#2d6a4f"/>

        {/* ===== HEAD (TOPMOST) ===== */}

        <ellipse cx="200" cy="120" rx="46" ry="40"
                 fill="#A8E6CF" stroke="#2d6a4f" strokeWidth="4"/>

        {/* Eyes */}
        <circle cx="185" cy="115" r="9" fill="black"/>
        <circle cx="215" cy="115" r="9" fill="black"/>

        {/* Eye Highlights */}
        <circle cx="188" cy="112" r="3" fill="white"/>
        <circle cx="218" cy="112" r="3" fill="white"/>

        {/* Smile */}
        <path d="M185 130 Q200 145 215 130"
              stroke="#2d6a4f"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"/>

        {/* Blush */}
        <circle cx="165" cy="135" r="6" fill="#FFB3C6" opacity="0.85"/>
        <circle cx="235" cy="135" r="6" fill="#FFB3C6" opacity="0.85"/>

      </g>
    </svg>
  );
}
