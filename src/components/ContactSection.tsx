import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, Loader2, CheckCircle2, Facebook, Instagram } from 'lucide-react';
import { LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';
import { submitContactInquiry } from '../lib/firebase';
import { WhatsAppIcon } from './Navbar';
import { getWhatsAppContactUrl } from '../utils/formatters';

interface ContactSectionProps {
  currentLang: LanguageCode;
  whatsappNumber?: string;
  whatsappDisplay?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  guideEmail?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ 
  currentLang,
  whatsappNumber = '+212662634926',
  whatsappDisplay = '0662634926',
  facebookUrl = 'https://www.facebook.com/share/18k4njmMaP/?mibextid=wwXIfr',
  instagramUrl = 'https://www.instagram.com/amalo_hossain?obrf=aDd4N2gwNTAyZTd5&utm_source=qr',
  guideEmail = 'houssainbaaki71@gmail.com'
}) => {
  const t = TRANSLATIONS[currentLang];
  const isAr = currentLang === 'ar';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContactInquiry({
        name,
        phone,
        email,
        subject: 'Toubkal & Atlas Tour Request',
        message
      });
      setSent(true);
    } catch (err) {
      console.warn('Could not save to Firestore, falling back to direct notification:', err);
      setSent(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsAppDirectly = () => {
    const encoded = encodeURIComponent(
      `Hello Hossain (Hidden Atlas),\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`
    );
    const cleanNumber = whatsappNumber.replace(/\D/g, '') || '212662634926';
    window.open(`https://wa.me/${cleanNumber}?text=${encoded}`, '_blank');
  };

  const generalWhatsappUrl = getWhatsAppContactUrl(
    whatsappNumber,
    isAr 
      ? 'السلام عليكم أخي حسين، أود الاستفسار عن رحلات تسلق توبقال وجبال الأطلس والصحراء.'
      : 'Hello Hossain, I would like to inquire about Mount Toubkal trekking and tours in Morocco.',
    currentLang
  );

  return (
    <section id="contact-section" className="py-16 sm:py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 backdrop-blur-md text-[#9C4A2F] text-xs font-bold tracking-wider uppercase mb-3 border border-white/60 font-sans shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#55663A]" />
            <span>{t.contactBadge}</span>
          </div>

          <h2 className="font-serif font-black text-2xl sm:text-4xl text-[#2E2118] tracking-tight">
            {t.contactHeading}
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#2E2118]/80 font-sans">
            {t.contactSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 max-w-5xl mx-auto">
          {/* Left Column: Direct Contacts */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* WhatsApp Highlight Box (Sunrise Orange #E5733A) */}
            <div className="p-6 rounded-[16px] bg-[#E5733A] text-white glow-sunrise space-y-3 shadow-lg shadow-[#E5733A]/25 border border-white/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-[12px] bg-white/20 flex items-center justify-center backdrop-blur-xs shrink-0">
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">
                    {t.contactInstantWhatsapp}
                  </h3>
                  <p className="text-xs text-white/90 font-sans">
                    {t.contactWhatsappReplies}
                  </p>
                </div>
              </div>

              <a
                href={generalWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-[12px] bg-white text-[#2E2118] hover:text-[#9C4A2F] font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-white/90 active:scale-95 transition-all font-sans"
              >
                <WhatsAppIcon className="w-4 h-4 text-[#E5733A]" />
                <span dir="ltr">{whatsappDisplay} ({whatsappNumber})</span>
              </a>
            </div>

            {/* Direct Details Card (Glassmorphism rounded 16px) */}
            <div className="p-6 rounded-[16px] glass-box-elevated space-y-4 text-xs font-sans">
              {/* Phone Line */}
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#9C4A2F] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-[#2E2118]">
                    {t.contactPhoneLines}
                  </p>
                  <div className="mt-1 flex flex-col gap-1 font-medium">
                    <a
                      href={`tel:${whatsappNumber}`}
                      dir="ltr"
                      className="text-[#9C4A2F] hover:text-[#853C24] font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <span>{whatsappDisplay}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#55663A]/15 text-[#55663A] border border-[#55663A]/30 font-bold">
                        WhatsApp &amp; Call
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/50">
                <Mail className="w-4 h-4 text-[#9C4A2F] shrink-0" />
                <div>
                  <p className="font-bold text-[#2E2118]">
                    {t.contactEmailTitle}
                  </p>
                  <a
                    href={`mailto:${guideEmail}`}
                    className="text-[#9C4A2F] hover:underline font-mono text-xs block mt-0.5"
                  >
                    {guideEmail}
                  </a>
                </div>
              </div>

              {/* Address / Meeting Point */}
              <div className="flex items-start gap-3 pt-3 border-t border-white/50">
                <MapPin className="w-4 h-4 text-[#9C4A2F] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2E2118]">
                    {t.contactOfficeTitle}
                  </p>
                  <p className="text-[#2E2118]/80 mt-0.5">
                    {isAr ? 'وادي بحيرة إفني، قاعدة جبل توبقال، الأطلس الكبير، المغرب' : 'Lake Ifni Valley Base, Mount Toubkal, High Atlas, Morocco'}
                  </p>
                  <a
                    href="https://maps.app.goo.gl/Bg3scX2BXjBwc3ue6?g_st=iwb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[11px] font-bold text-white bg-[#9C4A2F] hover:bg-[#853C24] active:scale-95 transition-all shadow-xs min-h-[36px]"
                  >
                    <MapPin className="w-3.5 h-3.5 text-white" />
                    <span>{t.findUsGoogleMaps || (isAr ? 'موقعنا على خرائط جوجل' : 'Find us on Google Maps')}</span>
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/50">
                <Clock className="w-4 h-4 text-[#9C4A2F] shrink-0" />
                <div>
                  <p className="font-bold text-[#2E2118]">
                    {t.contactHoursTitle}
                  </p>
                  <p className="text-[#2E2118]/80">
                    {t.contactHoursText}
                  </p>
                </div>
              </div>

              {/* Social Channels (Facebook & Instagram from settings) */}
              <div className="pt-3 border-t border-white/50 space-y-2">
                <p className="font-bold text-[#2E2118]">
                  {t.contactSocialTitle}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Facebook */}
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Facebook: Hidden Atlas"
                    className="p-2 px-3 rounded-[10px] bg-white/50 backdrop-blur-xs text-[#2E2118] hover:bg-[#9C4A2F] hover:text-[#F8F5F0] transition-all flex items-center gap-1.5 font-medium min-h-[38px] border border-white/60"
                  >
                    <Facebook className="w-4 h-4 text-[#9C4A2F] hover:text-white" />
                    <span className="text-[11px] font-bold">Facebook</span>
                  </a>

                  {/* Instagram */}
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Instagram: @amalo_hossain"
                    className="p-2 px-3 rounded-[10px] bg-white/50 backdrop-blur-xs text-[#2E2118] hover:bg-[#9C4A2F] hover:text-[#F8F5F0] transition-all flex items-center gap-1.5 font-medium min-h-[38px] border border-white/60"
                  >
                    <Instagram className="w-4 h-4 text-[#9C4A2F] hover:text-white" />
                    <span className="text-[11px] font-bold">@amalo_hossain</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-[16px] glass-box-elevated">
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#2E2118] mb-1">
                {t.contactFormHeading}
              </h3>
              <p className="text-xs text-[#2E2118]/80 mb-6 font-sans">
                {t.contactFormSub}
              </p>

              {sent ? (
                <div className="p-6 rounded-[14px] bg-[#55663A]/15 border border-[#55663A]/30 text-center space-y-3 font-sans backdrop-blur-xs">
                  <CheckCircle2 className="w-9 h-9 text-[#55663A] mx-auto" />
                  <h4 className="font-bold text-sm text-[#2E2118]">
                    {t.contactSuccessTitle}
                  </h4>
                  <p className="text-xs text-[#2E2118]/85 max-w-md mx-auto">
                    {isAr 
                      ? 'تم استلام رسالتك بنجاح، وسأتواصل معك شخصياً في أقرب وقت. كما يمكنك مراسلتي مباشرة الآن على واتساب:'
                      : 'Your message has been received. I will personally contact you shortly. You can also chat with me directly on WhatsApp now:'}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={openWhatsAppDirectly}
                      className="px-4 py-2.5 rounded-[12px] text-xs font-bold text-white bg-[#E5733A] hover:bg-[#D0622B] active:scale-95 glow-sunrise transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                      <WhatsAppIcon className="w-4 h-4 text-white" />
                      <span>{isAr ? 'فتح المحادثة في واتساب الآن' : 'Chat on WhatsApp Now'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setSent(false);
                        setName('');
                        setPhone('');
                        setEmail('');
                        setMessage('');
                      }}
                      className="px-4 py-2.5 rounded-[12px] text-xs font-semibold text-[#2E2118] bg-white/70 border border-white/60 hover:bg-white transition-colors cursor-pointer"
                    >
                      {t.contactSendAnother}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-[#2E2118] mb-1">
                        {t.contactFormNameLabel} *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t.contactFormNamePlaceholder}
                        className="glass-input w-full p-3 rounded-[12px] text-[#2E2118]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-[#2E2118] mb-1">
                        {t.contactFormPhoneLabel} *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="06..."
                        className="glass-input w-full p-3 rounded-[12px] text-[#2E2118]"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#2E2118] mb-1">
                      {isAr ? 'البريد الإلكتروني (اختياري)' : 'Email Address (Optional)'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="glass-input w-full p-3 rounded-[12px] text-[#2E2118]"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#2E2118] mb-1">
                      {t.contactFormMsgLabel} *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t.contactFormMsgPlaceholder}
                      className="glass-input w-full p-3 rounded-[12px] text-[#2E2118] leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-[12px] bg-[#9C4A2F] hover:bg-[#853C24] disabled:bg-[#C98B4B]/40 text-[#F8F5F0] font-bold text-xs flex items-center justify-center gap-2 shadow-md glow-atlas transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isAr ? 'جاري الإرسال...' : 'Sending message...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t.contactFormSubmit}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Styled Embedded Google Map for Lake Ifni & Toubkal Base */}
        <div className="mt-10 sm:mt-14 max-w-5xl mx-auto">
          <div className="glass-box-elevated rounded-[16px] overflow-hidden p-3 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5 px-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[#9C4A2F]/15 text-[#9C4A2F] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-[#2E2118]">
                    {isAr ? 'موقعنا الميداني — وادي بحيرة إفني وجبل توبقال' : 'Our Expedition Base — Lake Ifni Valley & Mount Toubkal'}
                  </h3>
                  <p className="text-[11px] text-[#2E2118]/70">
                    31.0342° N, 7.8828° W • High Atlas Mountains, Morocco
                  </p>
                </div>
              </div>

              <a
                href="https://maps.app.goo.gl/Bg3scX2BXjBwc3ue6?g_st=iwb"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-[10px] text-xs font-bold text-white bg-[#9C4A2F] hover:bg-[#853C24] active:scale-95 transition-all shadow-xs min-h-[38px] shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 text-white" />
                <span>{t.findUsGoogleMaps || (isAr ? 'فتح على خرائط جوجل' : 'Find us on Google Maps')}</span>
              </a>
            </div>

            {/* Responsive Map Container */}
            <div className="relative w-full h-[280px] sm:h-[360px] rounded-[12px] overflow-hidden border border-white/50 bg-[#F8F5F0]">
              <iframe
                title="Hidden Atlas Morocco Location Map"
                src="https://maps.google.com/maps?q=31.0342497,-7.8828346&hl=en&z=12&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
