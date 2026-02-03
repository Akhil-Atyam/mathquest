
'use client';

/**
 * A component that renders the "Brainy" mascot in hiking gear.
 * The design is a faithful recreation of the classic 1930s rubber hose cartoon style.
 */
export function MascotBrainyHiker() {
  return (
    <div className="relative w-64 h-72 select-none">
      <svg viewBox="0 0 250 280" className="w-full h-full">
        <defs>
          <filter id="dropShadowHiker" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="#000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Lightbulb */}
        <g transform="translate(140, 0)">
          <path d="M 0 55 C -20 55 -20 25 0 25 C 20 25 20 55 0 55 Z" fill="#FBBF24" stroke="#000" strokeWidth="3" />
          <path d="M -5 55 L 5 55 L 5 60 L -5 60 Z" fill="#000" />
          <path d="M -7 60 L 7 60 L 7 63 L -7 63 Z" fill="#000" />
          <path d="M -9 63 L 9 63 L 9 65 L -9 65 Z" fill="#000" />
          {/* Filament */}
          <path d="M -8 45 Q 0 35 8 45" stroke="#000" strokeWidth="2" fill="none" />
          <path d="M -4 50 Q 0 45 4 50" stroke="#000" strokeWidth="2" fill="none" />
        </g>
        
        {/* Main Body & Legs */}
        <g filter="url(#dropShadowHiker)">
          {/* Right Leg */}
          <path d="M 170 215 C 180 235 180 255 170 270" stroke="#000" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <ellipse cx="160" cy="268" rx="30" ry="14" fill="#fff" stroke="#000" strokeWidth="3" transform="rotate(-15, 160, 268)"/>
          <ellipse cx="160" cy="263" rx="30" ry="8" fill="#FBBF24" stroke="#000" strokeWidth="3" transform="rotate(-15, 160, 268)"/>

          {/* Left Leg */}
          <path d="M 100 215 C 80 235 80 255 90 270" stroke="#000" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <ellipse cx="105" cy="268" rx="30" ry="14" fill="#fff" stroke="#000" strokeWidth="3" transform="rotate(15, 105, 268)"/>
          <ellipse cx="105" cy="263" rx="30" ry="8" fill="#FBBF24" stroke="#000" strokeWidth="3" transform="rotate(15, 105, 268)"/>
          
          {/* Shadow under feet */}
          <ellipse cx="130" cy="275" rx="80" ry="10" fill="#000" opacity="0.2"/>

          {/* Brain */}
          <path d="M 125 90 C 50 90, 40 140, 60 180 C 80 220, 170 220, 190 180 C 210 140, 200 90, 125 90 Z" fill="#F4C2D7" stroke="#000" strokeWidth="5"/>
          {/* Brain Wrinkles */}
          <g stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7">
            <path d="M 125 95 C 100 120, 100 150, 125 170 C 150 190, 150 200, 125 215" />
            <path d="M 90 130 C 80 150, 95 170, 110 180" />
            <path d="M 160 130 C 170 150, 155 170, 140 180" />
          </g>

          {/* Neckerchief */}
          <path d="M125 215 L 110 200 L 125 205 L 140 200 Z" fill="#EF4444" stroke="#000" strokeWidth="3" strokeLinejoin="round"/>
        </g>
        
        {/* Face */}
        <g transform="translate(0, 20)">
            {/* Eyes */}
            <g transform="translate(100, 135)">
                <ellipse cx="0" cy="0" rx="18" ry="22" fill="#fff" stroke="#000" strokeWidth="4" transform="rotate(-15)"/>
                <path d="M 5, -10 A 18 22 0 0 0 -5 10" stroke="#000" strokeWidth="4" fill="#000" />
            </g>
             <g transform="translate(155, 135)">
                <ellipse cx="0" cy="0" rx="18" ry="22" fill="#fff" stroke="#000" strokeWidth="4" transform="rotate(15)"/>
                <path d="M -5, -10 A 18 22 0 0 1 5 10" stroke="#000" strokeWidth="4" fill="#000" />
            </g>
             {/* Smile */}
            <path d="M 115 175 Q 130 190 145 175" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
        </g>

        {/* Arms */}
        <g filter="url(#dropShadowHiker)">
           {/* Right Arm (viewer's left) - Waving */}
          <path d="M 190 170 C 220 150 240 170 240 190" stroke="#000" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <g transform="translate(230, 180) rotate(-20)">
              <path d="M15,5 C5,0 0,10 5,20 S15,40 25,35 S35,20 25,15 C20,10 25,10 15,5z" fill="#fff" stroke="#000" strokeWidth="4"/>
          </g>

          {/* Left Arm (viewer's right) - Pointing */}
          <path d="M 70 160 C 50 120 80 80 110 70" stroke="#000" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <g transform="translate(100, 45) rotate(20)">
              <path d="M 22,2 C 12,-3 5,5 12,15 L 15,35 C 15,45 25,45 25,35 L 28,20 C 40,25 45,15 35,10 L 22,2 Z" fill="#fff" stroke="#000" strokeWidth="4" />
              <path d="M 12,15 C 15,18 18,20 20,20" fill="none" stroke="#000" strokeWidth="2.5" />
              <path d="M 28,20 C 26,22 24,25 22,28" fill="none" stroke="#000" strokeWidth="2.5" />
          </g>
        </g>

        {/* Hiker Hat */}
        <g transform="translate(140, 20)">
            <path d="M 0,-10 C -25,-10 -30,10 0,10 C 30,10 25,-10 0,-10 Z" fill="#A0522D" stroke="#000" strokeWidth="3"/>
            <path d="M 0,-10 C -15,-25 15,-25 0,-10" fill="#8B4513" stroke="#000" strokeWidth="3"/>
        </g>
      </svg>
    </div>
  );
}
