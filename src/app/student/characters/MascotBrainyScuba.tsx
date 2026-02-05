'use client';

/**
 * A component that renders the "Brainy" mascot in a scuba outfit.
 * The design is based on a user-provided SVG.
 */
export function MascotBrainyScuba() {
  return (
    <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
      <g id="brainy-base">
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
        
        <circle cx="85" cy="85" r="4" fill="#000"/>
        <circle cx="115" cy="85" r="4" fill="#000"/>
        
        <circle cx="100" cy="95" r="5" fill="transparent" stroke="#000" strokeWidth="2"/>
        
        <path d="M50,100 C50,70 50,60 55,60" stroke="#000" strokeWidth="3" fill="transparent"/>
        <circle cx="55" cy="60" r="3" fill="#fff"/>
        
        <path d="M150,100 C150,70 150,60 145,60" stroke="#000" strokeWidth="3" fill="transparent"/>
        <circle cx="145" cy="60" r="3" fill="#fff"/>
        
        <path d="M75,130 L75,160 L85,160" stroke="#000" strokeWidth="3" fill="transparent"/>
        <path d="M125,130 L125,160 L135,160" stroke="#000" strokeWidth="3" fill="transparent"/>
      </g>
      
      <g id="scuba-gear">
        <rect x="75" y="75" width="60" height="25" rx="10" ry="10" fill="transparent" stroke="#00bfff" strokeWidth="4"/>
        
        <line x1="70" y1="85" x2="50" y2="85" stroke="#0077aa" strokeWidth="3"/>
        <line x1="130" y1="85" x2="150" y2="85" stroke="#0077aa" strokeWidth="3"/>
        
        <path d="M140,75 Q145,55 145,45" stroke="#0077aa" strokeWidth="4" fill="transparent"/>
        <circle cx="145" cy="45" r="3" fill="#0077aa"/>
      </g>
      
      <circle cx="100" cy="35" r="4" fill="#cce6ff" opacity="0.7"/>
      <circle cx="115" cy="25" r="6" fill="#cce6ff" opacity="0.6"/>
      <circle cx="80" cy="25" r="3" fill="#cce6ff" opacity="0.7"/>
      
      <g id="chat-bubble">
        <rect x="170" y="35" width="110" height="50" rx="10" ry="10" fill="#ffffff" stroke="#000000" strokeWidth="2"/>
        <polygon points="170,65 160,60 160,70" fill="#ffffff" stroke="#000000" strokeWidth="2"/>
        <text x="175" y="50" fontSize="10" fill="#000" className="font-body">Ready to DIVE</text>
        <text x="175" y="65" fontSize="10" fill="#000" className="font-body">into some math</text>
        <text x="175" y="80" fontSize="10" fill="#000" className="font-body">problems?</text>
      </g>
    </svg>
  );
}
