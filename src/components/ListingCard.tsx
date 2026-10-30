import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { ListingItem, Currency, LanguageCode } from '../types';
import { formatPrice, getWhatsAppBookingUrl } from '../utils/formatters';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedListing } from '../data/localizedContent';
import { WhatsAppIcon } from './Navbar';
import { MountainLineIcon } from './AtlasLineIcons';
import { getLowestTierPrice, getCurrencySymbol } from '../utils/groupPricing';
import { fetchActivityImages, isStockPhoto } from '../lib/firebase';

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

  // Images list: show ONLY user-uploaded images, first is cover
  const [images, setImages] = useState<string[]>(() => {
    const list = [item.imageUrl, ...(item.gallery || [])].filter((url) => Boolean(url) && !isStockPhoto(url));
    return Array.from(new Set(list));
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Lazily load subcollection gallery images so card slider can display all user photos
  useEffect(() => {
    let isMounted = true;
    if (item.id && (item.hasSubcollectionImages || images.length <= 1)) {
      fetchActivityImages(item.id).then((subImgs) => {
        if (!isMounted) return;
        const valid = subImgs.filter((img) => Boolean(img) && !isStockPhoto(img));
        if (valid.length > 0) {
          setImages((prev) => {
            const merged = Array.from(new Set([...prev, ...valid]));
            return merged;
          });
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [item.id, item.hasSubcollectionImages]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || images.length <= 1) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    const SWIPE_THRESHOLD = 30;
    if (diff > SWIPE_THRESHOLD) {
      // Swiped left -> next photo
      setCurrentSlide((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    } else if (diff < -SWIPE_THRESHOLD) {
      // Swiped right -> prev photo
      setCurrentSlide((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    }
    setTouchStartX(null);
  };

  // Next & Prev arrows handlers
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

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

  const safeSlideIndex = Math.min(currentSlide, Math.max(0, images.length - 1));
  const currentPhotoUrl = images[safeSlideIndex];

  return (
    <div
      id={`card-${item.id}`}
      className="group bg-white rounded-[14px] overflow-hidden border border-[#C98B4B]/20 shadow-[0_4px_18px_rgba(46,33,24,0.06)] hover:shadow-[0_10px_28px_rgba(46,33,24,0.12)] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
    >
      {/* Media Top Container with Swipeable Slider */}
      <div 
        className="relative aspect-[16/11] overflow-hidden bg-[#2E2118] cursor-pointer select-none"
        onClick={() => onViewDetails(item)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 ? (
          <>
            <img
              src={currentPhotoUrl}
              alt={`${loc.title} - ${safeSlideIndex + 1}`}
              loading={safeSlideIndex === 0 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />

            {/* Gradient Overlay for Text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />

            {/* Desktop Navigation Arrows (hidden on touch, visible on desktop hover) */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer active:scale-95 border border-white/20 shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/55 hover:bg-black/85 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs cursor-pointer active:scale-95 border border-white/20 shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Navigation Dots Indicator */}
                <div className="absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs pointer-events-auto shadow-xs">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        aria-label={`Go to photo ${idx + 1}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentSlide(idx);
                        }}
                        className={`transition-all rounded-full cursor-pointer ${
                          safeSlideIndex === idx 
                            ? 'bg-[#C98B4B] w-3 h-1.5' 
                            : 'bg-white/60 hover:bg-white w-1.5 h-1.5'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* Neutral Empty Card Background in Site's Palette (NEVER a stock photo!) */
          <div className="w-full h-full min-h-[160px] bg-gradient-to-br from-[#2E2118] via-[#3D2C20] to-[#241A13] flex flex-col items-center justify-center p-6 text-center text-[#F8F5F0]">
            <div className="w-12 h-12 rounded-full bg-white/5 border border-[#C98B4B]/30 flex items-center justify-center text-[#C98B4B] mb-2 shadow-inner">
              <MountainLineIcon className="w-6 h-6 stroke-[1.5]" />
            </div>
            <span className="font-heading font-semibold text-xs tracking-wide text-white/90 line-clamp-1 max-w-[80%]">
              {loc.title}
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-20">
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
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs z-10 pointer-events-none">
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
