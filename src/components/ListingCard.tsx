import React, { useState } from 'react';
import { 
  Heart, 
  Star, 
  MapPin, 
  Clock, 
  Users, 
  Compass, 
  Flame, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Mountain
} from 'lucide-react';
import { ListingItem, Currency, LanguageCode } from '../types';
import { formatPrice, getWhatsAppBookingUrl } from '../utils/formatters';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedListing } from '../data/localizedContent';
import { WhatsAppIcon } from './Navbar';
import { AtlasImage } from './AtlasImage';
import { getLowestTierPrice, getCurrencySymbol } from '../utils/groupPricing';

interface ListingCardProps {
  item: ListingItem;
  currentCurrency: Currency;
  currentLang: LanguageCode;
  isWishlisted: boolean;
  onToggleWishlist: (item: ListingItem) => void;
  onViewDetails: (item: ListingItem) => void;
  onBookNow?: (item: ListingItem) => void;
  whatsappNumber?: string;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  item,
  currentCurrency,
  currentLang,
  isWishlisted,
  onToggleWishlist,
  onViewDetails,
  whatsappNumber
}) => {
  const t = TRANSLATIONS[currentLang];
  const loc = getLocalizedListing(item, currentLang);
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Type badge styling & icon
  const getTypeBadgeLabel = () => {
    switch (item.type) {
      case 'trip':
        return t.tagTrips;
      case 'activity':
      default:
        return t.tagActivities;
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'trip':
        return <Compass className="w-3.5 h-3.5" />;
      case 'activity':
      default:
        return <Flame className="w-3.5 h-3.5 text-[#C98B4B]" />;
    }
  };

  const lowestGroupPrice = getLowestTierPrice(item.groupPricing);
  const groupCurrencySymbol = getCurrencySymbol(item.groupPricingCurrency || 'EUR');
  const hasGroupPricing = lowestGroupPrice !== null && lowestGroupPrice > 0;

  // Pre-filled WhatsApp booking link with activity, date, and 2 people default
  const whatsappUrl = getWhatsAppBookingUrl(
    item, 
    currentLang, 
    loc.title, 
    loc.duration,
    undefined,
    2,
    whatsappNumber,
    hasGroupPricing ? `${lowestGroupPrice} ${groupCurrencySymbol}` : undefined,
    hasGroupPricing ? `${lowestGroupPrice * 2} ${groupCurrencySymbol}` : undefined
  );

  // Collect all real uploaded images
  const validImages = Array.from(new Set([item.imageUrl, ...(item.gallery || [])].filter(Boolean)));
  const hasMultipleImages = validImages.length > 1;

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !hasMultipleImages) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartX - touchEndX;

    // Minimum swipe threshold: 35px
    if (Math.abs(diffX) > 35) {
      if (diffX > 0) {
        // Swiped left -> next image
        setActiveSlide((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
      } else {
        // Swiped right -> previous image
        setActiveSlide((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
      }
    }
    setTouchStartX(null);
  };

  return (
    <div
      id={`card-${item.id}`}
      className="group bg-white rounded-[14px] overflow-hidden border border-[#C98B4B]/20 shadow-[0_4px_18px_rgba(46,33,24,0.06)] hover:shadow-[0_10px_28px_rgba(46,33,24,0.12)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
    >
      {/* Media Top Container */}
      <div 
        className="relative aspect-[16/11] overflow-hidden bg-[#2E2118] cursor-pointer select-none"
        onClick={() => onViewDetails(item)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {validImages.length === 0 ? (
          // Neutral empty card background in Sahara/Toubkal palette with small mountain icon (NEVER stock photo)
          <div className="w-full h-full bg-gradient-to-br from-[#2E2118] via-[#3D2C20] to-[#1F1610] flex flex-col items-center justify-center p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#C98B4B]/15 border border-[#C98B4B]/30 flex items-center justify-center mb-2">
              <Mountain className="w-6 h-6 text-[#C98B4B]" />
            </div>
            <span className="font-heading font-bold text-xs sm:text-sm text-[#F8F5F0] drop-shadow-sm max-w-[85%] truncate">
              {loc.title}
            </span>
            <span className="text-[10px] text-[#C98B4B] font-semibold tracking-wider uppercase mt-0.5">
              {loc.city}
            </span>
          </div>
        ) : (
          <AtlasImage
            src={validImages[activeSlide] || validImages[0]}
            alt={`${loc.title} - ${activeSlide + 1}`}
            fallbackTitle={loc.title}
            aspectRatio="16/11"
            width={640}
            height={440}
            priority={activeSlide === 0}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        )}

        {/* Gradient Overlay for Text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

        {/* Desktop Slider Arrows */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev > 0 ? prev - 1 : validImages.length - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 border border-white/20 active:scale-95 cursor-pointer shadow-md"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide((prev) => (prev < validImages.length - 1 ? prev + 1 : 0));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100 sm:opacity-0 focus:opacity-100 border border-white/20 active:scale-95 cursor-pointer shadow-md"
              aria-label="Next photo"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Slider Pagination Dots */}
        {hasMultipleImages && (
          <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-1.5 pointer-events-auto">
            {validImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSlide(idx);
                }}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === activeSlide ? 'w-4 bg-[#E5733A]' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-[#2E2118]/85 backdrop-blur-md text-[#F8F5F0] text-[11px] font-semibold tracking-wide border border-white/10 shadow-xs pointer-events-auto">
              {getTypeIcon()}
              <span>{getTypeBadgeLabel()}</span>
            </span>

            {loc.promoBadge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[10px] bg-[#9C4A2F]/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs pointer-events-auto border border-white/20">
                <Sparkles className="w-3 h-3 text-[#C98B4B]" />
                <span>{loc.promoBadge}</span>
              </span>
            )}
          </div>

          {/* Wishlist Button (Min 44x44px touch target) */}
          <button
            id={`btn-wishlist-${item.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(item);
            }}
            className="w-11 h-11 rounded-full bg-white/95 hover:bg-white text-[#2E2118] hover:text-[#9C4A2F] flex items-center justify-center shadow-md transition-all pointer-events-auto active:scale-90 cursor-pointer"
            aria-label={isWishlisted ? `Remove ${loc.title} from saved items` : `Save ${loc.title} to wishlist`}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isWishlisted ? 'fill-[#9C4A2F] text-[#9C4A2F]' : 'text-[#2E2118]/70'
              }`}
            />
          </button>
        </div>

        {/* Bottom Image Overlay Info (City & Rating) */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white text-xs z-10">
          <div className="flex items-center gap-1 font-medium bg-[#2E2118]/70 backdrop-blur-xs px-2 py-0.5 rounded-[8px]">
            <MapPin className="w-3.5 h-3.5 text-[#C98B4B]" />
            <span className="truncate max-w-[150px]">{loc.city}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#2E2118]/70 backdrop-blur-xs px-2 py-0.5 rounded-[8px] font-bold text-[#C98B4B]">
            <Star className="w-3.5 h-3.5 fill-[#C98B4B] text-[#C98B4B]" />
            <span>{item.rating.toFixed(2)}</span>
            <span className="text-[10px] text-[#F8F5F0]/80 font-normal">({item.reviewsCount})</span>
          </div>
        </div>
      </div>

      {/* Card Body Content */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div>
          {/* Tagline / Subtitle */}
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#2E2118]/70 font-medium flex-wrap font-body">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#9C4A2F]" />
              <span>{loc.duration}</span>
            </span>
            {loc.groupSize && (
              <>
                <span className="text-[#C98B4B]/40">•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#55663A]" />
                  <span>{loc.groupSize}</span>
                </span>
              </>
            )}
            {loc.difficulty && (
              <>
                <span className="text-[#C98B4B]/40">•</span>
                <span className="px-1.5 py-0.2 rounded-[6px] bg-[#F8F5F0] text-[#9C4A2F] text-[10px] font-semibold border border-[#9C4A2F]/20">
                  {loc.difficulty}
                </span>
              </>
            )}
          </div>

          {/* Main Title */}
          <h3
            onClick={() => onViewDetails(item)}
            className="font-heading font-bold text-base sm:text-lg text-[#2E2118] group-hover:text-[#9C4A2F] transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {loc.title}
          </h3>

          {/* Short Tagline */}
          <p className="mt-1.5 text-xs text-[#2E2118]/75 line-clamp-2 leading-relaxed font-body">
            {loc.tagline}
          </p>

          {/* Highlights Bullets */}
          <div className="mt-3 space-y-1">
            {loc.highlights.slice(0, 2).map((hl, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[#2E2118]/80 font-body">
                <span className="w-1.5 h-1.5 rounded-full bg-[#9C4A2F] mt-1 shrink-0"></span>
                <span className="line-clamp-1">{hl}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Footer: Price & Action Buttons */}
        <div className="mt-4 sm:mt-5 pt-3 border-t border-[#C98B4B]/20 flex flex-col xs:flex-row xs:items-end justify-between gap-2.5 sm:gap-3">
          <div className="shrink-0 font-body">
            {hasGroupPricing ? (
              <div>
                <span className="text-[10px] sm:text-[11px] font-bold text-[#9C4A2F] uppercase tracking-wider block mb-0.5">
                  {currentLang === 'ar' ? 'تسعير المجموعات' : 'Group Pricing'}
                </span>
                <span className="font-heading text-sm sm:text-base font-extrabold text-[#2E2118] whitespace-nowrap block">
                  {currentLang === 'ar'
                    ? `ابتداءً من ${lowestGroupPrice} ${groupCurrencySymbol} / للشخص`
                    : currentLang === 'fr'
                    ? `À partir de ${lowestGroupPrice} ${groupCurrencySymbol} / personne`
                    : currentLang === 'es'
                    ? `Desde ${lowestGroupPrice} ${groupCurrencySymbol} / persona`
                    : currentLang === 'de'
                    ? `Ab ${lowestGroupPrice} ${groupCurrencySymbol} / Person`
                    : currentLang === 'it'
                    ? `Da ${lowestGroupPrice} ${groupCurrencySymbol} / persona`
                    : `From ${lowestGroupPrice} ${groupCurrencySymbol} / person`}
                </span>
              </div>
            ) : (
              <>
                <span className="text-[10px] sm:text-[11px] font-medium text-[#2E2118]/60 block">
                  {t.fromPrice}
                </span>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-heading text-base sm:text-xl font-extrabold text-[#2E2118] whitespace-nowrap">
                    {formatPrice(item.priceMAD, currentCurrency)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-[#2E2118]/60 font-medium whitespace-nowrap">
                    /{t.perPerson}
                  </span>
                </div>
                {item.originalPriceMAD && (
                  <span className="text-[10px] sm:text-[11px] text-[#2E2118]/50 line-through block">
                    {formatPrice(item.originalPriceMAD, currentCurrency)}
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 justify-end w-full xs:w-auto pt-1 xs:pt-0">
            <button
              id={`btn-view-details-${item.id}`}
              onClick={() => onViewDetails(item)}
              aria-label={`${t.viewDetails}: ${loc.title}`}
              className="flex-1 xs:flex-none px-3.5 py-2.5 rounded-[10px] text-xs font-semibold text-[#9C4A2F] bg-[#F8F5F0] hover:bg-[#C98B4B]/15 border border-[#9C4A2F]/30 transition-colors shadow-2xs text-center min-h-[44px] flex items-center justify-center cursor-pointer font-body"
            >
              {t.viewDetails}
            </button>
            {/* Sunrise Orange WhatsApp Button */}
            <a
              id={`btn-book-now-${item.id}`}
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={currentLang === 'ar' ? 'حجز فوري عبر واتساب' : 'Book Now via WhatsApp'}
              aria-label={`${t.bookNow}: ${loc.title}`}
              className="flex-1 xs:flex-none px-4 py-2.5 rounded-[10px] text-xs font-bold text-white bg-[#E5733A] hover:bg-[#d46229] active:scale-95 shadow-md shadow-[#E5733A]/25 transition-all flex items-center justify-center gap-1.5 shrink-0 min-h-[44px] text-center font-body"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
              <span className="whitespace-nowrap">{t.bookNow}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
