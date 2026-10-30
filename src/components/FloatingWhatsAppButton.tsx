import React, { useState } from 'react';
import { WhatsAppIcon } from './Navbar';
import { LanguageCode } from '../types';
import { getWhatsAppContactUrl } from '../utils/formatters';

interface FloatingWhatsAppButtonProps {
  currentLang: LanguageCode;
  whatsappNumber?: string;
  isHidden?: boolean;
}

export const FloatingWhatsAppButton: React.FC<FloatingWhatsAppButtonProps> = ({
  currentLang,
  whatsappNumber = '+212662634926',
  isHidden = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isAr = currentLang === 'ar';

  const welcomeMessage = isAr
    ? 'السلام عليكم أخي حسين (Hidden Atlas)، أود الاستفسار عن رحلات توبقال وجبال الأطلس.'
    : 'Hello Hossain (Hidden Atlas), I would like to inquire about Mount Toubkal treks and Atlas guiding.';

  const whatsappUrl = getWhatsAppContactUrl(whatsappNumber, welcomeMessage, currentLang);

  if (isHidden) return null;

  return (
    <aside
      aria-label={isAr ? 'تواصل فوري على واتساب' : 'Instant WhatsApp Contact'}
      className={`fixed ${
        isAr ? 'left-3.5 sm:left-6' : 'right-3.5 sm:right-6'
      } bottom-4 sm:bottom-6 z-30 flex items-center gap-2 pb-[env(safe-area-inset-bottom,0px)] pointer-events-auto transition-all duration-300`}
    >
      {/* Tooltip / Label */}
      <span
        className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-full bg-[#2E2118]/90 text-[#F8F5F0] text-xs font-semibold backdrop-blur-md border border-[#C98B4B]/40 shadow-lg transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-85'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] mr-1.5 animate-pulse" />
        {isAr ? 'محادثة مباشرة مع حسين أمالو' : 'Chat with Guide Hossain'}
      </span>

      {/* Main Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={isAr ? 'تواصل عبر واتساب مع المرشد حسين' : 'Chat on WhatsApp with Hossain Amalo'}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(37,211,102,0.4)] hover:shadow-[0_12px_28px_rgba(37,211,102,0.55)] transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white focus:outline-none focus:ring-4 focus:ring-[#25D366]/40 cursor-pointer"
        title="WhatsApp Hossain Amalo"
      >
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-sm" />
      </a>
    </aside>
  );
};
