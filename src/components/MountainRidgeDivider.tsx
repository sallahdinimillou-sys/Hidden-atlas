import React from 'react';

interface MountainRidgeDividerProps {
  className?: string;
  fillColor?: string; // Color of the incoming section
  bgColor?: string;   // Color of the background
  flip?: boolean;
}

/**
 * High Atlas & Mount Toubkal Mountain-Ridge Silhouette Divider:
 * Creates an authentic decorative transition between website sections.
 */
export const MountainRidgeDivider: React.FC<MountainRidgeDividerProps> = ({
  className = '',
  fillColor = '#F8F5F0',
  bgColor = '#FFFFFF',
  flip = false
}) => {
  return (
    <div 
      className={`relative w-full overflow-hidden leading-none select-none pointer-events-none ${className}`} 
      style={{ backgroundColor: bgColor }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`w-full h-8 sm:h-12 md:h-16 ${flip ? 'rotate-180' : ''}`}
        fill={fillColor}
      >
        {/* Distant background ridge silhouette */}
        <path
          d="M0,70 L60,55 L130,68 L210,45 L290,62 L370,40 L450,58 L540,32 L630,52 L720,38 L810,60 L890,42 L970,58 L1060,35 L1140,55 L1200,48 L1200,120 L0,120 Z"
          opacity="0.35"
          fill="#C98B4B"
        />

        {/* Mid-ground Atlas ridge silhouette */}
        <path
          d="M0,80 L80,62 L160,74 L250,52 L330,69 L420,44 L500,64 L600,36 L690,60 L780,48 L870,68 L950,50 L1040,66 L1120,46 L1200,62 L1200,120 L0,120 Z"
          opacity="0.65"
          fill="#9C4A2F"
        />

        {/* Foreground rugged Mount Toubkal & foothills ridge line */}
        <path
          d="M0,90 L90,75 L180,84 L270,65 L360,78 L460,54 L550,72 L640,48 L730,70 L820,58 L910,76 L1000,60 L1100,74 L1200,56 L1200,120 L0,120 Z"
          fill={fillColor}
        />
      </svg>
    </div>
  );
};
