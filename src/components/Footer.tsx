import React from 'react';
import { ShieldCheck, Mail, Phone, MapPin, ArrowUp, Lock, Facebook, Instagram } from 'lucide-react';
import { LanguageCode, Currency, SiteSettings } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { CURRENCY_RATES } from '../data/mockData';
import { WhatsAppIcon } from './Navbar';
import { HiddenAtlasLogo } from './HiddenAtlasLogo';
import { MountainRidgeDivider } from './MountainRidgeDivider';
import { sanitizeWhatsAppNumber, getWhatsAppContactUrl } from '../utils/formatters';

interface FooterProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentCurrency: Currency;
  onCurrencyChange: (curr: Currency) => void;
  onNavigate: (section: string) => void;
  onOpenAdmin?: () => void;
  settings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang,
  onLanguageChange,
  currentCurrency,
  onCurrencyChange,
  onNavigate,
  onOpenAdmin,
  settings
}) => {
  const t = TRANSLATIONS[currentLang];
  const isAr = currentLang === 'ar';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const languages: { code: LanguageCode; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'es', label: 'Español' },
    { code: 'de', label: 'Deutsch' },
    { code: 'it', label: 'Italiano' },
  ];

  const currencies: Currency[] = ['MAD', 'EUR', 'USD', 'GBP'];

  const displayPhone = settings?.whatsappDisplay || '0662634926';
  const internationalPhone = settings?.whatsappNumber || '+212662634926';
  const cleanPhone = sanitizeWhatsAppNumber(internationalPhone);
  const contactEmail = settings?.email || 'houssainbaaki71@gmail.com';
  const facebookUrl = settings?.facebookUrl || 'https://www.facebook.com/share/18k4njmMaP/?mibextid=wwXIfr';
  const instagramUrl = settings?.instagramUrl || 'https://www.instagram.com/amalo_hossain?obrf=aDd4N2gwNTAyZTd5&utm_source=qr';

  const whatsappFooterUrl = getWhatsAppContactUrl(
    cleanPhone,
    isAr
      ? 'السلام عليكم أخي حسين (Hidden Atlas)، أود الاستفسار عن رحلات جبل توبقال وجبال الأطلس.'
      : 'Hello Hossain (Hidden Atlas), I would like to inquire about guided Toubkal treks and Atlas mountain tours.',
    currentLang
  );

  return (
    <footer id="main-footer" className="relative bg-[#2E2118] text-[#F8F5F0] pt-0 pb-[max(3rem,env(safe-area-inset-bottom,0px))] border-t border-[#C98B4B]/30 overflow-hidden">
      {/* Mountain Ridge silhouette divider leading into dark footer */}
      <MountainRidgeDivider fillColor="#2E2118" bgColor="#F8F5F0" />

      {/* Subtle Amazigh diamond overlay */}
      <div className="absolute inset-0 bg-zellige-dark opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10 pt-10 sm:pt-14 space-y-12">
        {/* Top Brand & Quick Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Brand Info & Cultural Connection */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#9C4A2F] to-[#2E2118] flex items-center justify-center text-white shadow-md border border-[#C98B4B]/40 p-1.5 shrink-0">
                <HiddenAtlasLogo variant="emblem" className="w-full h-full text-[#F8F5F0]" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl tracking-tight text-[#F8F5F0]">
                  HIDDEN ATLAS
                </span>
                <p className="text-xs text-[#C98B4B] font-medium">
                  {t.brandTagline}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#F8F5F0]/80 leading-relaxed font-body">
              {t.footerBrandDesc}
            </p>

            {/* Official Guide Accreditation Seal */}
            <div className="p-3.5 rounded-[14px] bg-black/25 border border-[#C98B4B]/30 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#C98B4B] shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-white">
                  {settings?.guideName || 'Hossain Amalo'} • {t.licensedOperator}
                </p>
                <p className="text-[10px] text-[#C98B4B]">
                  Mount Toubkal & High Atlas Certified Local Guide
                </p>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#C98B4B] tracking-wider uppercase">
              {t.quickNavigation}
            </h4>
            <ul className="space-y-2 text-xs text-[#F8F5F0]/85 font-body">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {t.navHome}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trips')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {t.navTrips}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('activities')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {t.navActivities}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {t.navAbout}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {t.navContact}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Experience Highlights */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#C98B4B] tracking-wider uppercase">
              {t.experienceCategories}
            </h4>
            <ul className="space-y-2 text-xs text-[#F8F5F0]/85 font-body">
              <li>
                <button onClick={() => onNavigate('trips')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {isAr ? 'تسلق قمة توبقال (4167 م)' : 'Mount Toubkal Summit (4,167m)'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('trips')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {isAr ? 'مسارات وادي إمليل وقرى الأطلس' : 'Imlil Valley & Berber Villages'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('activities')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {isAr ? 'مغامرات بحيرة إفني وجبال توبقال' : 'Lake Ifni High Mountain Trek'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('activities')} className="hover:text-[#E5733A] transition-colors cursor-pointer">
                  {isAr ? 'رحلات الصحراء الكبرى والكثبان' : 'Sahara Desert & Dunes Journeys'}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Social Channels */}
          <div className="space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#C98B4B] tracking-wider uppercase">
              {t.guestConcierge}
            </h4>
            <div className="space-y-2.5 text-xs text-[#F8F5F0]/85 font-body">
              <div className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E5733A] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5">
                  <a
                    href={whatsappFooterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    dir="ltr"
                    className="hover:text-[#E5733A] transition-colors flex items-center gap-1.5"
                  >
                    <span className="font-mono font-bold">{displayPhone}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#E5733A]/20 text-[#E5733A] font-semibold">WhatsApp</span>
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C98B4B] shrink-0" />
                <a
                  href={`mailto:${contactEmail}`}
                  className="hover:text-[#E5733A] transition-colors break-all"
                >
                  {contactEmail}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#9C4A2F] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1.5">
                  <span>{t.mainDeskAddress || (isAr ? 'وادي بحيرة إفني، الأطلس الكبير، المغرب' : 'Lake Ifni Valley Base, High Atlas, Morocco')}</span>
                  <a
                    href="https://maps.app.goo.gl/Bg3scX2BXjBwc3ue6?g_st=iwb"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Find us on Google Maps"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[11px] font-bold text-white bg-[#9C4A2F] hover:bg-[#853C24] active:scale-95 transition-all w-fit shadow-xs"
                  >
                    <MapPin className="w-3 h-3 text-white" />
                    <span>{t.findUsGoogleMaps || (isAr ? 'موقعنا على خرائط جوجل' : 'Find us on Google Maps')}</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Social Media Links (Instagram & Facebook) */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-[11px] font-semibold text-[#C98B4B] block">
                {t.socialFollow}
              </span>
              <div className="flex items-center gap-2.5">
                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook: Hossain Amalo Hidden Atlas"
                  title="Facebook: Hossain Amalo"
                  className="w-9 h-9 rounded-[10px] bg-white/10 hover:bg-[#9C4A2F] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
                >
                  <Facebook className="w-4 h-4" />
                </a>

                {/* Instagram */}
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram: @amalo_hossain"
                  title="Instagram: @amalo_hossain"
                  className="w-9 h-9 rounded-[10px] bg-white/10 hover:bg-[#9C4A2F] text-white flex items-center justify-center transition-all duration-200 hover:scale-105 border border-white/10"
                >
                  <Instagram className="w-4 h-4" />
                </a>

                {/* WhatsApp Chat Button - Sunrise Orange */}
                <a
                  href={whatsappFooterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp with Hossain"
                  title={`WhatsApp: ${displayPhone}`}
                  className="px-3 h-9 rounded-[10px] bg-[#E5733A] hover:bg-[#d46229] text-white flex items-center justify-center gap-1.5 text-xs font-bold transition-all duration-200 hover:scale-105 shadow-md shadow-[#E5733A]/25"
                >
                  <WhatsAppIcon className="w-4 h-4 text-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Language & Currency Selector Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-body">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap text-xs w-full md:w-auto">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#C98B4B] font-medium">{t.selectLanguage}:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => onLanguageChange(l.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors min-h-[32px] cursor-pointer ${
                      currentLang === l.code
                        ? 'bg-[#9C4A2F] text-white font-bold shadow-xs'
                        : 'text-[#F8F5F0]/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-2 sm:pt-0 sm:pl-3 sm:border-l border-white/15">
              <span className="text-[#C98B4B] font-medium">{t.selectCurrency}:</span>
              <div className="flex items-center gap-1 flex-wrap">
                {currencies.map((c) => (
                  <button
                    key={c}
                    onClick={() => onCurrencyChange(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors min-h-[32px] cursor-pointer ${
                      currentCurrency === c
                        ? 'bg-[#9C4A2F] text-white font-bold shadow-xs'
                        : 'text-[#F8F5F0]/75 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {c} ({CURRENCY_RATES[c].symbol})
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#F8F5F0]/80 hover:text-white py-2 px-3 rounded-[10px] hover:bg-white/10 transition-colors min-h-[38px] cursor-pointer"
          >
            <span>{isAr ? 'العودة إلى الأعلى' : 'Back to top'}</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#C98B4B]" />
          </button>
        </div>

        {/* Copyright & Discreet Admin Access Link */}
        <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F8F5F0]/60 gap-2 font-body">
          <p>© {new Date().getFullYear()} Hidden Atlas Morocco • {settings?.guideName || 'Hossain Amalo'}. {t.footerRights}</p>
          
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1 text-[11px] text-[#F8F5F0]/60 hover:text-[#C98B4B] transition-colors cursor-pointer"
              title="Protected Admin Access"
            >
              <Lock className="w-3 h-3 text-[#C98B4B]" />
              <span>{isAr ? 'بوابة الإدارة' : 'Guide Portal'}</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};
