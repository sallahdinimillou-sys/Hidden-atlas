import React, { useState } from 'react';
import { X, Check, Calendar, ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import { ListingItem, AddonOption, Booking, Currency, LanguageCode } from '../types';
import { formatPrice, sanitizeWhatsAppNumber } from '../utils/formatters';
import { getLocalizedListing } from '../data/localizedContent';
import { findMatchingTier, getCurrencySymbol, formatGroupPricingPrice } from '../utils/groupPricing';

interface BookingModalProps {
  item: ListingItem | null;
  isOpen: boolean;
  onClose: () => void;
  currentCurrency: Currency;
  currentLang: LanguageCode;
  onConfirmBooking: (booking: Booking) => void;
  whatsappNumber?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  item,
  isOpen,
  onClose,
  currentCurrency,
  currentLang,
  onConfirmBooking,
  whatsappNumber
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);

  // Guest details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialNote, setSpecialNote] = useState('');
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);

  if (!isOpen || !item) return null;

  const isAr = currentLang === 'ar';
  const loc = getLocalizedListing(item, currentLang);
  const totalGuests = adults + children;

  // Group pricing resolution
  const hasGroupPricing = Boolean(item.groupPricing && item.groupPricing.length > 0);
  const matchedTier = hasGroupPricing ? findMatchingTier(item.groupPricing!, totalGuests) : null;
  const isNoMatchingTier = hasGroupPricing && totalGuests > 0 && !matchedTier;

  // Pricing math: convert tier price to MAD if using group pricing
  let perPersonMAD = item.priceMAD;
  if (matchedTier) {
    const tierCur = item.groupPricingCurrency || 'EUR';
    if (tierCur === 'EUR') perPersonMAD = Math.round(matchedTier.pricePerPerson * 10.8);
    else if (tierCur === 'USD') perPersonMAD = Math.round(matchedTier.pricePerPerson * 10);
    else if (tierCur === 'GBP') perPersonMAD = Math.round(matchedTier.pricePerPerson * 12.5);
    else perPersonMAD = Math.round(matchedTier.pricePerPerson);
  }

  const subtotalMAD = perPersonMAD * (adults + children * 0.7);
  const addonsTotalMAD = selectedAddons.reduce((acc, a) => acc + a.priceMAD * adults, 0);
  const grandTotalMAD = Math.round(subtotalMAD + addonsTotalMAD);

  const handleToggleAddon = (addon: AddonOption) => {
    if (selectedAddons.some((a) => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const handleCompleteBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const refCode = `TOUBKAL-${Math.floor(100000 + Math.random() * 900000)}`;
    const newBooking: Booking = {
      bookingRef: refCode,
      item,
      startDate,
      guests: { adults, children },
      selectedAddons,
      guestInfo: {
        fullName: fullName || (isAr ? 'ضيف مسافر' : 'Guest Traveler'),
        email: email || 'guest@example.com',
        phone: phone || '0662634926',
        country: 'Morocco'
      },
      totalPriceMAD: grandTotalMAD,
      currency: currentCurrency,
      paymentMethod: 'pay_on_arrival',
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    setCompletedBooking(newBooking);
    onConfirmBooking(newBooking);
    setCurrentStep(3);
  };

  const targetDigits = sanitizeWhatsAppNumber(whatsappNumber || '+212662634926');

  const handleSendWhatsApp = () => {
    if (!completedBooking) return;
    const msg = encodeURIComponent(
      `*Hidden Atlas Morocco • Toubkal Trekking Booking*\n` +
      `📌 *Ref Code:* ${completedBooking.bookingRef}\n` +
      `🏔️ *Activity:* ${item.title}\n` +
      `📅 *Date:* ${completedBooking.startDate}\n` +
      `👥 *Number of People:* ${adults + children} (${adults} Adults, ${children} Children)\n` +
      `👤 *Lead Guest:* ${fullName} (${phone})\n` +
      `💰 *Estimated Total:* ${formatPrice(grandTotalMAD, currentCurrency)}\n` +
      `Please confirm guide availability and meeting details.`
    );
    window.open(`https://wa.me/${targetDigits}?text=${msg}`, '_blank');
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#2E2118]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="bg-white rounded-[14px] max-w-lg w-full shadow-2xl border border-[#C98B4B]/30 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#2E2118] text-[#F8F5F0] flex items-center justify-between border-b border-[#C98B4B]/40">
          <div className="flex items-center gap-2.5">
            <img
              src={item.imageUrl}
              alt={loc.title}
              className="w-10 h-10 rounded-[8px] object-cover border border-[#C98B4B]/50"
            />
            <div>
              <h3 className="font-heading font-bold text-xs sm:text-sm text-[#F8F5F0] line-clamp-1">
                {loc.title}
              </h3>
              <p className="text-[11px] text-[#C98B4B]">
                {item.city} • {formatPrice(item.priceMAD, currentCurrency)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#F8F5F0]/70 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#F8F5F0] px-6 py-2.5 border-b border-[#C98B4B]/20 flex items-center justify-between text-xs font-semibold text-[#2E2118]/70">
          <span className={currentStep === 1 ? 'text-[#9C4A2F] font-bold' : ''}>
            1. {isAr ? 'التاريخ والضيوف' : 'Date & Guests'}
          </span>
          <span>→</span>
          <span className={currentStep === 2 ? 'text-[#9C4A2F] font-bold' : ''}>
            2. {isAr ? 'بيانات الضيف' : 'Guest Details'}
          </span>
          <span>→</span>
          <span className={currentStep === 3 ? 'text-[#9C4A2F] font-bold' : ''}>
            3. {isAr ? 'تأكيد الحجز' : 'Confirmation'}
          </span>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 text-xs sm:text-sm font-body">
          {/* STEP 1: Date & Guests */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-[#2E2118] mb-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#9C4A2F]" />
                  <span>{isAr ? 'تاريخ الحجز المفضل' : 'Preferred Date'}</span>
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 font-medium focus:ring-2 focus:ring-[#9C4A2F] focus:outline-none"
                />
              </div>

              {/* Guest counter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-[10px] border border-[#C98B4B]/30 bg-[#F8F5F0]">
                  <span className="block font-bold text-[#2E2118] text-xs mb-1">
                    {isAr ? 'البالغين (+12)' : 'Adults (12+)'}
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={adults <= 1}
                      onClick={() => setAdults((a) => Math.max(1, a - 1))}
                      className="w-7 h-7 rounded-[6px] bg-white border border-[#C98B4B]/40 font-bold disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm text-[#2E2118]">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults((a) => a + 1)}
                      className="w-7 h-7 rounded-[6px] bg-white border border-[#C98B4B]/40 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-[10px] border border-[#C98B4B]/30 bg-[#F8F5F0]">
                  <span className="block font-bold text-[#2E2118] text-xs mb-1">
                    {isAr ? 'الأطفال (2-11)' : 'Children (2-11)'}
                  </span>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      disabled={children <= 0}
                      onClick={() => setChildren((c) => Math.max(0, c - 1))}
                      className="w-7 h-7 rounded-[6px] bg-white border border-[#C98B4B]/40 font-bold disabled:opacity-30 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-bold text-sm text-[#2E2118]">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren((c) => c + 1)}
                      className="w-7 h-7 rounded-[6px] bg-white border border-[#C98B4B]/40 font-bold cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Addons if available */}
              {item.availableAddons && item.availableAddons.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#C98B4B]/20">
                  <span className="font-bold text-[#2E2118] block text-xs">
                    {isAr ? 'إضافات وتحديثات اختيارية:' : 'Optional Add-ons:'}
                  </span>
                  {item.availableAddons.slice(0, 2).map((addon) => {
                    const isSelected = selectedAddons.some((a) => a.id === addon.id);
                    return (
                      <div
                        key={addon.id}
                        onClick={() => handleToggleAddon(addon)}
                        className={`p-2.5 rounded-[10px] border cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'border-[#9C4A2F] bg-[#F8F5F0] text-[#2E2118]'
                            : 'border-[#C98B4B]/30 hover:border-[#9C4A2F]'
                        }`}
                      >
                        <div>
                          <span className="font-bold block">{addon.name}</span>
                          <span className="text-[10px] text-[#2E2118]/60">{addon.description}</span>
                        </div>
                        <span className="font-bold text-[#9C4A2F]">
                          +{formatPrice(addon.priceMAD, currentCurrency)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Price summary */}
              <div className="p-3.5 rounded-[10px] bg-[#F8F5F0] border border-[#C98B4B]/30 flex items-center justify-between">
                <div>
                  <span className="text-[#2E2118] block font-medium">{isAr ? 'المجموع التقديري:' : 'Estimated Total:'}</span>
                  <span className="text-[10px] text-[#2E2118]/60">
                    {isAr ? 'لا يلزم الدفع الآن • الدفع عند الوصول' : 'Pay on arrival • Free cancellation'}
                  </span>
                </div>
                <span className="font-heading font-extrabold text-base sm:text-lg text-[#2E2118]">
                  {formatPrice(grandTotalMAD, currentCurrency)}
                </span>
              </div>

              {/* Sunrise Orange CTA */}
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3 rounded-[10px] bg-[#E5733A] hover:bg-[#d46229] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#E5733A]/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>{isAr ? 'المتابعة إلى بيانات الحجز' : 'Continue to Guest Details'}</span>
                {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* STEP 2: Guest Details */}
          {currentStep === 2 && (
            <form onSubmit={handleCompleteBooking} className="space-y-3.5">
              <div>
                <label className="block font-bold text-[#2E2118] mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name (Lead Guest)'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={isAr ? 'مثال: سمير الإدريسي' : 'e.g. David Miller'}
                  className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 focus:ring-2 focus:ring-[#9C4A2F] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2E2118] mb-1">
                    {isAr ? 'رقم الهاتف / واتساب' : 'WhatsApp / Mobile'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0662634926"
                    dir="ltr"
                    className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 focus:ring-2 focus:ring-[#9C4A2F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2E2118] mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guest@example.com"
                    className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 focus:ring-2 focus:ring-[#9C4A2F] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2E2118] mb-1">
                  {isAr ? 'ملاحظات خاصة أو استفسار' : 'Special Notes / Dietary Requirements'}
                </label>
                <textarea
                  rows={2}
                  value={specialNote}
                  onChange={(e) => setSpecialNote(e.target.value)}
                  placeholder={isAr ? 'مكان اللقاء أو الانطلاق المفضل وأي ملاحظات...' : 'Preferred pickup/meeting point or special notes...'}
                  className="w-full p-2.5 rounded-[10px] border border-[#C98B4B]/40 text-xs focus:ring-2 focus:ring-[#9C4A2F] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 rounded-[10px] border border-[#C98B4B]/40 text-[#2E2118] font-semibold cursor-pointer hover:bg-[#F8F5F0]"
                >
                  {isAr ? 'رجوع' : 'Back'}
                </button>

                <button
                  type="submit"
                  className="flex-1 py-3 rounded-[10px] bg-[#E5733A] hover:bg-[#d46229] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#E5733A]/25 active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isAr ? 'تأكيد الحجز المسبق' : 'Confirm Pre-Booking'}</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Instant Confirmation & WhatsApp Trigger */}
          {currentStep === 3 && completedBooking && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 rounded-full bg-[#55663A]/20 text-[#55663A] flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[11px] uppercase font-bold text-[#2E2118]/60">
                  {isAr ? 'الرمز المرجعي للحجز' : 'Booking Reference'}
                </span>
                <p className="font-mono font-black text-lg text-[#2E2118] tracking-wider">
                  {completedBooking.bookingRef}
                </p>
              </div>

              <div className="p-4 rounded-[12px] bg-[#F8F5F0] border border-[#C98B4B]/30 text-left space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#2E2118]/60">{isAr ? 'النشاط:' : 'Activity:'}</span>
                  <span className="font-bold text-[#2E2118] line-clamp-1">{item.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2E2118]/60">{isAr ? 'التاريخ:' : 'Date:'}</span>
                  <span className="font-bold text-[#2E2118]">{completedBooking.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#2E2118]/60">{isAr ? 'الضيوف:' : 'Number of People:'}</span>
                  <span className="font-bold text-[#2E2118]">{adults + children} ({adults} {isAr ? 'بالغ' : 'Adults'}, {children} {isAr ? 'أطفال' : 'Children'})</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#C98B4B]/30">
                  <span className="font-bold text-[#2E2118]">{isAr ? 'المجموع المستحق:' : 'Estimated Total:'}</span>
                  <span className="font-bold text-[#9C4A2F]">{formatPrice(grandTotalMAD, currentCurrency)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSendWhatsApp}
                  className="w-full py-3.5 rounded-[10px] bg-[#E5733A] hover:bg-[#d46229] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-[#E5733A]/25 transition-all active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{isAr ? 'إرسال الحجز فوراً عبر واتساب' : 'Send Booking on WhatsApp'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-[10px] text-xs font-semibold text-[#2E2118]/70 hover:text-[#2E2118] cursor-pointer"
                >
                  {isAr ? 'إغلاق ومتابعة التصفح' : 'Close and Continue Browsing'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
