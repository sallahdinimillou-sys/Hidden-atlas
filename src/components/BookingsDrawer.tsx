import React from 'react';
import { X, Calendar, Ticket, Download, Printer, CheckCircle2, MessageCircle } from 'lucide-react';
import { Booking, Currency, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { formatPrice } from '../utils/formatters';
import { getLocalizedListing } from '../data/localizedContent';

interface BookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  currentCurrency: Currency;
  currentLang: LanguageCode;
}

export const BookingsDrawer: React.FC<BookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
  currentCurrency,
  currentLang
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[currentLang];

  return (
    <div
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end"
    >
      <div className={`w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between animate-in ${currentLang === 'ar' ? 'slide-in-from-left' : 'slide-in-from-right'} duration-300`}>
        {/* Header */}
        <div className="p-5 border-b border-amber-900/30 flex items-center justify-between bg-[#1c130c] text-white">
          <div className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-amber-400" />
            <h2 className="font-heading font-bold text-lg text-white">
              {t.myBookings} ({bookings.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bookings List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-20 space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-100 text-[#c2410c] flex items-center justify-center mx-auto">
                <Ticket className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-base text-[#1c130c]">
                {currentLang === 'ar' ? 'لا توجد حجوزات نشطة حالياً' : 'No active bookings yet'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                {currentLang === 'ar'
                  ? 'بمجرد إتمام حجز جولة جبلية في الأطلس، رحلة صحراوية، ركوب جمال أو خيول، ستظهر قسائم الحجز وتفاصيل دليلك هنا.'
                  : 'Once you confirm an Atlas mountain trek, desert safari, camel ride, or quad tour, your vouchers and guide details will appear here.'}
              </p>
            </div>
          ) : (
            bookings.map((b) => {
              const loc = getLocalizedListing(b.item, currentLang);
              return (
                <div
                  key={b.bookingRef}
                  className="p-5 rounded-2xl bg-white border-2 border-amber-200/80 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between pb-2.5 border-b border-stone-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        {currentLang === 'ar' ? 'الرمز المرجعي' : 'Ref Code'}
                      </span>
                      <span className="font-mono font-bold text-sm text-[#c2410c] block">
                        {b.bookingRef}
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{currentLang === 'ar' ? 'مؤكد - الدفع بالوصول' : 'Confirmed (Pay on Arrival)'}</span>
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <img
                      src={b.item.imageUrl}
                      alt={loc.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading font-bold text-sm text-[#1c130c] line-clamp-1">
                        {loc.title}
                      </h4>
                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-[#c2410c]" />
                        <span>{b.startDate}</span>
                      </p>
                      <p className="text-[11px] text-stone-600 font-medium mt-1">
                        {b.guestInfo.fullName} • {b.guestInfo.phone}
                      </p>
                    </div>
                  </div>

                  {b.selectedAddons && b.selectedAddons.length > 0 && (
                    <div className="text-[11px] bg-amber-50/70 p-2 rounded-lg text-stone-700">
                      <span className="font-bold">{currentLang === 'ar' ? 'الإضافات: ' : 'Addons: '}</span>
                      {b.selectedAddons.map((a) => a.name).join(', ')}
                    </div>
                  )}

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500">{currentLang === 'ar' ? 'الضيوف:' : 'Guests:'}</span>
                      <span className="font-bold text-stone-700 mx-1">
                        {b.guests.adults} {currentLang === 'ar' ? 'بالغين' : 'Adults'} {b.guests.children > 0 ? `, ${b.guests.children} ${currentLang === 'ar' ? 'أطفال' : 'Children'}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="font-heading font-extrabold text-sm text-[#1c130c]">
                        {formatPrice(b.totalPriceMAD, currentCurrency)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2 rounded-lg border border-stone-200 text-xs font-semibold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{t.downloadVoucher}</span>
                    </button>

                    <a
                      href={`https://wa.me/212662634926?text=Hello%20Hidden%20Atlas,%20Booking%20Ref:%20${b.bookingRef}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{currentLang === 'ar' ? 'تواصل واتساب' : 'WhatsApp Concierge'}</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-[#FDFBF7]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-xs font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 cursor-pointer"
          >
            {currentLang === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
