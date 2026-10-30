import React, { useState } from 'react';
import { X, Star, MapPin, Clock, Users, ShieldCheck, Check, Heart, Calendar, Sparkles, ZoomIn, MessageSquare } from 'lucide-react';
import { ListingItem, Currency, LanguageCode } from '../types';
import { formatPrice, getWhatsAppBookingUrl } from '../utils/formatters';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedListing } from '../data/localizedContent';
import { WhatsAppIcon } from './Navbar';
import { ImageLightboxModal } from './ImageLightboxModal';
import { MountainLineIcon } from './AtlasLineIcons';
import { GroupPricingTable } from './GroupPricingTable';
import { findMatchingTier, getCurrencySymbol } from '../utils/groupPricing';
import { fetchActivityImages } from '../lib/firebase';

interface ItemDetailModalProps {
  item: ListingItem;
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: Currency;
  currentLang: LanguageCode;
  isWishlisted: boolean;
  onToggleWishlist: (item: ListingItem) => void;
  onStartBooking?: (item: ListingItem) => void;
  whatsappNumber?: string;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  currentCurrency,
  currentLang,
  isWishlisted,
  onToggleWishlist,
  whatsappNumber
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [subcollectionPhotos, setSubcollectionPhotos] = useState<string[]>([]);
  const [preferredDate, setPreferredDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [guestsCount, setGuestsCount] = useState(2);

  React.useEffect(() => {
    let isMounted = true;
    if (isOpen && item?.id) {
      fetchActivityImages(item.id).then((subImgs) => {
        if (isMounted && subImgs && subImgs.length > 0) {
          setSubcollectionPhotos(subImgs);
        }
      });
    } else {
      setSubcollectionPhotos([]);
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, item?.id]);

  const t = TRANSLATIONS[currentLang];
  const loc = getLocalizedListing(item, currentLang);
  const isAr = currentLang === 'ar';

  if (!isOpen) return null;

  const allPhotos = Array.from(
    new Set([item.imageUrl, ...(item.gallery || []), ...subcollectionPhotos].filter(Boolean))
  );
  const currentPhotoIndex = Math.min(selectedPhotoIndex, Math.max(0, allPhotos.length - 1));

  // Group Pricing resolution
  const hasGroupPricing = Boolean(item.groupPricing && item.groupPricing.length > 0);
  const matchingTier = hasGroupPricing ? findMatchingTier(item.groupPricing, guestsCount) : undefined;
  const groupCurrency = item.groupPricingCurrency || 'EUR';
  const groupCurrencySymbol = getCurrencySymbol(groupCurrency);
  const isNoMatchingTier = hasGroupPricing && !matchingTier;

  const pricePerPersonFormatted = matchingTier 
    ? `${matchingTier.pricePerPerson} ${groupCurrencySymbol}` 
    : undefined;
  const totalPriceFormatted = matchingTier 
    ? `${matchingTier.pricePerPerson * guestsCount} ${groupCurrencySymbol}` 
    : undefined;

  // Dynamic WhatsApp booking link that includes Activity Name, Date, Number of People, Price per Person and Total Price
  const dynamicWhatsappUrl = getWhatsAppBookingUrl({
    item,
    activityTitle: loc.title,
    date: preferredDate,
    peopleCount: guestsCount,
    lang: currentLang,
    whatsappNumber,
    customDuration: loc.duration,
    pricePerPerson: pricePerPersonFormatted,
    totalPrice: totalPriceFormatted,
    isCustomQuote: isNoMatchingTier
  });

  return (
    <div
      id="modal-item-details"
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[100] overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl h-[94vh] h-[94dvh] sm:h-auto sm:max-h-[90vh] sm:max-h-[90dvh] bg-white rounded-[14px] shadow-2xl flex flex-col overflow-hidden border border-[#C98B4B]/30 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Floating Modal Close Button */}
        <button
          id="btn-close-detail-modal"
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className={`absolute top-3.5 ${isAr ? 'left-3.5' : 'right-3.5'} z-30 w-11 h-11 rounded-full bg-[#2E2118]/80 hover:bg-[#2E2118] text-white flex items-center justify-center backdrop-blur-md shadow-lg transition-transform hover:scale-105 active:scale-95`}
          title={isAr ? 'إغلاق' : 'Close'}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container for Entire Modal Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          
          {/* Gallery Section */}
          <div className="relative bg-[#2E2118] overflow-hidden min-h-[220px]">
            {allPhotos.length === 0 ? (
              // Neutral empty state in Toubkal palette with mountain graphic (never stock photo)
              <div className="w-full h-[240px] sm:h-[300px] bg-gradient-to-br from-[#2E2118] via-[#3D2C20] to-[#1F1610] flex flex-col items-center justify-center p-6 text-center text-[#F8F5F0]">
                <div className="w-16 h-16 rounded-full bg-[#C98B4B]/15 border border-[#C98B4B]/30 flex items-center justify-center mb-3">
                  <MountainLineIcon className="w-9 h-9 text-[#C98B4B]" />
                </div>
                <h3 className="font-heading font-bold text-lg text-[#F8F5F0] drop-shadow-sm max-w-[85%]">
                  {loc.title}
                </h3>
                <span className="text-xs text-[#C98B4B] font-semibold tracking-wider uppercase mt-1">
                  {loc.location}
                </span>
              </div>
            ) : (
              <>
                {/* Ambient Blurred Background Fill */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <img
                    src={allPhotos[currentPhotoIndex]}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover blur-2xl scale-125 opacity-35 brightness-75"
                  />
                  <div className="absolute inset-0 bg-[#2E2118]/60" />
                </div>

                {/* Main Image with object-contain & Quick View Zoom Trigger */}
                <div 
                  className="relative z-10 w-full h-[260px] sm:h-[360px] md:h-[420px] flex items-center justify-center p-2 sm:p-4 group/photo cursor-zoom-in"
                  onClick={() => setIsLightboxOpen(true)}
                  title={isAr ? 'انقر لتكبير وتصفح الصور بالكامل' : 'Click to zoom and browse full gallery'}
                >
                  <img
                    src={allPhotos[currentPhotoIndex]}
                    alt={loc.title}
                    decoding="async"
                    className="max-h-full max-w-full object-contain rounded-[10px] shadow-2xl transition-all duration-300 group-hover/photo:scale-[1.01]"
                  />

                  {/* Quick View / Zoom Pill */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                    className={`absolute bottom-4 ${isAr ? 'left-4' : 'right-4'} z-20 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 text-white text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 border border-white/20 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer`}
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-[#C98B4B]" />
                    <span>{isAr ? 'تكبير وعرض الصور' : 'Zoom / Quick View'}</span>
                  </button>
                </div>

                {/* Photo Thumbnails */}
                {allPhotos.length > 1 && (
                  <div className={`absolute bottom-3 ${isAr ? 'right-4 left-4' : 'left-4 right-4'} z-20 flex items-center gap-2 overflow-x-auto p-1.5 bg-[#2E2118]/80 backdrop-blur-md rounded-[10px] max-w-fit shadow-md border border-white/10`}>
                    {allPhotos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`w-14 h-10 rounded-[6px] overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          currentPhotoIndex === idx ? 'border-[#C98B4B] scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img 
                          src={photo} 
                          alt="" 
                          loading="lazy" 
                          decoding="async" 
                          className="w-full h-full object-cover" 
                        />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Type Badge */}
            <div className={`absolute top-4 ${isAr ? 'right-4' : 'left-4'} z-20 flex items-center gap-2`}>
              <span className="px-3 py-1 rounded-[10px] bg-[#2E2118]/90 backdrop-blur-md text-[#F8F5F0] text-xs font-semibold uppercase tracking-wider border border-white/20">
                {item.type === 'trip' ? t.tabTrips : t.tabActivities}
              </span>
              {loc.promoBadge && (
                <span className="px-3 py-1 rounded-[10px] bg-[#9C4A2F] text-white text-xs font-bold uppercase tracking-wider shadow">
                  {loc.promoBadge}
                </span>
              )}
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="p-5 sm:p-8 space-y-7">
            {/* Header Row */}
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs text-[#2E2118]/70 font-medium flex-wrap font-body">
                  <span className="flex items-center gap-1 text-[#9C4A2F]">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold">{loc.location}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-[#C98B4B]" />
                    <span>{loc.duration}</span>
                  </span>
                  {loc.groupSize && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-[#55663A]" />
                        <span>{loc.groupSize}</span>
                      </span>
                    </>
                  )}
                  {loc.difficulty && (
                    <>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-[#F8F5F0] text-[#9C4A2F] font-semibold border border-[#9C4A2F]/20">
                        {loc.difficulty}
                      </span>
                    </>
                  )}
                </div>

                {/* Wishlist toggle */}
                <button
                  onClick={() => onToggleWishlist(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border border-[#C98B4B]/30 text-xs font-semibold hover:bg-[#F8F5F0] transition-colors"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#9C4A2F] text-[#9C4A2F]' : 'text-[#2E2118]/50'}`} />
                  <span>{isWishlisted ? t.modalSaved : t.modalSave}</span>
                </button>
              </div>

              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2E2118] leading-tight">
                {loc.title}
              </h2>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-[#F8F5F0] px-2.5 py-1 rounded-[8px] border border-[#C98B4B]/30 text-xs font-bold text-[#2E2118]">
                  <Star className="w-4 h-4 fill-[#C98B4B] text-[#C98B4B]" />
                  <span>{item.rating.toFixed(2)}</span>
                  <span className="text-[#2E2118]/60 font-normal">({item.reviewsCount})</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-[#55663A] font-semibold bg-[#55663A]/10 px-2.5 py-1 rounded-[8px] border border-[#55663A]/30">
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loc.cancellationPolicy}</span>
                </div>
              </div>
            </div>

            {/* Group Pricing Table (rendered if tiers exist, hidden if none) */}
            {hasGroupPricing && (
              <GroupPricingTable
                tiers={item.groupPricing}
                currency={groupCurrency}
                currentLang={currentLang}
                selectedParticipants={guestsCount}
                onSelectTier={(tier) => setGuestsCount(tier.min)}
              />
            )}

            {/* Interactive Date & Group Size for WhatsApp message preparation */}
            <div className="p-4 sm:p-5 rounded-[14px] bg-[#F8F5F0] border border-[#C98B4B]/30 space-y-3">
              <h3 className="font-heading font-bold text-sm text-[#2E2118] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#9C4A2F]" />
                <span>{isAr ? 'حدد التاريخ المفضل وعدد الأشخاص للحجز' : 'Select Preferred Date & Group Size'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#2E2118]/80 mb-1">
                    {isAr ? 'التاريخ المفضل' : 'Preferred Date'}
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 bg-white text-xs font-semibold text-[#2E2118] focus:ring-2 focus:ring-[#9C4A2F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#2E2118]/80 mb-1">
                    {isAr ? 'عدد الأشخاص' : 'Number of Guests'}
                  </label>
                  <div className="flex items-center gap-2 bg-white rounded-[10px] border border-[#C98B4B]/40 p-1">
                    <button
                      type="button"
                      disabled={guestsCount <= 1}
                      onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                      className="w-8 h-8 rounded-[8px] bg-[#F8F5F0] hover:bg-[#C98B4B]/20 text-[#2E2118] font-bold text-sm disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-bold text-xs text-[#2E2118]">
                      {guestsCount} {isAr ? 'أشخاص' : 'People'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuestsCount(guestsCount + 1)}
                      className="w-8 h-8 rounded-[8px] bg-[#F8F5F0] hover:bg-[#C98B4B]/20 text-[#2E2118] font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Group pricing feedback: Tier matched or un-matched invite message */}
              {hasGroupPricing && matchingTier && (
                <div className="p-3 rounded-[10px] bg-[#9C4A2F]/10 border border-[#9C4A2F]/20 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div>
                    <span className="text-[#2E2118]/70 block text-[11px]">
                      {isAr ? 'السعر للشخص الواحد' : currentLang === 'fr' ? 'Tarif par personne' : 'Price per person'}
                    </span>
                    <span className="font-heading font-bold text-sm text-[#9C4A2F]">
                      {matchingTier.pricePerPerson} {groupCurrencySymbol}
                    </span>
                  </div>
                  <div className={isAr ? 'text-left' : 'text-right'}>
                    <span className="text-[#2E2118]/70 block text-[11px]">
                      {isAr ? 'المجموع الإجمالي' : currentLang === 'fr' ? 'Prix total' : 'Total Price'}
                    </span>
                    <span className="font-heading font-extrabold text-sm sm:text-base text-[#2E2118]">
                      {matchingTier.pricePerPerson * guestsCount} {groupCurrencySymbol}
                    </span>
                  </div>
                </div>
              )}

              {hasGroupPricing && isNoMatchingTier && (
                <div className="p-3.5 rounded-[10px] bg-amber-50 border border-amber-300 text-xs text-[#2E2118] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#9C4A2F]">
                    <Sparkles className="w-4 h-4 text-[#C98B4B]" />
                    <span>
                      {isAr 
                        ? 'طلب عرض سعر مخصص عبر واتساب' 
                        : currentLang === 'fr' 
                        ? 'Devis de groupe sur mesure' 
                        : 'Custom Group Quote on WhatsApp'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#2E2118]/80 leading-relaxed">
                    {isAr
                      ? `عدد المشاركين (${guestsCount} أشخاص) خارج الفئات القياسية. تفضل بمراسلتنا مباشرة على واتساب للحصول على تسعيرة خاصة فورية وتنسيق البرنامج.`
                      : currentLang === 'fr'
                      ? `Le nombre de participants (${guestsCount} personnes) ne correspond à aucun palier standard. Contactez directement le guide sur WhatsApp pour un tarif de groupe personnalisé.`
                      : currentLang === 'es'
                      ? `El número de participantes (${guestsCount} personas) no coincide con ningún rango estándar. Contáctanos por WhatsApp para una cotización personalizada.`
                      : currentLang === 'de'
                      ? `Die Teilnehmerzahl (${guestsCount} Personen) liegt außerhalb der Standard-Staffelungen. Kontaktiere bitte den Guide direkt auf WhatsApp für ein individuelles Gruppenangebot.`
                      : currentLang === 'it'
                      ? `Il numero di partecipanti (${guestsCount} persone) non rientra nelle fasce standard. Contatta la guida su WhatsApp per un preventivo di gruppo su misura.`
                      : `This group size (${guestsCount} people) does not match listed tiers. Please contact the guide directly on WhatsApp for an instant custom group quote.`}
                  </p>
                </div>
              )}
            </div>

            {/* Overview */}
            <div className="space-y-3 font-body">
              <h3 className="font-heading font-bold text-lg text-[#2E2118]">
                {t.modalOverview}
              </h3>
              <p className="text-sm text-[#2E2118]/80 leading-relaxed">
                {loc.overview}
              </p>
            </div>

            {/* Highlights */}
            <div className="p-5 rounded-[14px] bg-[#F8F5F0] border border-[#C98B4B]/30 space-y-3">
              <h3 className="font-heading font-bold text-base text-[#9C4A2F] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C98B4B]" />
                <span>{t.modalHighlights}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-body">
                {loc.highlights.map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-[#2E2118] font-medium">
                    <Check className="w-4 h-4 text-[#55663A] shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Day Trip Itinerary (If applicable) */}
            {loc.itinerary && loc.itinerary.length > 0 && (
              <div className="space-y-4 font-body">
                <h3 className="font-heading font-bold text-lg text-[#2E2118]">
                  {t.itineraryLabel}
                </h3>
                <div className="space-y-3">
                  {loc.itinerary.map((day) => (
                    <div key={day.day} className="p-4 rounded-[12px] bg-[#F8F5F0] border border-[#C98B4B]/25">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                        <span className="font-heading font-bold text-sm text-[#9C4A2F]">
                          {isAr ? `اليوم ${day.day}: ` : `Day ${day.day}: `}{day.title}
                        </span>
                        {day.mealsIncluded && (
                          <span className="text-[11px] px-2 py-0.5 rounded-[6px] bg-[#C98B4B]/20 text-[#9C4A2F] font-medium">
                            {day.mealsIncluded}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#2E2118]/80 mt-1 leading-relaxed">
                        {day.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Included / Not Included */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 font-body">
              <div className="space-y-2.5">
                <h4 className="font-heading font-bold text-sm text-[#55663A] flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#55663A]" />
                  <span>{t.includedLabel}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#2E2118]/80">
                  {loc.included.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#55663A] font-bold">✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-heading font-bold text-sm text-[#9C4A2F] flex items-center gap-1.5">
                  <X className="w-4 h-4 text-[#9C4A2F]" />
                  <span>{t.notIncludedLabel}</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-[#2E2118]/80">
                  {loc.notIncluded.map((nInc, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#9C4A2F] font-bold">✕</span>
                      <span>{nInc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* WhatsApp Direct Booking Callout Banner in Sunrise Orange */}
            <div className="p-4 sm:p-5 rounded-[14px] bg-[#E5733A]/10 border border-[#E5733A]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#E5733A] text-white flex items-center justify-center shadow-md shadow-[#E5733A]/25 shrink-0">
                  <WhatsAppIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-[#2E2118]">
                    {t.modalQuickBookingTitle}
                  </h4>
                  <p className="text-[11px] text-[#2E2118]/70 mt-0.5">
                    {t.modalQuickBookingSub}
                  </p>
                </div>
              </div>
              <a
                id="btn-modal-quick-whatsapp"
                href={dynamicWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto justify-center px-4 py-2.5 rounded-[10px] text-xs font-bold text-white bg-[#E5733A] hover:bg-[#d46229] active:scale-95 shadow-md shadow-[#E5733A]/25 transition-all flex items-center gap-2 min-h-[40px]"
              >
                <WhatsAppIcon className="w-4 h-4 text-white" />
                <span>{t.modalChatWhatsappBtn}</span>
              </a>
            </div>

            {/* Meeting Point & Single Host Bio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-[#C98B4B]/20 font-body">
              <div className="p-4 rounded-[12px] bg-[#F8F5F0] border border-[#C98B4B]/25">
                <h4 className="font-heading font-bold text-xs text-[#9C4A2F] uppercase tracking-wider mb-1">
                  {t.meetingPointLabel}
                </h4>
                <p className="text-xs font-semibold text-[#2E2118]">
                  {loc.meetingPoint}
                </p>
                <p className="text-[11px] text-[#2E2118]/60 mt-1">
                  {t.modalGpsNote}
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#F8F5F0] border border-[#C98B4B]/25 flex items-center gap-3">
                <div className="w-12 h-12 rounded-[12px] bg-[#9C4A2F]/10 border border-[#9C4A2F]/20 flex items-center justify-center shrink-0 text-[#9C4A2F]">
                  <MountainLineIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#2E2118]">
                    {item.hostName || 'Hossain Amalo'}
                  </h4>
                  <p className="text-[11px] text-[#9C4A2F] font-medium">{loc.hostRole || 'Certified Toubkal & Mountain Guide'}</p>
                  <p className="text-[10px] text-[#2E2118]/60 mt-0.5">
                    {t.modalLanguagesLabel} {item.hostLanguages?.join(', ') || 'Berber, Arabic, English, French'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Modal Bottom Bar Action with Sunrise Orange WhatsApp button */}
        <div 
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
          className="shrink-0 p-3 sm:p-4 md:p-5 md:px-8 bg-[#F8F5F0] border-t border-[#C98B4B]/25 flex flex-col xs:flex-row xs:items-center justify-between gap-3 z-20 shadow-lg font-body"
        >
          <div className="flex items-center justify-between xs:block">
            <span className="text-[10px] sm:text-[11px] text-[#2E2118]/60 font-medium block">
              {hasGroupPricing && isNoMatchingTier
                ? (isAr ? 'عرض سعر مخصص' : currentLang === 'fr' ? 'Devis sur mesure' : 'Custom Quote')
                : `${t.totalDue} (${t.fromPrice})`}
            </span>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="font-heading text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2E2118]">
                {hasGroupPricing
                  ? matchingTier
                    ? `${matchingTier.pricePerPerson * guestsCount} ${groupCurrencySymbol}`
                    : (isAr ? 'حسب الطلب' : currentLang === 'fr' ? 'Sur devis' : 'On Request')
                  : formatPrice(item.priceMAD * guestsCount, currentCurrency)}
              </span>
              <span className="text-[11px] sm:text-xs text-[#2E2118]/60">
                ({guestsCount} {isAr ? 'أشخاص' : 'Guests'})
                {hasGroupPricing && matchingTier && (
                  <span className="text-[#9C4A2F] font-semibold ms-1">
                    • {matchingTier.pricePerPerson} {groupCurrencySymbol} /{t.perPerson}
                  </span>
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full xs:w-auto">
            <button
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-[10px] text-xs sm:text-sm font-semibold text-[#2E2118]/80 hover:bg-[#C98B4B]/20 transition-colors min-h-[44px] cursor-pointer"
            >
              {t.modalClose}
            </button>

            {/* Guaranteed-Visible WhatsApp Direct Booking Action in Sunrise Orange */}
            <a
              id="btn-modal-whatsapp-booking"
              href={dynamicWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={hasGroupPricing && isNoMatchingTier ? 'Contact Guide on WhatsApp' : t.modalBookWhatsappBtn}
              className="flex-1 xs:flex-none justify-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-[10px] text-xs sm:text-sm font-bold text-white bg-[#E5733A] hover:bg-[#d46229] active:scale-95 shadow-md shadow-[#E5733A]/25 hover:-translate-y-0.5 transition-all flex items-center gap-2 min-h-[44px] text-center"
            >
              <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white shrink-0" />
              <span className="whitespace-nowrap">
                {hasGroupPricing && isNoMatchingTier
                  ? (isAr ? 'تواصل مع المرشد عبر واتساب' : currentLang === 'fr' ? 'Contacter le guide sur WhatsApp' : currentLang === 'es' ? 'Contactar al guía por WhatsApp' : currentLang === 'de' ? 'Guide auf WhatsApp kontaktieren' : currentLang === 'it' ? 'Contatta la guida su WhatsApp' : 'Contact Guide on WhatsApp')
                  : t.modalBookWhatsappBtn}
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Fullscreen Photo Lightbox Modal */}
      <ImageLightboxModal
        images={allPhotos}
        initialIndex={currentPhotoIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        tourTitle={loc.title}
      />
    </div>
  );
};
