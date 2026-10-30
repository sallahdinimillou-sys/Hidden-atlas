import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { ItemType, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { MountainLineIcon, BootLineIcon, CompassLineIcon, SunLineIcon, CamelLineIcon } from './AtlasLineIcons';
import { MountainRidgeDivider } from './MountainRidgeDivider';
import { WhatsAppIcon } from './Navbar';
import { getWhatsAppContactUrl } from '../utils/formatters';

interface HeroSectionProps {
  currentLang: LanguageCode;
  onSelectCategory: (type: ItemType) => void;
  onExploreClick: () => void;
  heroImageUrl?: string;
  whatsappNumber?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentLang,
  onSelectCategory,
  onExploreClick,
  heroImageUrl,
  whatsappNumber
}) => {
  const isAr = currentLang === 'ar';
  const t = TRANSLATIONS[currentLang];

  // Gentle scroll parallax offset optimized with requestAnimationFrame (disabled on small mobile to maximize 60fps performance)
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth < 640;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isMobile || prefersReducedMotion) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Stop calculating parallax if scrolled past hero (e.g. 800px)
          if (window.scrollY < 800) {
            setScrollY(window.scrollY);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasUploadedHero = Boolean(heroImageUrl && !heroImageUrl.includes('images.unsplash.com') && !heroImageUrl.includes('picsum.photos'));
  const rawBg = hasUploadedHero ? heroImageUrl : '';

  const directWhatsappUrl = getWhatsAppContactUrl(
    whatsappNumber,
    isAr 
      ? 'السلام عليكم أخي حسين (Hidden Atlas)، أود الاستفسار عن رحلات جبل توبقال وجبال الأطلس.'
      : 'Hello Hossain (Hidden Atlas), I would like to inquire about Mount Toubkal treks and guided tours in Morocco.',
    currentLang
  );

  return (
    <section
      id="hero-section"
      className="relative min-h-[92vh] min-h-[92dvh] sm:min-h-[96vh] sm:min-h-[96dvh] flex flex-col justify-between overflow-hidden pt-24 sm:pt-28 pb-0"
    >
      {/* 1. Cinematic Hero Background: Uploaded image OR atmospheric Atlas gradient */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        {hasUploadedHero ? (
          <img
            src={rawBg}
            alt="Mount Toubkal and High Atlas Mountains"
            fetchPriority="high"
            decoding="async"
            width={1920}
            height={1080}
            style={{
              transform: scrollY > 0 ? `translate3d(0, ${scrollY * 0.14}px, 0) scale(1.04)` : 'none',
              transition: 'transform 0.08s linear'
            }}
            className="w-full h-full object-cover object-center brightness-95 contrast-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1C120A] via-[#2A1B10] to-[#140D07]" />
        )}

        {/* Soft Dark Gradient Overlay for Maximum Text Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2E2118]/90 via-[#2E2118]/55 to-[#2E2118]/40" />
        {/* Subtle Moroccan Amazigh Texture Overlay */}
        <div className="absolute inset-0 bg-amazigh-pattern opacity-10" />
      </div>

      {/* 2. Main Floating Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 w-full flex-1 flex flex-col items-center justify-center py-6 sm:py-14">
        
        {/* Frosted Semi-Transparent Glassmorphism Toubkal Hero Card (rounded 18px, soft subtle shadow) */}
        <div className="w-full max-w-4xl glass-box-elevated rounded-[18px] p-4 sm:p-9 lg:p-12 shadow-[0_20px_50px_rgba(46,33,24,0.22)] text-center flex flex-col items-center transition-all duration-300">
          
          {/* Guide Identity Badge Card with Glassmorphism */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-[11px] sm:text-xs font-semibold text-[#9C4A2F] mb-4 sm:mb-6 shadow-[0_2px_8px_rgba(46,33,24,0.06)] flex-wrap justify-center font-sans">
            <span className="w-2 h-2 rounded-full bg-[#55663A] shrink-0" />
            <span className="font-bold text-[#9C4A2F]">{t.heroBadge}</span>
            <span className="text-[#C98B4B]">•</span>
            <span className="text-[#2E2118] font-bold">{t.heroBadgeSub}</span>
          </div>

          {/* Headline in Playfair Display (Strictly: Discover Toubkal & the Hidden Atlas) */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.18] text-[#2E2118] font-serif max-w-3xl text-balance drop-shadow-xs">
            {t.heroHeadline}{' '}
            <span className="text-[#9C4A2F] underline decoration-[#C98B4B]/80 decoration-wavy underline-offset-4 sm:underline-offset-8">
              {t.heroHighlight}
            </span>
          </h1>

          {/* Subtitle in Poppins / Cairo */}
          <p className="mt-3.5 sm:mt-5 text-xs sm:text-base lg:text-lg text-[#2E2118] max-w-2xl font-medium leading-relaxed text-balance">
            {t.heroSubtitle}
          </p>

          {/* Actions: Primary Explore CTA + Instant WhatsApp Button + Find us on Google Maps */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto flex-wrap justify-center">
            {/* Primary Action Button (Atlas Rock Red #9C4A2F) */}
            <button
              id="hero-primary-cta"
              onClick={onExploreClick}
              className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 rounded-[14px] bg-[#9C4A2F] hover:bg-[#853C24] text-[#F8F5F0] font-bold text-sm sm:text-base glow-atlas transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2.5 border border-[#C98B4B]/30 min-h-[46px] cursor-pointer shadow-lg shadow-[#2E2118]/25 font-sans"
            >
              <BootLineIcon className="w-5 h-5 text-[#C98B4B]" />
              <span>{t.heroCta}</span>
              {isAr ? <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" /> : <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />}
            </button>

            {/* Direct WhatsApp Contact Button (Sunrise Orange #E5733A) */}
            <a
              id="hero-whatsapp-cta"
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto justify-center px-5 sm:px-7 py-3.5 sm:py-4 rounded-[14px] bg-[#E5733A] hover:bg-[#D0622B] text-white font-bold text-sm sm:text-base glow-sunrise transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2 border border-white/20 min-h-[46px] shadow-lg shadow-[#E5733A]/25 font-sans"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
              <span>{isAr ? 'تواصل معي على واتساب' : 'Chat with Me on WhatsApp'}</span>
            </a>

            {/* Google Maps Location Button */}
            <a
              id="hero-maps-cta"
              href="https://maps.app.goo.gl/Bg3scX2BXjBwc3ue6?g_st=iwb"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Find us on Google Maps"
              className="w-full sm:w-auto justify-center px-5 sm:px-6 py-3.5 sm:py-4 rounded-[14px] bg-white/70 hover:bg-white text-[#2E2118] hover:text-[#9C4A2F] font-bold text-sm sm:text-base border border-white/80 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center gap-2 min-h-[46px] shadow-md shadow-[#2E2118]/10 font-sans"
            >
              <MapPin className="w-5 h-5 text-[#9C4A2F] shrink-0" />
              <span>{t.findUsGoogleMaps || (isAr ? 'موقعنا على خرائط جوجل' : 'Find us on Google Maps')}</span>
            </a>
          </div>
        </div>

        {/* 3. The Three Distinct Toubkal & Mountain Activities Cards (rounded 16px with glassmorphism) */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 w-full max-w-4xl">
          {/* Card 1: Mountain Trekking & Hiking */}
          <button
            id="hero-card-tours"
            onClick={() => onSelectCategory('trip')}
            className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-[16px] glass-card transition-all duration-300 hover:-translate-y-1.5 min-h-[46px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#9C4A2F] flex items-center justify-center text-[#F8F5F0] mb-2.5 glow-atlas group-hover:scale-110 transition-transform">
              <MountainLineIcon className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#2E2118] group-hover:text-[#9C4A2F] transition-colors">
              {t.heroCardToursTitle}
            </h3>
            <p className="text-xs text-[#2E2118]/85 mt-1 font-medium font-sans">
              {t.heroCardToursSub}
            </p>
          </button>

          {/* Card 2: Desert Tours & Camel Rides */}
          <button
            id="hero-card-desert"
            onClick={() => onSelectCategory('activity')}
            className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-[16px] glass-card transition-all duration-300 hover:-translate-y-1.5 min-h-[46px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#C98B4B] flex items-center justify-center text-[#2E2118] mb-2.5 shadow-md group-hover:scale-110 transition-transform">
              <CamelLineIcon className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#2E2118] group-hover:text-[#9C4A2F] transition-colors">
              {t.heroCardStaysTitle}
            </h3>
            <p className="text-xs text-[#2E2118]/85 mt-1 font-medium font-sans">
              {t.heroCardStaysSub}
            </p>
          </button>

          {/* Card 3: Horse Riding, Quads & Day Trips */}
          <button
            id="hero-card-adventures"
            onClick={() => onSelectCategory('activity')}
            className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-[16px] glass-card transition-all duration-300 hover:-translate-y-1.5 min-h-[46px] cursor-pointer"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#55663A] flex items-center justify-center text-[#F8F5F0] mb-2.5 glow-juniper group-hover:scale-110 transition-transform">
              <CompassLineIcon className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#2E2118] group-hover:text-[#9C4A2F] transition-colors">
              {t.heroCardAdventuresTitle}
            </h3>
            <p className="text-xs text-[#2E2118]/85 mt-1 font-medium font-sans">
              {t.heroCardAdventuresSub}
            </p>
          </button>
        </div>
      </div>

      {/* 4. Mountain-Ridge Silhouette Divider at Bottom of Hero */}
      <MountainRidgeDivider fillColor="#FFFFFF" bgColor="transparent" />
    </section>
  );
};
