import React from 'react';
import { MapPin, ArrowRight, Calendar, Compass, Sparkles } from 'lucide-react';
import { Destination, Region, LanguageCode } from '../types';
import { DESTINATIONS } from '../data/mockData';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedDestination } from '../data/localizedContent';

interface DestinationsExplorerProps {
  currentLang: LanguageCode;
  onSelectDestinationRegion: (region: Region) => void;
}

export const DestinationsExplorer: React.FC<DestinationsExplorerProps> = ({
  currentLang,
  onSelectDestinationRegion
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <section id="destinations-section" className="py-16 sm:py-20 bg-transparent border-y border-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/50 backdrop-blur-md text-[#9C4A2F] text-xs font-bold uppercase tracking-wider mb-2 border border-white/60 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#9C4A2F]" />
            <span>{currentLang === 'ar' ? 'المملكة المغربية الشريفة' : 'Kingdom of Morocco'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2E2118] font-heading tracking-tight">
            {t.destinationsTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#2E2118]/80">
            {t.destinationsSub}
          </p>
        </div>

        {/* Destination Cards Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DESTINATIONS.map((dest) => {
            const loc = getLocalizedDestination(dest, currentLang);
            const optimizedDestImage = dest.imageUrl.includes('images.unsplash.com')
              ? `${dest.imageUrl.split('?')[0]}?auto=format&fit=crop&w=640&q=80&fm=webp`
              : dest.imageUrl;

            return (
              <div
                key={dest.id}
                onClick={() => onSelectDestinationRegion(dest.region)}
                className="group relative h-[380px] rounded-[18px] overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-500 hover:-translate-y-1.5 border border-white/40"
              >
                {/* Background Image */}
                <img
                  src={optimizedDestImage}
                  alt={loc.name}
                  loading="lazy"
                  decoding="async"
                  width={640}
                  height={440}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* Sahara-tinted Deep Earth Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#2E2118] via-[#2E2118]/65 to-transparent group-hover:via-[#2E2118]/45 transition-all duration-300" />

                {/* Top Badges */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-xs font-semibold border border-white/30 shadow-xs">
                    {dest.experiencesCount}+ {currentLang === 'ar' ? 'تجربة مميزة' : 'Experiences'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#2E2118]/60 backdrop-blur-md text-[#C98B4B] text-[11px] flex items-center gap-1 font-mono border border-white/10">
                    <Calendar className="w-3 h-3 text-amber-300" />
                    <span>{loc.bestSeason}</span>
                  </span>
                </div>

                {/* Bottom Content Card */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white flex flex-col justify-end">
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-xs text-amber-300 uppercase tracking-widest font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{currentLang === 'ar' ? 'المغرب' : 'Morocco'}</span>
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-2xl text-white group-hover:text-amber-300 transition-colors">
                    {loc.name}
                  </h3>

                  <p className="text-xs text-amber-100/90 mt-1.5 line-clamp-2 leading-relaxed">
                    {loc.tagline}
                  </p>

                  {/* Highlights List */}
                  <div className="mt-3 pt-3 border-t border-white/15 flex flex-wrap gap-1.5">
                    {loc.highlights.slice(0, 2).map((hl, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-white/10 text-[10px] text-amber-100 backdrop-blur-sm"
                      >
                        • {hl}
                      </span>
                    ))}
                  </div>

                  {/* Action Link */}
                  <div className="mt-4 flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold text-amber-300 group-hover:text-amber-100 transition-colors">
                    <span>{currentLang === 'ar' ? 'استكشف كافة الجولات والأنشطة' : currentLang === 'fr' ? 'Explorer tous les circuits et activités' : 'Explore All Guided Tours'}</span>
                    <ArrowRight className={`w-4 h-4 group-hover:translate-x-1.5 transition-transform ${currentLang === 'ar' ? 'rotate-180 group-hover:-translate-x-1.5' : ''}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
