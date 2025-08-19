"use client";

import * as React from "react";
import { useTheme } from "next-themes";

/**
 * A modern, animated theme toggle button that transitions between a sun and moon icon.
 * This component provides a more interactive user experience compared to a simple icon swap.
 * It uses a single SVG and CSS transforms to create the animation.
 */
export function AnimatedModeToggle() {
  const { theme, setTheme } = useTheme();

  // Function to toggle between light and dark themes
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-transparent transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="Toggle theme"
    >
      {/* Container for the sun and moon elements */}
      <div className="relative w-6 h-6 overflow-hidden">
        {/* Sun/Moon body - a single circle that transforms */}
        <div
          className="absolute inset-0 bg-yellow-400 dark:bg-zinc-100 rounded-full transition-transform duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]"
          style={{
            // Scale and rotate the sun/moon body
            transform: `scale(1) ${theme === "dark" ? "rotate(0deg)" : "rotate(90deg)"}`,
            // Shift the circle for the moon crescent effect
            clipPath: `inset(0 0 0 ${theme === "dark" ? "100%" : "0"})`,
            transitionProperty: 'background-color, transform, clip-path',
            transitionTimingFunction: 'ease-in-out',
            transitionDuration: '500ms',
          }}
        />

        {/* Sun rays - multiple divs that rotate and fade */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-yellow-400 dark:bg-transparent rounded-full transition-all duration-500 ease-[cubic-bezier(0.85,0,0.15,1)]"
            style={{
              // Position each ray in a circle
              transform: `
                rotate(${i * 45}deg)
                translateX(12px)
                scale(${theme === "dark" ? 0 : 1})
              `,
              opacity: theme === "dark" ? 0 : 1,
              transformOrigin: 'center center',
              top: '50%',
              left: '50%',
            }}
          />
        ))}
      </div>
    </button>
  );
}

// Example usage of the component (can be placed in a top-level component like App.js)
// <AnimatedModeToggle />
