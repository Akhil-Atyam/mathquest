'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * A component that renders an interactive grid of dots that react to mouse movement.
 *
 * This component is client-side only ('use client') because it relies on browser APIs
 * like `window.addEventListener` and `requestAnimationFrame` for interactivity.
 *
 * How it works:
 * 1. It creates a grid of small `div` elements, each representing a dot.
 * 2. An effect hook (`useEffect`) adds a `mousemove` event listener to the `window`.
 * 3. When the mouse moves, the handler function iterates through each dot.
 * 4. For each dot, it calculates the distance between the dot's center and the mouse cursor.
 * 5. Based on this distance, it calculates a "force" that pushes the dot away from the cursor.
 *    The closer the mouse, the stronger the push.
 * 6. It applies this push effect using a CSS `transform`, which is smoothly animated
 *    thanks to Tailwind's transition and duration utility classes on the dot elements.
 * 7. A `requestAnimationFrame` is used to ensure the animation is smooth and efficient.
 * 8. The event listener is removed when the component unmounts to prevent memory leaks.
 */
export const InteractiveDotGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Cancel the previous animation frame to avoid multiple updates in one frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Request a new animation frame to process the mouse move
      animationFrameRef.current = requestAnimationFrame(() => {
        const dots = grid.querySelectorAll('.dot-item');
        dots.forEach(dot => {
          const rect = dot.getBoundingClientRect();
          const dotEl = dot as HTMLElement;
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDistance = 200; // The radius of influence around the cursor
          const force = Math.max(0, 1 - distance / maxDistance); // Normalized force (0 to 1)
          
          // Calculate how much to push the dot away. The push is stronger when closer.
          // The -30 is a multiplier for the push distance.
          const tx = (dx / distance) * force * -30;
          const ty = (dy / distance) * force * -30;
          
          // Apply the transform to the dot's style
          dotEl.style.transform = `translateX(${tx || 0}px) translateY(${ty || 0}px)`;
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup function to remove the event listener and cancel any pending animation frame
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const numRows = 10;
  const numCols = 30;

  return (
    <section className="py-20 relative bg-card overflow-hidden">
      {/* The grid of dots, positioned absolutely to fill the section and layered behind the text */}
      <div
        ref={gridRef}
        className="absolute inset-0 z-0 grid gap-4 items-center justify-center p-8"
        style={{
          gridTemplateColumns: `repeat(${numCols}, 1fr)`,
          gridTemplateRows: `repeat(${numRows}, 1fr)`,
        }}
      >
        {Array.from({ length: numRows * numCols }).map((_, i) => (
          <div
            key={i}
            className="dot-item w-2 h-2 bg-primary/50 rounded-full transition-transform duration-300 ease-out"
          />
        ))}
      </div>
      
      {/* The text content, layered on top of the dots */}
      <div className="container mx-auto px-4 text-center z-10 relative">
        <h2 className="text-3xl font-bold mb-2">Just for Fun</h2>
        <p className="text-muted-foreground">Move your mouse around to see the effect.</p>
      </div>
    </section>
  );
};
