import React from 'react';
import { X, Heart, Trash2, MessageCircle } from 'lucide-react';
import { ListingItem, Currency, LanguageCode } from '../types';
import { formatPrice, getWhatsAppBookingUrl } from '../utils/formatters';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedListing } from '../data/localizedContent';
import { WhatsAppIcon } from './Navbar';
import { MountainLineIcon } from './AtlasLineIcons';
import { isStockPhoto } from '../lib/firebase';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: ListingItem[];
  onRemoveItem: (item: ListingItem) => void;
  onBookNow?: (item: ListingItem) => void;
  onViewDetails: (item: ListingItem) => void;
  currentCurrency: Currency;
  currentLang: LanguageCode;
  whatsappNumber?: string;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlist,
  onRemoveItem,
  onViewDetails,
  currentCurrency,
  currentLang,
  whatsappNumber
}) => {
  const t = TRANSLATIONS[currentLang];

  if (!isOpen) return null;

  return (
    <div
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end font-body"
    >
      <div 
        style={{
          paddingTop: 'max(0px, env(safe-area-inset-top, 0px))',
          paddingBottom: 'max(0px, env(safe-area-inset-bottom, 0px))'
        }}
        className={`w-full max-w-md bg-white/90 backdrop-blur-2xl border-l border-white/60 h-full h-[100dvh] shadow-2xl flex flex-col justify-between animate-in ${currentLang === 'ar' ? 'slide-in-from-left' : 'slide-in-from-right'} duration-300`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/50 flex items-center justify-between bg-white/60 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-[#9C4A2F] text-[#9C4A2F]" />
            <h2 className="font-heading font-bold text-lg text-[#2E2118]">
              {t.wishlist} ({wishlist.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-[#2E2118]/70 hover:text-[#2E2118] hover:bg-white/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Wishlist items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {wishlist.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-xs text-[#9C4A2F] flex items-center justify-center mx-auto border border-white/60 shadow-xs">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#2E2118]">
                {currentLang === 'ar' ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
              </h3>
              <p className="text-xs text-[#2E2118]/70 max-w-xs mx-auto">
                {currentLang === 'ar'
                  ? 'انقر على أيقونة القلب في أي جولة في جبل توبقال أو نشاط سياحي لحفظه هنا والعودة إليه لاحقاً.'
                  : 'Click the heart icon on any Mount Toubkal trek or High Atlas tour to save it for later.'}
              </p>
            </div>
          ) : (
            wishlist.map((item) => {
              const loc = getLocalizedListing(item, currentLang);
              const waUrl = getWhatsAppBookingUrl(item, currentLang, loc.title, loc.duration, undefined, 2, whatsappNumber);
              const hasRealImage = Boolean(item.imageUrl && !isStockPhoto(item.imageUrl));

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-[14px] bg-white/65 backdrop-blur-md border border-white/70 shadow-xs flex gap-3 hover:border-[#9C4A2F] transition-colors"
                >
                  {hasRealImage ? (
                    <img
                      src={item.imageUrl}
                      alt={loc.title}
                      width={80}
                      height={80}
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 rounded-[10px] object-cover shrink-0 cursor-pointer"
                      onClick={() => {
                        onClose();
                        onViewDetails(item);
                      }}
                    />
                  ) : (
                    <div 
                      className="w-20 h-20 rounded-[10px] bg-gradient-to-br from-[#2E2118] via-[#38281E] to-[#201610] flex items-center justify-center shrink-0 cursor-pointer border border-[#C98B4B]/20"
                      onClick={() => {
                        onClose();
                        onViewDetails(item);
                      }}
                    >
                      <MountainLineIcon className="w-6 h-6 text-[#C98B4B] stroke-[1.5]" />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-[#2E2118]/60 mb-0.5">
                        <span>{loc.city}</span>
                        <button
                          onClick={() => onRemoveItem(item)}
                          className="text-[#2E2118]/40 hover:text-[#9C4A2F] p-0.5 cursor-pointer"
                          title={currentLang === 'ar' ? 'حذف من المفضلة' : 'Remove from saved'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4
                        onClick={() => {
                          onClose();
                          onViewDetails(item);
                        }}
                        className="font-heading font-bold text-xs text-[#2E2118] hover:text-[#9C4A2F] cursor-pointer line-clamp-1"
                      >
                        {loc.title}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/50 gap-2">
                      <span className="font-bold text-xs text-[#2E2118]">
                        {formatPrice(item.priceMAD, currentCurrency)}
                      </span>
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={currentLang === 'ar' ? 'حجز مباشر عبر واتساب' : 'Book via WhatsApp'}
                        className="px-3 py-1.5 rounded-[8px] text-xs font-bold text-white bg-[#E5733A] hover:bg-[#d46229] transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                        <span>{t.bookNow}</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        {wishlist.length > 0 && (
          <div className="p-4 border-t border-white/50 bg-white/50 backdrop-blur-md">
            <p className="text-[11px] text-[#2E2118]/70 text-center">
              {currentLang === 'ar'
                ? 'الحجوزات تتم بتأكيد فوري ومباشر مع مرشدك المحلي عبر واتساب'
                : 'Direct 1-click confirmation with your local guide via WhatsApp'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
