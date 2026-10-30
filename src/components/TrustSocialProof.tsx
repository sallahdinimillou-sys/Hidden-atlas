import React from 'react';
import { Star, ShieldCheck, HeartHandshake, PhoneCall, Award, CheckCircle2, Lock } from 'lucide-react';
import { Review, LanguageCode } from '../types';
import { REVIEWS } from '../data/mockData';
import { TRANSLATIONS } from '../utils/translations';
import { getLocalizedReview } from '../data/localizedContent';

interface TrustSocialProofProps {
  currentLang: LanguageCode;
}

export const TrustSocialProof: React.FC<TrustSocialProofProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];

  const getPillarText = (key: 'license' | 'pay' | 'community' | 'support') => {
    const data = {
      license: {
        en: { title: 'Licensed Tourism Partner', desc: 'Officially certified under Moroccan Ministry of Tourism authorization #MR-88241 with certified local guides.' },
        fr: { title: 'Partenaire Touristique Agréé', desc: 'Agréé par le Ministère du Tourisme Marocain (Réf #MR-88241) avec guides locaux certifiés.' },
        es: { title: 'Operador Turístico Autorizado', desc: 'Certificado oficialmente por el Ministerio de Turismo de Marruecos (#MR-88241) con guías locales.' },
        de: { title: 'Lizenzierter Reisepartner', desc: 'Offiziell akkreditiert durch das Tourismusministerium Marokko (#MR-88241) mit zertifizierten Guides.' },
        it: { title: 'Partner Turistico Ufficiale', desc: 'Autorizzato dal Ministero del Turismo del Marocco (#MR-88241) con guide locali certificate.' },
        ar: { title: 'مرخص رسمياً بالمغرب', desc: 'مرخص رسمياً من وزارة السياحة المغربية (رخصة #MR-88241) مع مرشدين محليين معتمدين.' }
      },
      pay: {
        en: { title: 'Guest Checkout & Safe Pay', desc: 'Book with 256-bit SSL encrypted security. Zero mandatory account creation required.' },
        fr: { title: 'Réservation Directe & Sécurisée', desc: 'Paiement crypté SSL 256 bits sans création de compte obligatoire.' },
        es: { title: 'Reserva Directa y Pago Seguro', desc: 'Reserva protegida con encriptación SSL 256-bit sin necesidad de registrarse.' },
        de: { title: 'Sofortbuchung & Sichere Zahlung', desc: 'SSL-gesicherte 256-Bit-Verschlüsselung. Keine Registrierungspflicht.' },
        it: { title: 'Prenotazione Ospite & Pagamento Sicuro', desc: 'Prenota in sicurezza con crittografia SSL 256-bit senza obbligo di creare un account.' },
        ar: { title: 'حجز فوري ودفع آمن', desc: 'تشفير عالي الأمان 256-bit SSL، مع إمكانية الحجز المباشر دون الحاجة لإنشاء حساب.' }
      },
      community: {
        en: { title: '100% Local Community Impact', desc: 'Our experiences directly support local artisan cooperatives, native guides, and rural communities.' },
        fr: { title: 'Impact Communautaire Direct', desc: 'Nos séjours soutiennent directement les coopératives artisanales et les familles de l’Atlas.' },
        es: { title: 'Impacto Local Positivo', desc: 'Nuestras actividades apoyan directamente a cooperativas artesanales y familias locales.' },
        de: { title: '100% Lokaler Mehrwert', desc: 'Jede Buchung fördert lokale Handwerkskooperativen und Familien in Marokko.' },
        it: { title: 'Supporto Diretto alla Comunità', desc: 'Le nostre esperienze sostengono direttamente cooperative artigianali e famiglie del territorio.' },
        ar: { title: 'دعم مباشر للمجتمع المحلي', desc: 'تساهم رحلاتنا وأنشطتنا في دعم العائلات والتعاونيات الحرفية المحلية والقرى الأطلسية.' }
      },
      support: {
        en: { title: '24/7 Guest Concierge Support', desc: 'Direct WhatsApp and phone concierge to answer questions, customize tours, and coordinate your itinerary.' },
        fr: { title: 'Conciergerie & Assistance 24/7', desc: 'Support dédié WhatsApp et téléphone pour vos questions, transferts et conseils personnalisés.' },
        es: { title: 'Atención al Viajero 24/7', desc: 'Asistencia directa por WhatsApp y teléfono para resolver dudas y coordinar tus traslados.' },
        de: { title: '24/7 Gäste-Concierge Support', desc: 'Direkter WhatsApp- und Telefon-Service für Reiseberatung, Anpassungen und Transfers.' },
        it: { title: 'Supporto Concierge 24/7', desc: 'Assistenza diretta via WhatsApp e telefono per organizzare tour, trasferimenti e itinerari.' },
        ar: { title: 'خدمة وتواصل مستمر للمسافر', desc: 'فريق دعم ومرافقة متواجد دائماً عبر واتساب والهاتف للإجابة عن كل استفسار وتنسيق الحجوزات.' }
      }
    };
    return data[key][currentLang] || data[key].en;
  };

  const trustPillars = [
    {
      icon: <Award className="w-6 h-6 text-[#9C4A2F]" />,
      ...getPillarText('license')
    },
    {
      icon: <Lock className="w-6 h-6 text-[#9C4A2F]" />,
      ...getPillarText('pay')
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-[#9C4A2F]" />,
      ...getPillarText('community')
    },
    {
      icon: <PhoneCall className="w-6 h-6 text-[#9C4A2F]" />,
      ...getPillarText('support')
    }
  ];

  return (
    <section id="trust-section" className="py-16 sm:py-20 bg-transparent border-t border-white/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/50 backdrop-blur-md text-[#9C4A2F] text-xs font-bold uppercase tracking-wider mb-2 border border-white/60 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9C4A2F]" />
            <span>{currentLang === 'ar' ? 'ضمانات السفر والمغامرة بالمغرب' : currentLang === 'fr' ? 'Garanties Voyage Maroc' : 'Morocco Travel Guarantees'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2E2118] font-heading tracking-tight">
            {t.trustTitle}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#2E2118]/80">
            {t.trustSub}
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {trustPillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-[16px] glass-card transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              <div>
                <div className="w-12 h-12 rounded-[14px] bg-white/60 backdrop-blur-xs border border-white/70 flex items-center justify-center mb-4 text-[#9C4A2F] shadow-2xs">
                  {pillar.icon}
                </div>
                <h3 className="font-heading font-bold text-base text-[#2E2118] mb-2">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#2E2118]/80 leading-relaxed font-body">
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid (Rendered only if real reviews exist) */}
        {REVIEWS.length > 0 && (
          <div className="pt-10 border-t border-amber-900/10">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-heading font-extrabold text-xl text-[#1c130c]">
                {currentLang === 'ar' ? '4.98 / 5.0 تقييم المسافرين' : '4.98 / 5.0 Rating'}
              </span>
              <span className="text-xs text-stone-500 font-medium">
                {currentLang === 'ar'
                  ? '(استناداً إلى أكثر من 1,840 حجز وتقييم موثق)'
                  : '(Based on 1,840+ international traveler bookings)'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {currentLang === 'ar'
                  ? 'جميع التقييمات موثقة ومطابقة لأرقام الحجوزات الفعلية'
                  : 'All reviews independently verified via Booking Reference'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {REVIEWS.map((rev) => {
              const loc = getLocalizedReview(rev, currentLang);
              return (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-[#FDFBF7] border border-amber-900/10 flex flex-col justify-between hover:border-amber-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium font-mono">{rev.date}</span>
                    </div>

                    <h4 className="font-heading font-bold text-sm text-[#1c130c] mb-1.5 line-clamp-1">
                      {loc.title}
                    </h4>

                    <p className="text-xs text-stone-600 leading-relaxed line-clamp-4">
                      "{loc.comment}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-900/10 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-[#1c130c] block">
                        {rev.author}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {rev.country} • {loc.travelerType}
                      </span>
                    </div>
                    <span className="text-xs">
                      {rev.countryCode === 'GB' && '🇬🇧'}
                      {rev.countryCode === 'FR' && '🇫🇷'}
                      {rev.countryCode === 'DE' && '🇩🇪'}
                      {rev.countryCode === 'ES' && '🇪🇸'}
                      {rev.countryCode === 'IT' && '🇮🇹'}
                      {rev.countryCode === 'MA' && '🇲🇦'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        )}
      </div>
    </section>
  );
};
