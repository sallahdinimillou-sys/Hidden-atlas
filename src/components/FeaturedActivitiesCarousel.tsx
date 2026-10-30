import React from 'react';
import { Flame, ArrowRight, Sparkles, Star, MapPin, Clock, MessageCircle } from 'lucide-react';
import { ListingItem, Currency, LanguageCode } from '../types';
import { formatPrice, getWhatsAppBookingUrl } from '../utils/formatters';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedListing } from '../data/localizedContent';
import { MountainLineIcon } from './AtlasLineIcons';
import { isStockPhoto } from '../lib/firebase';

interface FeaturedActivitiesProps {
  activities: ListingItem[];
  currentCurrency: Currency;
  currentLang: LanguageCode;
  onViewDetails: (item: ListingItem) => void;
  onBookNow?: (item: ListingItem) => void;
  onExploreAll: () => void;
}

export const FeaturedActivitiesCarousel: React.FC<FeaturedActivitiesProps> = ({
  activities,
  currentCurrency,
  currentLang,
  onViewDetails,
  onExploreAll
}) => {
  const t = TRANSLATIONS[currentLang];

  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <section id="featured-activities-section" className="py-16 bg-[#FDFBF7] border-t border-amber-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-[#9a3412] text-xs font-bold uppercase tracking-wider mb-2 border border-amber-300/60">
              <Flame className="w-3.5 h-3.5 text-[#ea580c]" />
              <span>{t.tabActivities}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1c130c] font-heading tracking-tight">
              {t.featuredAdventures}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
              {t.featuredAdventuresSub}
            </p>
          </div>

          <button
            id="btn-explore-all-activities"
            onClick={onExploreAll}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#c2410c] hover:text-[#9a3412] group self-start md:self-auto cursor-pointer"
          >
            <span>{t.showAllExpBtn}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Dynamic Activity Visual Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.slice(0, 3).map((act) => {
            const loc = getLocalizedListing(act, currentLang);
            return (
              <div
                key={act.id}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-desert hover:shadow-desert-hover border border-amber-900/10 transition-all duration-300 flex flex-col justify-between"
              >
              {/* Image & Overlay */}
              <div className="relative aspect-[16/11] overflow-hidden bg-[#2E2118]">
                {act.imageUrl && !isStockPhoto(act.imageUrl) ? (
                  <img
                    src={act.imageUrl}
                    alt={loc.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full min-h-[160px] bg-gradient-to-br from-[#2E2118] via-[#38281E] to-[#201610] flex flex-col items-center justify-center p-6 text-center text-[#F8F5F0]">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-[#C98B4B]/30 flex items-center justify-center text-[#C98B4B] mb-2 shadow-inner">
                      <MountainLineIcon className="w-6 h-6 stroke-[1.5]" />
                    </div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#c2410c]/90 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm shadow-sm flex items-center gap-1 border border-white/20">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{loc.promoBadge || t.tabActivities}</span>
                  </span>
                </div>

                {/* Bottom Image Info */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="flex items-center gap-1 font-medium bg-black/40 backdrop-blur-md px-2 py-0.5 rounded">
                      <MapPin className="w-3 h-3 text-amber-300" />
                      <span>{loc.city}</span>
                    </span>
                    <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded font-bold text-amber-300">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{act.rating.toFixed(2)}</span>
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-white leading-snug drop-shadow-sm">
                    {loc.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mb-2.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#c2410c]" />
                      <span>{loc.duration}</span>
                    </span>
                    {loc.groupSize && (
                      <>
                        <span>•</span>
                        <span className="text-stone-700 font-medium">{loc.groupSize}</span>
                      </>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {loc.overview}
                  </p>

                  <div className="mt-3 pt-3 border-t border-amber-900/10 flex flex-wrap gap-1.5">
                    {loc.highlights.slice(0, 2).map((h, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-amber-50 text-[#9a3412] text-[11px] font-medium border border-amber-200/60"
                      >
                        ✓ {h}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3.5 border-t border-amber-900/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-stone-400 font-medium block">
                      {t.fromPrice}
                    </span>
                    <span className="font-heading font-extrabold text-xl text-[#1c130c]">
                      {formatPrice(act.priceMAD, currentCurrency)}
                    </span>
                    <span className="text-[11px] text-stone-500 ml-1 font-medium">/{t.perPerson}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(act)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-[#9a3412] bg-[#fef3c7] hover:bg-[#fde68a] border border-amber-300/60 transition-colors cursor-pointer"
                    >
                      {t.viewDetails}
                    </button>
                    <a
                      href={getWhatsAppBookingUrl(act, currentLang, loc.title, loc.duration)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 glow-whatsapp transition-all flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white/20" />
                      <span>{t.bookNow}</span>
                    </a>
                  </div>
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
