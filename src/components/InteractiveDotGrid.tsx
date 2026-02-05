
'use client';

import React, { useEffect, useRef } from 'react';

/**
 * A component that renders an interactive grid of dots that react to mouse movement.
 * This component is designed to be used as a background effect within a relatively positioned container.
 *
 * How it works:
 * 1. It creates a grid of small `div` elements, each representing a dot.
 * 2. It is absolutely positioned to fill its parent and sits on a negative z-index to stay in the background.
 * 3. An effect hook adds a `mousemove` event listener to the `window`.
 * 4. When the mouse moves, the handler calculates the distance from the cursor to each dot and applies a CSS transform to "push" the dot away.
 * 5. This effect is animated smoothly using CSS transitions.
 */
export const InteractiveDotGrid = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame to batch updates for smooth performance
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const dots = grid.querySelectorAll<HTMLElement>('.dot-item');
        dots.forEach(dotEl => {
          const rect = dotEl.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const maxDistance = 200; // The radius of influence around the cursor
          const force = Math.max(0, 1 - distance / maxDistance); // Normalized force (0 to 1)
          
          // Calculate the push distance. The push is stronger when closer.
          const tx = (dx / distance) * force * -30;
          const ty = (dy / distance) * force * -30;
          
          // Apply the transform, handling the edge case where distance is 0
          if (isNaN(tx) || isNaN(ty)) {
            dotEl.style.transform = `translateX(0px) translateY(0px)`;
          } else {
            dotEl.style.transform = `translateX(${tx}px) translateY(${ty}px)`;
          }
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup: remove the event listener and cancel any pending animation frame on unmount
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  const numRows = 10;
  const numCols = 30;

  return (
    <div
      ref={gridRef}
      aria-hidden="true"
      className="absolute inset-0 -z-10 grid gap-4 items-center justify-center p-8 overflow-hidden"
      style={{
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
        gridTemplateRows: `repeat(${numRows}, 1fr)`,
      }}
    >
      {Array.from({ length: numRows * numCols }).map((_, i) => (
        <div
          key={i}
          className="dot-item w-2 h-2 bg-foreground/20 rounded-full transition-transform duration-300 ease-out"
        />
      ))}
    </div>
  );
};
