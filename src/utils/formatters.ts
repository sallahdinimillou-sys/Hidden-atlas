import { Currency, ListingItem, LanguageCode } from '../types';
import { CURRENCY_RATES } from '../data/mockData';

export function formatPrice(priceMAD: number, currency: Currency): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.MAD;
  const converted = Math.round(priceMAD * info.rateFromMAD);
  
  if (currency === 'MAD') {
    return `${converted.toLocaleString()} MAD`;
  }
  if (currency === 'USD') {
    return `$${converted.toLocaleString()}`;
  }
  if (currency === 'EUR') {
    return `€${converted.toLocaleString()}`;
  }
  if (currency === 'GBP') {
    return `£${converted.toLocaleString()}`;
  }
  return `${converted} ${currency}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

/**
 * Sanitizes phone number to pure digits suitable for wa.me URL
 * Defaults to the single tour guide number: 212662634926
 */
export function sanitizeWhatsAppNumber(num?: string): string {
  if (!num) return '212662634926';
  const digits = num.replace(/\D/g, '');
  if (!digits) return '212662634926';
  if (digits.startsWith('06') || digits.startsWith('07')) {
    return `212${digits.slice(1)}`;
  }
  return digits;
}

export interface WhatsAppBookingParams {
  item?: ListingItem;
  activityTitle?: string;
  date?: string;
  peopleCount?: number | string;
  lang?: LanguageCode;
  whatsappNumber?: string;
  customDuration?: string;
  pricePerPerson?: string | number;
  totalPrice?: string | number;
  isCustomQuote?: boolean;
}

/**
 * Generates official wa.me booking link with pre-filled message containing:
 * - Activity Name
 * - Date
 * - Number of People
 * - Price per person and Total price (when group pricing is selected)
 * Target number: read from Firestore settings (default +212662634926 / 212662634926)
 */
export function getWhatsAppBookingUrl(
  itemOrParams: ListingItem | WhatsAppBookingParams,
  legacyLang: LanguageCode = 'en',
  legacyTitle?: string,
  legacyDuration?: string,
  legacyDate?: string,
  legacyPeople?: number | string,
  legacyNumber?: string,
  legacyPricePerPerson?: string | number,
  legacyTotalPrice?: string | number
): string {
  let title = '';
  let duration = '';
  let date = '';
  let people = '2';
  let lang: LanguageCode = 'en';
  let phone = '212662634926';
  let pricePerPerson: string | number | undefined = undefined;
  let totalPrice: string | number | undefined = undefined;
  let isCustomQuote = false;

  if ('title' in itemOrParams && typeof itemOrParams.title === 'string' && !('activityTitle' in itemOrParams)) {
    // Legacy positional arguments
    const item = itemOrParams as ListingItem;
    title = legacyTitle || item.title;
    duration = legacyDuration || item.duration;
    lang = legacyLang;
    date = legacyDate || '';
    people = legacyPeople ? String(legacyPeople) : '2';
    phone = sanitizeWhatsAppNumber(legacyNumber);
    pricePerPerson = legacyPricePerPerson;
    totalPrice = legacyTotalPrice;
  } else {
    // Modern options object
    const p = itemOrParams as WhatsAppBookingParams;
    title = p.activityTitle || p.item?.title || 'Toubkal Trekking';
    duration = p.customDuration || p.item?.duration || '';
    lang = p.lang || 'en';
    date = p.date || '';
    people = p.peopleCount !== undefined ? String(p.peopleCount) : '2';
    phone = sanitizeWhatsAppNumber(p.whatsappNumber);
    pricePerPerson = p.pricePerPerson;
    totalPrice = p.totalPrice;
    isCustomQuote = Boolean(p.isCustomQuote);
  }

  // Fallback date to upcoming tomorrow/next day if empty
  if (!date) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 2);
    date = nextDate.toISOString().split('T')[0];
  }

  const priceDetailsEn = pricePerPerson && totalPrice 
    ? `💵 Price per Person: ${pricePerPerson}\n💰 Total Price: ${totalPrice}\n` 
    : '';
  const priceDetailsFr = pricePerPerson && totalPrice 
    ? `💵 Prix par personne : ${pricePerPerson}\n💰 Prix total : ${totalPrice}\n` 
    : '';
  const priceDetailsAr = pricePerPerson && totalPrice 
    ? `💵 السعر للشخص: ${pricePerPerson}\n💰 السعر الإجمالي: ${totalPrice}\n` 
    : '';
  const priceDetailsEs = pricePerPerson && totalPrice 
    ? `💵 Precio por persona: ${pricePerPerson}\n💰 Precio total: ${totalPrice}\n` 
    : '';
  const priceDetailsDe = pricePerPerson && totalPrice 
    ? `💵 Preis pro Person: ${pricePerPerson}\n💰 Gesamtpreis: ${totalPrice}\n` 
    : '';
  const priceDetailsIt = pricePerPerson && totalPrice 
    ? `💵 Prezzo a persona: ${pricePerPerson}\n💰 Prezzo totale: ${totalPrice}\n` 
    : '';

  let message = '';
  if (isCustomQuote) {
    if (lang === 'ar') {
      message = `السلام عليكم أخي حسين (Hidden Atlas)،\nأود الاستفسار عن حجز النشاط التالي لمجموعتنا:\n🏔️ النشاط: ${title}\n📅 التاريخ المفضل: ${date}\n👥 عدد الأشخاص: ${people}\n${duration ? `⏳ المدة: ${duration}\n` : ''}يرجى تزويدنا بعرض سعر مخصص لمجموعتنا وتأكيد التوفر. شكراً لك!`;
    } else if (lang === 'fr') {
      message = `Bonjour Hossain (Hidden Atlas),\nJe souhaite obtenir un devis personnalisé pour notre groupe :\n🏔️ Activité : ${title}\n📅 Date souhaitée : ${date}\n👥 Nombre de personnes : ${people}\n${duration ? `⏳ Durée : ${duration}\n` : ''}Pourriez-vous me proposer un tarif adapté et me confirmer la disponibilité ? Merci !`;
    } else if (lang === 'es') {
      message = `¡Hola Hossain (Hidden Atlas)!\nMe gustaría solicitar una cotización personalizada para nuestro grupo:\n🏔️ Actividad: ${title}\n📅 Fecha deseada: ${date}\n👥 Número de personas: ${people}\n${duration ? `⏳ Duración: ${duration}\n` : ''}¿Podrías enviarnos un presupuesto personalizado y confirmar disponibilidad? ¡Gracias!`;
    } else if (lang === 'de') {
      message = `Hallo Hossain (Hidden Atlas)!\nIch möchte ein individuelles Angebot für unsere Gruppe anfragen:\n🏔️ Aktivität: ${title}\n📅 Wunschdatum: ${date}\n👥 Personenanzahl: ${people}\n${duration ? `⏳ Dauer: ${duration}\n` : ''}Könntest du uns bitte ein individuelles Angebot zukommen lassen und die Verfügbarkeit prüfen? Vielen Dank!`;
    } else if (lang === 'it') {
      message = `Ciao Hossain (Hidden Atlas)!\nVorrei richiedere un preventivo personalizzato per il nostro gruppo:\n🏔️ Attività: ${title}\n📅 Data desiderata: ${date}\n👥 Numero di persone: ${people}\n${duration ? `⏳ Durata: ${duration}\n` : ''}Potresti fornirci un preventivo personalizzato e confermare la disponibilità? Grazie!`;
    } else {
      message = `Hello Hossain (Hidden Atlas),\nI would like to inquire about booking the following activity for our group:\n🏔️ Activity: ${title}\n📅 Preferred Date: ${date}\n👥 Number of People: ${people}\n${duration ? `⏳ Duration: ${duration}\n` : ''}Could you please provide a custom quote for our group and confirm your availability? Thank you!`;
    }
  } else {
    if (lang === 'ar') {
      message = `السلام عليكم أخي حسين (Hidden Atlas)،\nأود الاستفسار وحجز النشاط التالي معك:\n🏔️ النشاط: ${title}\n📅 التاريخ المفضل: ${date}\n👥 عدد الأشخاص: ${people}\n${priceDetailsAr}${duration ? `⏳ المدة: ${duration}\n` : ''}يرجى تأكيد التوفر والتفاصيل. شكراً لك!`;
    } else if (lang === 'fr') {
      message = `Bonjour Hossain (Hidden Atlas),\nJe souhaite réserver l'activité suivante avec vous :\n🏔️ Activité : ${title}\n📅 Date souhaitée : ${date}\n👥 Nombre de personnes : ${people}\n${priceDetailsFr}${duration ? `⏳ Durée : ${duration}\n` : ''}Merci de me confirmer la disponibilité.`;
    } else if (lang === 'es') {
      message = `¡Hola Hossain (Hidden Atlas)!\nMe gustaría reservar la siguiente actividad contigo:\n🏔️ Actividad: ${title}\n📅 Fecha deseada: ${date}\n👥 Número de personas: ${people}\n${priceDetailsEs}${duration ? `⏳ Duración: ${duration}\n` : ''}Por favor confirme disponibilidad. ¡Gracias!`;
    } else if (lang === 'de') {
      message = `Hallo Hossain (Hidden Atlas)!\nIch möchte folgende geführte Tour bei dir buchen:\n🏔️ Aktivität: ${title}\n📅 Wunschdatum: ${date}\n👥 Personenanzahl: ${people}\n${priceDetailsDe}${duration ? `⏳ Dauer: ${duration}\n` : ''}Bitte bestätige die Verfügbarkeit. Vielen Dank!`;
    } else if (lang === 'it') {
      message = `Ciao Hossain (Hidden Atlas)!\nVorrei prenotare la seguente attività guidata:\n🏔️ Attività: ${title}\n📅 Data desiderata: ${date}\n👥 Numero di persone: ${people}\n${priceDetailsIt}${duration ? `⏳ Durata: ${duration}\n` : ''}Grazie per confermare la disponibilità!`;
    } else {
      message = `Hello Hossain (Hidden Atlas),\nI would like to book the following activity with you:\n🏔️ Activity: ${title}\n📅 Preferred Date: ${date}\n👥 Number of People: ${people}\n${priceDetailsEn}${duration ? `⏳ Duration: ${duration}\n` : ''}Please let me know your availability and details. Thank you!`;
    }
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a direct general contact WhatsApp link
 */
export function getWhatsAppContactUrl(
  whatsappNumber?: string,
  customNote?: string,
  lang: LanguageCode = 'en'
): string {
  const phone = sanitizeWhatsAppNumber(whatsappNumber);
  let defaultGreeting = '';

  if (lang === 'ar') {
    defaultGreeting = 'السلام عليكم أخي حسين (Hidden Atlas)، أود الاستفسار عن رحلات جبل توبقال وجبال الأطلس والصحراء.';
  } else if (lang === 'fr') {
    defaultGreeting = 'Bonjour Hossain (Hidden Atlas), je souhaite avoir des informations sur vos randonnées au Toubkal et circuits au Maroc.';
  } else {
    defaultGreeting = 'Hello Hossain (Hidden Atlas), I would like to inquire about Mount Toubkal treks and guided tours in Morocco.';
  }

  const text = customNote ? encodeURIComponent(customNote) : encodeURIComponent(defaultGreeting);
  return `https://wa.me/${phone}?text=${text}`;
}
