import React from 'react';

interface HiddenAtlasLogoProps {
  className?: string;
  variant?: 'emblem' | 'full' | 'horizontal';
  showSubtitle?: boolean;
  light?: boolean;
}

/**
 * Hidden Atlas Toubkal Visual Identity Logo:
 * Minimal SVG logo featuring the snow-capped peak of Mount Toubkal (4,167m)
 * and the High Atlas mountains.
 * Palette:
 * - Snow white (#F8F5F0) for the snow cap
 * - Atlas rock red (#9C4A2F) for the sunlit mountain face
 * - Mountain ochre (#C98B4B) for midtones & secondary ridge
 * - Dark rock brown (#2E2118) for shaded mountain flank & text
 * - Juniper green (#55663A) for valley contours
 * - Sunrise orange (#E5733A) for the morning summit glow
 */
export const HiddenAtlasLogo: React.FC<HiddenAtlasLogoProps> = ({ 
  className = 'w-10 h-10', 
  variant = 'emblem',
  showSubtitle = true,
  light = false
}) => {
  if (variant === 'emblem') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mount Toubkal Logo - Hidden Atlas"
      >
        <defs>
          {/* Sunrise Summit Glow */}
          <linearGradient id="toubkalSunrise" x1="50" y1="8" x2="50" y2="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E5733A" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C98B4B" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#C98B4B" stopOpacity="0" />
          </linearGradient>

          {/* Sunlit Rock Red Face */}
          <linearGradient id="toubkalRockRed" x1="30" y1="30" x2="50" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C98B4B" />
            <stop offset="40%" stopColor="#9C4A2F" />
            <stop offset="100%" stopColor="#7E3720" />
          </linearGradient>

          {/* Shaded Dark Rock Face */}
          <linearGradient id="toubkalShadedRock" x1="50" y1="30" x2="75" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4A3426" />
            <stop offset="50%" stopColor="#2E2118" />
            <stop offset="100%" stopColor="#1E150F" />
          </linearGradient>

          {/* Snow Cap Highlights */}
          <linearGradient id="toubkalSnow" x1="45" y1="16" x2="52" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8F5F0" />
          </linearGradient>
        </defs>

        {/* Soft Sunrise Arc / Sun Ring behind peak */}
        <circle cx="50" cy="42" r="26" fill="url(#toubkalSunrise)" />

        {/* Distant Secondary High Atlas Ridge (Left & Right) */}
        <polygon points="12,78 28,48 46,74" fill="#C98B4B" fillOpacity="0.75" />
        <polygon points="28,48 46,74 38,78" fill="#9C4A2F" fillOpacity="0.65" />
        <polygon points="56,76 74,44 90,78" fill="#4A3426" fillOpacity="0.8" />

        {/* Central Mount Toubkal Main Body */}
        {/* Left Sunlit Flank */}
        <polygon points="50,18 20,78 50,72" fill="url(#toubkalRockRed)" />
        {/* Right Shaded Flank */}
        <polygon points="50,18 50,72 80,78" fill="url(#toubkalShadedRock)" />

        {/* Snow-Capped Peak (Toubkal Summit Crown) */}
        {/* Left Snow Facet */}
        <polygon points="50,18 38,42 46,38 50,42" fill="url(#toubkalSnow)" />
        {/* Right Snow Facet */}
        <polygon points="50,18 50,42 55,37 62,42" fill="#E8E2D8" />
        {/* Central Snow Ridge Line */}
        <path d="M50 18 L50 42" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />

        {/* Imlil Valley & Foothill Juniper Green Contour */}
        <path
          d="M12 78 Q 30 73, 50 75 T 88 78 L 88 84 Q 50 86, 12 84 Z"
          fill="#55663A"
          fillOpacity="0.9"
        />

        {/* Base Rock Brown Foundation Silhouette */}
        <path
          d="M8 82 Q 45 79, 92 82 L 92 88 Q 50 90, 8 88 Z"
          fill="#2E2118"
        />

        {/* Minimal Amazigh / Berber Peak Dot Sparkle */}
        <circle cx="50" cy="11" r="2.5" fill="#E5733A" />
      </svg>
    );
  }

  // Full or Horizontal Brand Lockup
  const textColor = light ? 'text-[#F8F5F0]' : 'text-[#2E2118]';
  const subColor = light ? 'text-[#C98B4B]' : 'text-[#9C4A2F]';

  return (
    <div className={`flex items-center gap-2 sm:gap-3 min-w-0 ${className}`}>
      {/* Toubkal Peak Emblem Badge */}
      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[10px] sm:rounded-[12px] bg-[#2E2118] border border-[#C98B4B]/40 p-1 flex items-center justify-center shadow-[0_4px_16px_rgba(46,33,24,0.18)] shrink-0 transition-transform duration-300 group-hover:scale-105">
        <HiddenAtlasLogo variant="emblem" className="w-full h-full" />
      </div>

      <div className="flex flex-col text-left min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className={`font-serif font-black text-base sm:text-2xl tracking-tight leading-tight ${textColor} group-hover:text-[#9C4A2F] transition-colors whitespace-nowrap`}>
            Hidden Atlas
          </span>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#9C4A2F]/10 text-[#9C4A2F] border border-[#9C4A2F]/30 font-sans shrink-0">
            Toubkal
          </span>
        </div>
        {showSubtitle && (
          <p className={`text-[10px] sm:text-[11px] font-medium tracking-wide ${subColor} mt-0.5 leading-tight truncate font-sans max-w-[160px] xs:max-w-xs sm:max-w-none`}>
            Your Local Guide in Morocco
          </p>
        )}
      </div>
    </div>
  );
};
