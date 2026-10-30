import React from 'react';
import { ShieldCheck, HeartHandshake, Compass, Sparkles, CheckCircle2 } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { WhatsAppIcon } from './Navbar';
import { HiddenAtlasLogo } from './HiddenAtlasLogo';
import { MountainLineIcon, BootLineIcon, SunLineIcon, CamelLineIcon, CompassLineIcon } from './AtlasLineIcons';
import { MountainRidgeDivider } from './MountainRidgeDivider';
import { getWhatsAppContactUrl } from '../utils/formatters';

interface AboutSectionProps {
  currentLang: LanguageCode;
  whatsappNumber?: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ currentLang, whatsappNumber }) => {
  const isAr = currentLang === 'ar';
  const t = TRANSLATIONS[currentLang];

  const whatsappUrl = getWhatsAppContactUrl(
    whatsappNumber,
    isAr 
      ? 'السلام عليكم أخي حسين، أود التعرف أكثر على برامج تسلق توبقال والرحلات الجبلية والصحراوية الخاصة بك.'
      : 'Hello Hossain, I would like to learn more about your private Mount Toubkal and Atlas trekking tours.',
    currentLang
  );

  return (
    <section id="about-section" className="relative bg-transparent pt-0 pb-16 sm:pb-24 overflow-hidden">
      {/* Mountain Ridge Divider from previous section */}
      <MountainRidgeDivider fillColor="#F8F5F0" bgColor="transparent" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-10 sm:pt-14 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 backdrop-blur-md border border-white/60 text-[#9C4A2F] text-xs font-bold tracking-wider uppercase mb-3 shadow-2xs font-sans">
            <span className="w-2 h-2 rounded-full bg-[#55663A]" />
            <span>{t.aboutBadge}</span>
          </div>

          <h2 className="font-serif font-black text-3xl sm:text-4xl lg:text-5xl text-[#2E2118] tracking-tight">
            {t.aboutHeading}
          </h2>

          <p className="mt-3.5 text-base sm:text-lg text-[#2E2118]/80 leading-relaxed text-balance font-sans">
            {t.aboutSubtitle}
          </p>
        </div>

        {/* Feature Hero Card: Guide Heritage, Toubkal & High Atlas Experience */}
        <div className="bg-gradient-to-br from-[#2E2118]/90 via-[#4A3426]/90 to-[#9C4A2F]/90 backdrop-blur-xl rounded-[18px] p-5 sm:p-8 lg:p-12 text-[#F8F5F0] shadow-[0_16px_40px_rgba(46,33,24,0.25)] mb-14 sm:mb-18 relative overflow-hidden border border-white/20">
          {/* Subtle Ambient Amazigh Texture */}
          <div className="absolute inset-0 bg-amazigh-dark opacity-15 pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center">
            
            {/* Guide Profile Emblem Badge */}
            <div className="lg:col-span-4 flex flex-col items-center text-center p-6 sm:p-8 rounded-[16px] bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[16px] bg-[#2E2118] text-white p-2 flex flex-col items-center justify-center glow-atlas border border-[#C98B4B]/40 mb-3 shadow-lg">
                <HiddenAtlasLogo variant="emblem" className="w-full h-full" />
              </div>

              <h3 className="font-serif font-bold text-lg sm:text-xl text-[#F8F5F0]">
                Hossain Amalo
              </h3>
              <span className="text-[11px] sm:text-xs text-[#C98B4B] font-semibold tracking-wider uppercase font-sans mt-0.5">
                {isAr ? 'مرشدك السياحي المحلي المعتمد' : 'Your Local Guide in Morocco'}
              </span>
              <p className="text-xs text-[#F8F5F0]/85 mt-2.5 font-normal leading-relaxed font-sans">
                {isAr 
                  ? 'ابن وادي بحيرة إفني وجبال الأطلس، متخصص في تسلق قمة توبقال ومسارات بحيرة إفني والصحراء المغربية.' 
                  : 'Native to Lake Ifni valley at the foot of Mount Toubkal, with over 12 years of mountain trekking & cultural guiding.'}
              </p>
            </div>

            {/* Guide Story & 4 Commitments */}
            <div className="lg:col-span-8 space-y-5 sm:space-y-6">
              <div>
                <h3 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-white tracking-tight">
                  {t.aboutWhyTitle}
                </h3>
                <p className="text-xs sm:text-base text-[#F8F5F0]/90 leading-relaxed mt-2 font-sans">
                  {t.aboutWhyText}
                </p>
              </div>

              {/* 4 Feature Badges (rounded 14px) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 font-sans">
                {/* 1: Official Certified Guide */}
                <div className="flex items-start gap-3 bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-[14px] border border-white/15 backdrop-blur-xs">
                  <div className="p-2 sm:p-2.5 rounded-[10px] bg-[#C98B4B]/25 text-[#C98B4B] shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">
                      {t.aboutLicensedTitle}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#F8F5F0]/75 mt-0.5 leading-normal">
                      {t.aboutLicensedSub}
                    </p>
                  </div>
                </div>

                {/* 2: 100% Native High Atlas Guide */}
                <div className="flex items-start gap-3 bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-[14px] border border-white/15 backdrop-blur-xs">
                  <div className="p-2 sm:p-2.5 rounded-[10px] bg-[#E5733A]/25 text-[#E5733A] shrink-0">
                    <MountainLineIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">
                      {t.aboutNativeGuidesTitle}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#F8F5F0]/75 mt-0.5 leading-normal">
                      {t.aboutNativeGuidesSub}
                    </p>
                  </div>
                </div>

                {/* 3: Direct Safe Booking */}
                <div className="flex items-start gap-3 bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-[14px] border border-white/15 backdrop-blur-xs">
                  <div className="p-2 sm:p-2.5 rounded-[10px] bg-[#55663A]/30 text-[#F8F5F0] shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">
                      {t.aboutSafePayTitle}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#F8F5F0]/75 mt-0.5 leading-normal">
                      {t.aboutSafePaySub}
                    </p>
                  </div>
                </div>

                {/* 4: Direct WhatsApp Contact */}
                <div className="flex items-start gap-3 bg-white/10 hover:bg-white/15 transition-colors p-3.5 sm:p-4 rounded-[14px] border border-white/15 backdrop-blur-xs">
                  <div className="p-2 sm:p-2.5 rounded-[10px] bg-[#E5733A]/30 text-[#E5733A] shrink-0">
                    <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">
                      {t.aboutSupportTitle}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[#F8F5F0]/75 mt-0.5 leading-normal">
                      {t.aboutSupportSub}
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct WhatsApp CTA Button (Sunrise Orange #E5733A) */}
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-[14px] text-xs sm:text-sm font-bold text-white bg-[#E5733A] hover:bg-[#D0622B] active:scale-95 glow-sunrise transition-all duration-300 min-h-[44px] shadow-md shadow-[#2E2118]/25 font-sans"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>{t.whatsappAboutBtn}</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Experience Pillars (rounded 16px glass-card) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Card 1: Mount Toubkal summit (Atlas rock red #9C4A2F accent) */}
          <div className="p-6 sm:p-8 rounded-[16px] glass-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-[#9C4A2F] text-[#F8F5F0] flex items-center justify-center mb-4 shadow-md glow-atlas group-hover:scale-110 transition-transform">
              <MountainLineIcon className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#2E2118] group-hover:text-[#9C4A2F] transition-colors">
              {t.aboutValue1Title}
            </h4>
            <p className="text-xs sm:text-sm text-[#2E2118]/80 leading-relaxed mt-2 font-sans font-normal">
              {t.aboutValue1Text}
            </p>
          </div>

          {/* Card 2: Berber Hospitality & Juniper Nature (Juniper green #55663A accent) */}
          <div className="p-6 sm:p-8 rounded-[16px] glass-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-[#55663A] text-[#F8F5F0] flex items-center justify-center mb-4 shadow-md glow-juniper group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#2E2118] group-hover:text-[#55663A] transition-colors">
              {t.aboutValue2Title}
            </h4>
            <p className="text-xs sm:text-sm text-[#2E2118]/80 leading-relaxed mt-2 font-sans font-normal">
              {t.aboutValue2Text}
            </p>
          </div>

          {/* Card 3: Local Guidance & Sahara Desert (Mountain ochre #C98B4B accent) */}
          <div className="p-6 sm:p-8 rounded-[16px] glass-card transition-all duration-300 hover:-translate-y-1.5 flex flex-col items-center text-center group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[14px] bg-[#C98B4B] text-[#2E2118] flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform">
              <CompassLineIcon className="w-6 h-6" />
            </div>
            <h4 className="font-serif font-bold text-base sm:text-lg text-[#2E2118] group-hover:text-[#9C4A2F] transition-colors">
              {t.aboutValue3Title}
            </h4>
            <p className="text-xs sm:text-sm text-[#2E2118]/80 leading-relaxed mt-2 font-sans font-normal">
              {t.aboutValue3Text}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
