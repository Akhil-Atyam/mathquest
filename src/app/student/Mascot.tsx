
'use client';

/**
 * A component that renders the "Brainy" mascot.
 * The design is inspired by classic 1930s rubber hose animation style.
 */
export function Mascot() {
  return (
    <div className="relative w-48 h-56 select-none">
      <svg viewBox="0 0 200 220" className="w-full h-full">
        <defs>
          {/* Reusable drop shadow filter for a subtle 3D effect */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="3" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.2"/>
          </filter>
        </defs>

        {/* --- LEGS & SHOES --- */}
        {/* Left Leg (bendy "rubber hose" style) */}
        <path d="M105 160 C 90 180, 80 200, 70 215" stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#shadow)" />
        {/* Left Shoe */}
        <ellipse cx="60" cy="212" rx="25" ry="12" fill="#FBBF24" stroke="black" strokeWidth="4" transform="rotate(-20 60 212)" />
        <path d="M45 208 Q 60 202, 75 209" stroke="black" strokeWidth="3" fill="none" />

        {/* Right Leg (bendy "rubber hose" style) */}
        <path d="M135 160 C 150 180, 160 200, 170 215" stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#shadow)" />
        {/* Right Shoe */}
        <ellipse cx="180" cy="212" rx="25" ry="12" fill="#FBBF24" stroke="black" strokeWidth="4" transform="rotate(20 180 212)" />
        <path d="M165 209 Q 180 202, 195 208" stroke="black" strokeWidth="3" fill="none" />

        {/* --- BRAIN (BODY) --- */}
        <g filter="url(#shadow)">
          {/* Main brain shape with a pinkish, organic color */}
          <path 
            d="M120 20 C 60 20, 40 60, 50 100 C 60 140, 90 165, 120 160 C 150 155, 180 140, 190 100 C 200 60, 180 20, 120 20 Z" 
            fill="#F4C2D7" stroke="black" strokeWidth="5"
          />
          {/* Brain texture squiggles for character */}
          <path d="M120 25 C 100 50, 100 70, 120 90 C 140 110, 140 130, 120 155" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
          <path d="M90 50 C 80 70, 90 90, 110 100" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
          <path d="M150 50 C 160 70, 150 90, 130 100" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
           <path d="M70 90 C 80 110, 70 130, 80 140" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
        </g>
        
        {/* --- FACE (Classic Cartoon Style) --- */}
        <g transform="translate(10, 5)">
            {/* Left Eye (Pie-cut style) */}
            <path d="M90 70 C 80 90, 100 90, 90 70" fill="white" stroke="black" strokeWidth="4" />
            <path d="M85 78 L 95 70" stroke="black" strokeWidth="4" />
            <circle cx="85" cy="78" r="5" fill="black" />

            {/* Right Eye (Pie-cut style) */}
            <path d="M140 70 C 130 90, 150 90, 140 70" fill="white" stroke="black" strokeWidth="4" />
            <path d="M135 78 L 145 70" stroke="black" strokeWidth="4" />
            <circle cx="135" cy="78" r="5" fill="black" />

            {/* Wide, friendly smile */}
            <path d="M95 110 Q 115 130, 135 110" stroke="black" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>

        {/* --- ARMS & GLOVES --- */}
        {/* Left Arm (bendy "rubber hose" style) */}
        <path d="M60 100 C 40 80, 20 90, 10 110" stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#shadow)" />
        {/* Left Hand (classic white glove) */}
        <g transform="translate(-5, 105) rotate(20)">
          <path d="M20,15 C 5,20 5,35 15,40 C 25,45 35,40 35,30 C 40,20 30,10 20,15 Z" fill="white" stroke="black" strokeWidth="4" />
          <line x1="12" y1="20" x2="12" y2="35" stroke="black" strokeWidth="2.5" />
          <line x1="20" y1="18" x2="20" y2="38" stroke="black" strokeWidth="2.5" />
          <line x1="28" y1="20" x2="28" y2="35" stroke="black" strokeWidth="2.5" />
        </g>

        {/* Right Arm (bendy "rubber hose" style) */}
        <path d="M185 100 C 205 80, 225 90, 235 110" stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" filter="url(#shadow)" />
        {/* Right Hand (classic white glove) */}
         <g transform="translate(200, 105) rotate(-20)">
          <path d="M20,15 C 5,20 5,35 15,40 C 25,45 35,40 35,30 C 40,20 30,10 20,15 Z" fill="white" stroke="black" strokeWidth="4" transform="scale(-1, 1) translate(-40, 0)" />
          <line x1="12" y1="20" x2="12" y2="35" stroke="black" strokeWidth="2.5" />
          <line x1="20" y1="18" x2="20" y2="38" stroke="black" strokeWidth="2.5" />
          <line x1="28" y1="20" x2="28" y2="35" stroke="black" strokeWidth="2.5" />
        </g>
      </svg>
    </div>
  );
}
