import React, { useState } from 'react';
import { Tag, Sparkles, Clock, Copy, Check, MessageCircle } from 'lucide-react';
import { ListingItem, Currency, LanguageCode } from '../types';
import { formatPrice, getWhatsAppBookingUrl } from '../utils/formatters';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedListing } from '../data/localizedContent';

interface PromotionsSectionProps {
  promotionalItems: ListingItem[];
  currentCurrency: Currency;
  currentLang: LanguageCode;
  onBookNow?: (item: ListingItem) => void;
  onViewDetails: (item: ListingItem) => void;
}

export const PromotionsSection: React.FC<PromotionsSectionProps> = ({
  promotionalItems,
  currentCurrency,
  currentLang,
  onViewDetails
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const t = TRANSLATIONS[currentLang];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!promotionalItems || promotionalItems.length === 0) {
    return null;
  }

  return (
    <section id="offers-section" className="py-16 bg-gradient-to-b from-amber-50/70 via-white to-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-[#9a3412] text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
              <Tag className="w-3.5 h-3.5 text-[#c2410c]" />
              <span>{currentLang === 'ar' ? 'عروض حصرية محدودة المدة' : currentLang === 'fr' ? 'Offres Spéciales Limitées' : 'Limited-Time Special Deals'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1c130c] font-heading tracking-tight">
              {t.offersTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-stone-600 max-w-2xl">
              {t.offersSub}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-xs border border-amber-200 text-xs font-semibold text-[#c2410c]">
            <Clock className="w-4 h-4 text-[#ea580c] animate-spin" />
            <span>{currentLang === 'ar' ? 'خصومات موسمية سارية • تعديل مجاني للمواعيد' : currentLang === 'fr' ? 'Réductions de saison actives • Modification gratuite' : 'Season Discounts Active • Free Date Reschedule'}</span>
          </div>
        </div>

        {/* Promo Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promotionalItems.slice(0, 2).map((item, idx) => {
            const promoCode = idx === 0 ? 'ATLAS15' : 'EXPLORE10';
            const discountLabel = idx === 0 
              ? (currentLang === 'ar' ? 'خصم 15% حصري' : currentLang === 'fr' ? '15% de Réduction' : 'Save 15% OFF')
              : (currentLang === 'ar' ? 'خصم 10% حصري' : currentLang === 'fr' ? '10% de Réduction' : 'Save 10% OFF');
            const loc = getLocalizedListing(item, currentLang);

            return (
              <div
                key={item.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-desert hover:shadow-desert-hover border border-amber-900/10 transition-all duration-300 flex flex-col sm:flex-row"
              >
                {/* Image side */}
                <div className="sm:w-2/5 relative overflow-hidden bg-stone-100 min-h-[220px]">
                  <img
                    src={item.imageUrl}
                    alt={loc.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#c2410c] text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                      {discountLabel}
                    </span>
                  </div>
                </div>

                {/* Content side */}
                <div className="sm:w-3/5 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                      <span className="font-semibold text-[#c2410c]">{loc.city}</span>
                      <span>{loc.duration}</span>
                    </div>

                    <h3
                      onClick={() => onViewDetails(item)}
                      className="font-heading font-bold text-lg text-[#1c130c] hover:text-[#c2410c] cursor-pointer transition-colors line-clamp-2"
                    >
                      {loc.title}
                    </h3>

                    <p className="mt-1.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {loc.overview}
                    </p>

                    {/* Promo Code Box */}
                    <div className="mt-3.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-stone-500">{currentLang === 'ar' ? 'كوبون الخصم:' : currentLang === 'fr' ? 'Code Promo:' : 'Promo Code:'}</span>
                        <span className="font-mono font-bold text-xs text-[#9a3412] bg-white px-2 py-0.5 rounded border border-amber-300">
                          {promoCode}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(promoCode)}
                        className="text-[11px] font-bold text-[#c2410c] hover:text-[#1c130c] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode === promoCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">{currentLang === 'ar' ? 'تم النسخ' : currentLang === 'fr' ? 'Copié' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{currentLang === 'ar' ? 'نسخ' : currentLang === 'fr' ? 'Copier' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Price & Book via WhatsApp */}
                  <div className="mt-4 pt-3 border-t border-amber-900/10 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-heading text-xl font-extrabold text-[#1c130c]">
                          {formatPrice(item.priceMAD, currentCurrency)}
                        </span>
                        {item.originalPriceMAD && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatPrice(item.originalPriceMAD, currentCurrency)}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-stone-500">
                        /{t.perPerson}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewDetails(item)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#9a3412] bg-[#fef3c7] hover:bg-[#fde68a] border border-amber-300/60 transition-colors cursor-pointer"
                      >
                        {t.viewDetails}
                      </button>
                      <a
                        href={getWhatsAppBookingUrl(item, currentLang, loc.title, loc.duration)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] active:scale-95 glow-whatsapp transition-all flex items-center gap-1.5"
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
