export type ItemType = 'trip' | 'activity' | string;

export type Region = string;

export type ActivityCategory = 
  | 'mountain-trekking'
  | 'camel-riding' 
  | 'horseback' 
  | 'desert-tours' 
  | 'quad-buggy'
  | 'cultural-day-trips'
  | string;

export type Currency = 'MAD' | 'EUR' | 'USD' | 'GBP';

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  mealsIncluded?: string;
}

export interface Review {
  id: string;
  author: string;
  country: string;
  countryCode: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  avatar?: string;
  travelerType: 'Solo' | 'Couple' | 'Family' | 'Friends';
}

export interface AddonOption {
  id: string;
  name: string;
  description: string;
  priceMAD: number;
  priceUSD: number;
  priceEUR: number;
  priceGBP: number;
}

export interface GroupPricingTier {
  min: number;
  max?: number | null;
  pricePerPerson: number;
}

export interface ListingItem {
  id: string;
  type: ItemType;
  category?: ActivityCategory;
  title: string;
  arabicTitle?: string;
  tagline: string;
  region: Region;
  location: string;
  city: string;
  duration: string;
  groupSize?: string;
  difficulty?: 'Easy' | 'Moderate' | 'Challenging';
  rating: number;
  reviewsCount: number;
  priceMAD: number;
  priceUSD: number;
  priceEUR: number;
  priceGBP: number;
  originalPriceMAD?: number;
  groupPricing?: GroupPricingTier[];
  groupPricingCurrency?: Currency;
  featured?: boolean;
  bestseller?: boolean;
  promoBadge?: string;
  sortOrder?: number;
  imageUrl: string;
  gallery: string[];
  overview: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  hostName: string;
  hostRole: string;
  hostAvatar: string;
  hostLanguages: string[];
  itinerary?: ItineraryDay[];
  availableAddons: AddonOption[];
}

export interface Destination {
  id: string;
  name: string;
  arabicName: string;
  tagline: string;
  region: Region;
  imageUrl: string;
  experiencesCount: number;
  description: string;
  highlights: string[];
  bestSeason: string;
}

export interface Booking {
  bookingRef: string;
  item: ListingItem;
  startDate: string;
  endDate?: string;
  timeSlot?: string;
  guests: {
    adults: number;
    children: number;
  };
  selectedAddons: AddonOption[];
  guestInfo: {
    fullName: string;
    email: string;
    phone: string;
    country: string;
    specialRequests?: string;
  };
  totalPriceMAD: number;
  currency: Currency;
  paymentMethod: 'card' | 'apple_pay' | 'paypal' | 'pay_on_arrival';
  status: 'confirmed' | 'pending';
  createdAt: string;
}

export type LanguageCode = 'en' | 'fr' | 'es' | 'de' | 'ar' | 'it';

export interface ContactInquiry {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  subject?: string;
  message: string;
  status: 'unread' | 'contacted' | 'resolved';
  createdAt: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  whatsappDisplay: string;
  facebookUrl: string;
  instagramUrl: string;
  heroImageUrl: string;
  guideName: string;
  guideRole: string;
  guideBio: string;
  email: string;
  updatedAt?: string;
}

