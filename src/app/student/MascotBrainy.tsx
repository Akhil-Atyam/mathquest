'use client';

/**
 * A component that renders the "Brainy" mascot.
 * The design is based on the user-provided SVG.
 */
export function MascotBrainy() {
  return (
    <div className="relative w-64 h-64 select-none">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full">
        {/* Brain body with symmetrical bumps */}
        <path d="M50,90
                 c-10,-20 20,-30 30,-20
                 c10,-15 25,-10 30,0
                 c10,-10 25,-5 25,15
                 c10,0 15,15 10,25
                 c-5,10 -20,15 -35,10
                 c-10,5 -20,10 -30,0
                 c-15,10 -25,0 -25,-15
                 c-10,-5 -10,-15 -5,-25z"
              fill="#FFB6C1" stroke="#FF69B4" strokeWidth="2"/>
      
        {/* Eyes */}
        <circle cx="85" cy="85" r="4" fill="#000"/>
        <circle cx="115" cy="85" r="4" fill="#000"/>
      
        {/* Eyebrows tilted down */}
        <line x1="80" y1="78" x2="90" y2="82" stroke="#000" strokeWidth="2"/>
        <line x1="110" y1="82" x2="120" y2="78" stroke="#000" strokeWidth="2"/>
      
        {/* Smile */}
        <path d="M85,95 Q100,105 115,95" stroke="#000" strokeWidth="2" fill="transparent"/>
      
        {/* Arms (flexing) with hands slightly apart */}
        <path d="M50,100 C35,80 35,60 55,60" stroke="#000" strokeWidth="3" fill="transparent"/>
        <circle cx="55" cy="60" r="3" fill="#fff"/>
      
        <path d="M150,100 C165,80 165,60 145,60" stroke="#000" strokeWidth="3" fill="transparent"/>
        <circle cx="145" cy="60" r="3" fill="#fff"/>
      
        {/* Legs connected to brain with horizontal L */}
        <path d="M75,130 L75,160 L85,160" stroke="#000" strokeWidth="3" fill="transparent"/>
        <path d="M125,130 L125,160 L135,160" stroke="#000" strokeWidth="3" fill="transparent"/>
      
        {/* Lightning */}
        <polygon points="100,28 106,50 95,46 105,70 92,46 102,50" fill="#FFFF00" stroke="#FFD700" strokeWidth="2"/>
      
        {/* Glow lines revolving around lightning */}
        <line x1="100" y1="20" x2="100" y2="15" stroke="#FFFF00" strokeWidth="2"/>
        <line x1="108" y1="25" x2="113" y2="20" stroke="#FFFF00" strokeWidth="2"/>
        <line x1="92" y1="25" x2="87" y2="20" stroke="#FFFF00" strokeWidth="2"/>
        <line x1="110" y1="35" x2="115" y2="40" stroke="#FFFF00" strokeWidth="2"/>
        <line x1="90" y1="35" x2="85" y2="40" stroke="#FFFF00" strokeWidth="2"/>
        <line x1="100" y1="40" x2="100" y2="45" stroke="#FFFF00" strokeWidth="2"/>
      </svg>
    </div>
  );
}
