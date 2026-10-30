import React, { useState, useEffect } from 'react';
import { Globe, Heart, ChevronDown, Lock, MapPin } from 'lucide-react';
import { Currency, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { HiddenAtlasLogo } from './HiddenAtlasLogo';
import { getWhatsAppContactUrl } from '../utils/formatters';

interface NavbarProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  currentCurrency: Currency;
  onCurrencyChange: (cur: Currency) => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  wishlistCount: number;
  bookingsCount?: number;
  onOpenWishlist: () => void;
  onOpenBookings?: () => void;
  onOpenAdmin: () => void;
  whatsappNumber?: string;
}

// Official WhatsApp Vector Icon
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.711 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.414z" />
  </svg>
);

export const Navbar: React.FC<NavbarProps> = ({
  currentLang,
  onLanguageChange,
  currentCurrency,
  onCurrencyChange,
  activeSection,
  onNavigate,
  wishlistCount,
  onOpenWishlist,
  onOpenAdmin,
  whatsappNumber
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const t = TRANSLATIONS[currentLang];
  const isAr = currentLang === 'ar';

  // Smart Hide-on-scroll-down, Reveal-on-scroll-up with RAF throttle
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          setIsScrolled(currentY > 20);

          if (currentY <= 50) {
            setIsVisible(true);
          } else if (currentY > lastScrollY && currentY - lastScrollY > 10) {
            // Scrolling down -> hide navbar
            if (!mobileMenuOpen) {
              setIsVisible(false);
              setLangDropdownOpen(false);
              setCurrencyDropdownOpen(false);
            }
          } else if (lastScrollY - currentY > 8) {
            // Scrolling up -> show navbar
            setIsVisible(true);
          }

          setLastScrollY(currentY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇲🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  ];

  const currencies: Currency[] = ['MAD', 'EUR', 'USD', 'GBP'];

  const navItems = [
    { id: 'home', label: t.navHome },
    { id: 'trips', label: t.navTrips },
    { id: 'activities', label: t.navActivities },
    { id: 'about', label: t.navAbout },
    { id: 'contact', label: t.navContact },
  ];

  const directWhatsappUrl = getWhatsAppContactUrl(
    whatsappNumber,
    isAr 
      ? 'السلام عليكم أخي حسين (Hidden Atlas)، أود الاستفسار عن رحلاتك الجبلية في توبقال والأطلس.' 
      : 'Hello Hossain (Hidden Atlas), I would like to inquire about guided treks and activities in Morocco.',
    currentLang
  );

  return (
    <>
      <header
        id="main-navbar"
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ease-in-out transform ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        } ${
          isScrolled
            ? 'bg-white/45 backdrop-blur-xl shadow-[0_8px_32px_rgba(46,33,24,0.08)] border-b border-white/50 py-2.5 sm:py-3'
            : 'bg-transparent py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo with Toubkal Peak Minimal Emblem */}
          <button
            id="btn-brand-logo"
            onClick={() => onNavigate('home')}
            aria-label="Hidden Atlas Home"
            className="flex items-center text-left group focus:outline-none transition-transform active:scale-98 cursor-pointer min-w-0"
          >
            <HiddenAtlasLogo variant="horizontal" />
          </button>

          {/* Desktop Navigation Links with animated active indicator */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center p-1 rounded-full bg-white/45 border border-white/60 backdrop-blur-md shadow-xs relative">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onNavigate(item.id)}
                  className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer min-h-[44px] flex items-center justify-center z-10 ${
                    isActive
                      ? 'text-[#F8F5F0] font-bold'
                      : 'text-[#2E2118] hover:text-[#9C4A2F]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-full bg-[#9C4A2F] shadow-sm shadow-[#2E2118]/25 -z-10 animate-in fade-in zoom-in-95 duration-150" />
                  )}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Currency, Language, Saved, WhatsApp, Admin */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* Currency Switcher */}
            <div className="relative">
              <button
                id="btn-currency-selector"
                onClick={() => {
                  setCurrencyDropdownOpen(!currencyDropdownOpen);
                  setLangDropdownOpen(false);
                }}
                aria-label={`Select currency, current is ${currentCurrency}`}
                aria-expanded={currencyDropdownOpen}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-[#2E2118] bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/60 transition-all active:scale-95 shadow-2xs cursor-pointer min-h-[44px]"
              >
                <span>{currentCurrency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#C98B4B]" />
              </button>

              {currencyDropdownOpen && (
                <div
                  id="dropdown-currency"
                  className="absolute right-0 mt-2 w-28 bg-white/80 backdrop-blur-xl rounded-[16px] shadow-2xl border border-white/60 py-1.5 z-50 text-[#2E2118] animate-in fade-in zoom-in-95 duration-150"
                >
                  {currencies.map((curr) => (
                    <button
                      key={curr}
                      onClick={() => {
                        onCurrencyChange(curr);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-white/60 flex items-center justify-between transition-colors cursor-pointer min-h-[40px] ${
                        currentCurrency === curr ? 'text-[#9C4A2F] font-bold bg-[#C98B4B]/15' : 'text-[#2E2118]'
                      }`}
                    >
                      <span>{curr}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <div className="relative">
              <button
                id="btn-lang-selector"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setCurrencyDropdownOpen(false);
                }}
                aria-label={`Select language, current is ${currentLang}`}
                aria-expanded={langDropdownOpen}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-[#2E2118] bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/60 transition-all active:scale-95 shadow-2xs cursor-pointer min-h-[44px]"
              >
                <Globe className="w-3.5 h-3.5 text-[#9C4A2F]" />
                <span className="uppercase">{currentLang}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#C98B4B]" />
              </button>

              {langDropdownOpen && (
                <div
                  id="dropdown-language"
                  className="absolute right-0 mt-2 w-36 bg-white/80 backdrop-blur-xl rounded-[16px] shadow-2xl border border-white/60 py-1.5 z-50 text-[#2E2118] animate-in fade-in zoom-in-95 duration-150"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        onLanguageChange(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-semibold hover:bg-white/60 flex items-center gap-2 transition-colors cursor-pointer min-h-[40px] ${
                        currentLang === l.code ? 'text-[#9C4A2F] font-bold bg-[#C98B4B]/15' : 'text-[#2E2118]'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Saved / Wishlist Button */}
            <button
              id="btn-nav-wishlist"
              onClick={onOpenWishlist}
              aria-label={`${t.wishlist} (${wishlistCount} saved items)`}
              className="w-11 h-11 rounded-full relative flex items-center justify-center text-[#2E2118] hover:text-[#9C4A2F] bg-white/50 hover:bg-white/80 backdrop-blur-md border border-white/60 transition-all active:scale-95 shadow-2xs cursor-pointer"
              title={t.wishlist}
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#9C4A2F] text-[#9C4A2F]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#9C4A2F] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* WhatsApp Direct Guide Button (Sunrise Orange #E5733A) */}
            <a
              id="btn-nav-whatsapp"
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with your local Moroccan guide on WhatsApp"
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-white bg-[#E5733A] hover:bg-[#D0622B] active:scale-95 glow-sunrise hover:-translate-y-0.5 transition-all duration-200 shadow-md min-h-[44px]"
              title="Chat with your local guide on WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>{isAr ? 'واتساب' : 'WhatsApp'}</span>
            </a>

            {/* Discreet Admin Lock Button */}
            <button
              onClick={onOpenAdmin}
              aria-label="Guide Admin Portal"
              className="w-11 h-11 rounded-full flex items-center justify-center text-[#2E2118]/60 hover:text-[#2E2118] hover:bg-white/80 transition-all opacity-80 hover:opacity-100 cursor-pointer"
              title={isAr ? 'بوابة المرشد' : 'Guide Admin'}
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Menu & Quick Controls */}
          <div className="flex items-center gap-1.5 xs:gap-2 lg:hidden shrink-0">
            {/* Quick WhatsApp Action (Sunrise Orange #E5733A) - Hidden on ultra-compact <360px to preserve logo room; available via floating CTA & drawer */}
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Direct WhatsApp chat with local guide Hossain"
              className="hidden xs:flex w-11 h-11 rounded-full text-white bg-[#E5733A] hover:bg-[#D0622B] active:scale-95 transition-all items-center justify-center glow-sunrise shadow-md shrink-0"
              title="WhatsApp Local Guide"
            >
              <WhatsAppIcon className="w-5 h-5 text-white" />
            </a>

            {/* Quick Heart Action */}
            <button
              onClick={onOpenWishlist}
              aria-label={`View saved wishlist (${wishlistCount} items)`}
              className="w-11 h-11 rounded-full relative flex items-center justify-center bg-white/50 backdrop-blur-md text-[#2E2118] active:scale-95 transition-all border border-white/60 cursor-pointer shadow-2xs shrink-0"
            >
              <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#9C4A2F] text-[#9C4A2F]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#9C4A2F] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Animated Hamburger Button that morphs smoothly into X */}
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="w-11 h-11 rounded-full flex flex-col items-center justify-center bg-white/50 backdrop-blur-md text-[#2E2118] hover:bg-white/80 active:scale-95 transition-all border border-white/60 cursor-pointer shadow-2xs shrink-0 relative"
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center relative">
                <span
                  className={`w-5 h-0.5 bg-[#2E2118] rounded-full transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-[#2E2118] rounded-full transition-all duration-200 ease-in-out ${
                    mobileMenuOpen ? 'opacity-0 -translate-x-2' : 'opacity-100'
                  }`}
                />
                <span
                  className={`w-5 h-0.5 bg-[#2E2118] rounded-full transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Animated Full-Screen / Slide-in Mobile Menu with Staggered Links */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Frosted Backdrop: Tap outside to close */}
        <div
          className="absolute inset-0 bg-[#2E2118]/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-in Menu Panel with Safe Area Insets */}
        <div
          style={{
            paddingTop: 'max(1.25rem, env(safe-area-inset-top, 0px))',
            paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))'
          }}
          className={`absolute top-0 ${isAr ? 'left-0' : 'right-0'} w-full max-w-sm h-full bg-white/95 backdrop-blur-2xl text-[#2E2118] border-l border-white/50 shadow-2xl p-5 flex flex-col justify-between transition-transform duration-300 ease-out overflow-y-auto ${
            mobileMenuOpen
              ? 'translate-x-0'
              : (isAr ? '-translate-x-full' : 'translate-x-full')
          }`}
        >
          {/* Top Row: Logo & Close Hamburger */}
          <div className="flex items-center justify-between pb-4 border-b border-white/40">
            <HiddenAtlasLogo variant="horizontal" />
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="w-11 h-11 rounded-full bg-white/60 backdrop-blur-md text-[#2E2118] flex items-center justify-center border border-white/60 shadow-xs cursor-pointer active:scale-95"
            >
              <div className="w-5 h-4 flex flex-col justify-between items-center relative">
                <span className="w-5 h-0.5 bg-[#2E2118] rounded-full rotate-45 translate-y-[7px]" />
                <span className="w-5 h-0.5 bg-[#2E2118] rounded-full opacity-0" />
                <span className="w-5 h-0.5 bg-[#2E2118] rounded-full -rotate-45 -translate-y-[7px]" />
              </div>
            </button>
          </div>

          {/* Staggered Navigation Links */}
          <div className="py-6 flex flex-col space-y-2">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  style={{
                    transitionDelay: mobileMenuOpen ? `${index * 50}ms` : '0ms'
                  }}
                  className={`w-full text-left py-3.5 px-4 rounded-[14px] text-base font-bold transition-all duration-300 cursor-pointer min-h-[48px] flex items-center justify-between ${
                    isActive
                      ? 'bg-[#9C4A2F] text-[#F8F5F0] shadow-md shadow-[#9C4A2F]/20'
                      : 'text-[#2E2118] hover:bg-white'
                  } ${
                    mobileMenuOpen
                      ? 'translate-y-0 opacity-100'
                      : 'translate-y-4 opacity-0'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E5733A]" />
                  )}
                </button>
              );
            })}

            {/* Google Maps Shortcut in Mobile Drawer */}
            <a
              href="https://maps.app.goo.gl/Bg3scX2BXjBwc3ue6?g_st=iwb"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 px-4 rounded-[14px] text-sm font-bold text-[#9C4A2F] bg-white/60 backdrop-blur-md border border-white/60 hover:bg-white/80 transition-all min-h-[48px] flex items-center gap-2.5 mt-2"
            >
              <MapPin className="w-4 h-4 text-[#9C4A2F]" />
              <span>{t.findUsGoogleMaps || (isAr ? 'موقعنا على خرائط جوجل' : 'Find us on Google Maps')}</span>
            </a>
          </div>

          {/* Bottom Drawer Controls: Language, Currency, Admin */}
          <div className="pt-4 border-t border-white/40 space-y-4">
            <div className="flex items-center justify-between gap-2">
              {/* Language Selection */}
              <select
                value={currentLang}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                aria-label="Select language"
                className="flex-1 py-2.5 px-3 rounded-full border border-white/60 text-xs font-bold bg-white/60 backdrop-blur-md text-[#2E2118] shadow-2xs min-h-[44px]"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>

              {/* Currency Selection */}
              <select
                value={currentCurrency}
                onChange={(e) => onCurrencyChange(e.target.value as Currency)}
                aria-label="Select currency"
                className="w-24 py-2.5 px-3 rounded-full border border-white/60 text-xs font-bold bg-white/60 backdrop-blur-md text-[#2E2118] shadow-2xs min-h-[44px]"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct WhatsApp Callout in Mobile Drawer */}
            <a
              href={directWhatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-[12px] bg-[#E5733A] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md glow-sunrise active:scale-95 transition-all min-h-[44px]"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>{isAr ? 'مراسلة المرشد مباشرة على واتساب' : 'Chat Directly on WhatsApp'}</span>
            </a>

            {/* Discreet Admin Link */}
            <div className="text-center pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                aria-label="Guide Admin Portal"
                className="text-[11px] text-[#2E2118]/60 hover:text-[#9C4A2F] inline-flex items-center gap-1 cursor-pointer py-1"
              >
                <Lock className="w-3 h-3" />
                <span>{isAr ? 'بوابة المرشد' : 'Guide Portal'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
