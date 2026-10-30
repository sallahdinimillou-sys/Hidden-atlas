import { GroupPricingTier, Currency, LanguageCode } from '../types';

export function getCurrencySymbol(currency?: string): string {
  switch (currency) {
    case 'MAD':
      return 'MAD';
    case 'USD':
      return '$';
    case 'GBP':
      return '£';
    case 'EUR':
    default:
      return '€';
  }
}

/**
 * Format group participant range with correct grammatical spelling.
 * Examples: "2 people", "3 to 6 people", "7 to 13 people", "14+ people"
 */
export function formatGroupPricingRange(tier: GroupPricingTier, lang: LanguageCode = 'en'): string {
  const min = Math.max(1, Math.round(Number(tier.min) || 1));
  const hasMax = tier.max !== undefined && tier.max !== null && (tier.max as unknown) !== '' && !isNaN(Number(tier.max));
  const max = hasMax ? Math.round(Number(tier.max)) : null;

  if (lang === 'ar') {
    if (max !== null && max === min) {
      if (min === 1) return 'شخص واحد';
      if (min === 2) return 'شخصان';
      return `${min} أشخاص`;
    }
    if (max !== null && max > min) {
      return `من ${min} إلى ${max} أشخاص`;
    }
    return `${min}+ شخص`;
  }

  if (lang === 'fr') {
    if (max !== null && max === min) {
      return min === 1 ? '1 personne' : `${min} personnes`;
    }
    if (max !== null && max > min) {
      return `${min} à ${max} personnes`;
    }
    return `${min}+ personnes`;
  }

  if (lang === 'es') {
    if (max !== null && max === min) {
      return min === 1 ? '1 persona' : `${min} personas`;
    }
    if (max !== null && max > min) {
      return `${min} a ${max} personas`;
    }
    return `${min}+ personas`;
  }

  if (lang === 'de') {
    if (max !== null && max === min) {
      return min === 1 ? '1 Person' : `${min} Personen`;
    }
    if (max !== null && max > min) {
      return `${min} bis ${max} Personen`;
    }
    return `${min}+ Personen`;
  }

  if (lang === 'it') {
    if (max !== null && max === min) {
      return min === 1 ? '1 persona' : `${min} persone`;
    }
    if (max !== null && max > min) {
      return `Da ${min} a ${max} persone`;
    }
    return `${min}+ persone`;
  }

  // English default
  if (max !== null && max === min) {
    return min === 1 ? '1 person' : `${min} people`;
  }
  if (max !== null && max > min) {
    return `${min} to ${max} people`;
  }
  return `${min}+ people`;
}

/**
 * Format price per person like "142 € / per person"
 */
export function formatGroupPricingPrice(
  price: number,
  currency: Currency = 'EUR',
  lang: LanguageCode = 'en'
): string {
  const symbol = getCurrencySymbol(currency);
  
  let suffix = 'per person';
  if (lang === 'fr') suffix = 'par personne';
  else if (lang === 'ar') suffix = 'للشخص';
  else if (lang === 'es') suffix = 'por persona';
  else if (lang === 'de') suffix = 'pro Person';
  else if (lang === 'it') suffix = 'a persona';

  return `${price} ${symbol} / ${suffix}`;
}

/**
 * Find matching tier for a given participant count
 */
export function findMatchingTier(
  tiers: GroupPricingTier[] | undefined,
  participants: number
): GroupPricingTier | undefined {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) return undefined;
  
  const sorted = [...tiers].sort((a, b) => (Number(a.min) || 1) - (Number(b.min) || 1));

  return sorted.find((tier) => {
    const min = Number(tier.min) || 1;
    const hasMax = tier.max !== undefined && tier.max !== null && (tier.max as unknown) !== '' && !isNaN(Number(tier.max));
    if (hasMax) {
      const max = Number(tier.max);
      return participants >= min && participants <= max;
    }
    return participants >= min;
  });
}

/**
 * Get lowest price per person across all tiers
 */
export function getLowestTierPrice(tiers: GroupPricingTier[] | undefined): number | null {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) return null;
  const validPrices = tiers
    .map((t) => Number(t.pricePerPerson))
    .filter((p) => !isNaN(p) && p > 0);
  if (validPrices.length === 0) return null;
  return Math.min(...validPrices);
}

/**
 * Validate tiers for overlapping ranges, min <= max, price > 0
 */
export function validateGroupPricingTiers(tiers: GroupPricingTier[]): { isValid: boolean; error?: string } {
  if (!tiers || tiers.length === 0) {
    return { isValid: true };
  }

  for (let i = 0; i < tiers.length; i++) {
    const tier = tiers[i];
    const min = Number(tier.min);
    const hasMax = tier.max !== undefined && tier.max !== null && (tier.max as unknown) !== '' && !isNaN(Number(tier.max));
    const max = hasMax ? Number(tier.max) : null;
    const price = Number(tier.pricePerPerson);

    if (isNaN(min) || min < 1) {
      return { isValid: false, error: `الفئة ${i + 1}: يجب أن يكون الحد الأدنى للمشاركين 1 أو أكثر.` };
    }
    if (max !== null && (isNaN(max) || max < min)) {
      return { isValid: false, error: `الفئة ${i + 1}: الحد الأقصى (${max}) يجب أن يكون أكبر من أو يساوي الحد الأدنى (${min}).` };
    }
    if (isNaN(price) || price <= 0) {
      return { isValid: false, error: `الفئة ${i + 1}: يرجى تحديد سعر صالح للشخص أكبر من 0.` };
    }
  }

  // Check for overlapping ranges
  const sorted = [...tiers].sort((a, b) => Number(a.min) - Number(b.min));

  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    const next = sorted[i + 1];
    const currMin = Number(curr.min);
    const currHasMax = curr.max !== undefined && curr.max !== null && (curr.max as unknown) !== '' && !isNaN(Number(curr.max));
    const currMax = currHasMax ? Number(curr.max) : null;
    const nextMin = Number(next.min);

    if (currMax === null) {
      return {
        isValid: false,
        error: `تداخل: الفئة (${currMin}+ شخص) مفتوحة بدون حد أقصى وتتداخل مع الفئة التالية التي تبدأ من ${nextMin}.`
      };
    }

    if (currMax >= nextMin) {
      return {
        isValid: false,
        error: `تداخل في أعداد المشاركين بين النطاقين [${currMin} - ${currMax}] و [${nextMin} - ${next.max ? next.max : '+'}]. يرجى التأكد من عدم تداخل الفئات.`
      };
    }
  }

  return { isValid: true };
}
