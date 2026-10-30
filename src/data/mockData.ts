import { ListingItem, Destination, Review } from '../types';

export const DESTINATIONS: Destination[] = [
  {
    id: 'taghazout',
    name: 'Taghazout Bay & Surf Coast',
    arabicName: 'خليج تغازوت وعاصمة ركوب الأمواج',
    tagline: 'World-renowned point breaks, ocean yoga & vibrant coastal culture',
    region: 'taghazout',
    imageUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1200&q=80',
    experiencesCount: 16,
    description: 'Morocco’s legendary Atlantic surfing capital just 20 minutes north of Agadir. Renowned for world-class breaks like Anchor Point and Killer Point, oceanfront yoga shalas, laid-back cafes, and golden sandy beaches.',
    highlights: ['World-Class Anchor Point Waves', 'Oceanfront Yoga & Surf Camps', 'Fresh Atlantic Grilled Seafood', 'Sunset Beachfront Cafes & Promenade'],
    bestSeason: 'Year-round (Surf peak: September – April)'
  },
  {
    id: 'paradise-valley',
    name: 'Paradise Valley & Imouzzer',
    arabicName: 'وادي الجنة وإيموزار إداوتنان',
    tagline: 'Lush palm gorges, emerald rock pools & the historic Honey Route',
    region: 'paradise-valley',
    imageUrl: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=1200&q=80',
    experiencesCount: 12,
    description: 'A breathtaking oasis tucked into the High Atlas foothills above Agadir. Hike along crystal-clear riverbeds, swim in natural turquoise limestone pools, leap from sun-warmed cliffs, and sample wild thyme honey in Imouzzer Ida Outanane.',
    highlights: ['Natural Emerald Rock Pools', 'Palm Canyon Cliff Hikes', 'Imouzzer Mountain Honey Tasting', 'River Oasis Tagine Picnics'],
    bestSeason: 'Year-round (Best water levels: October – June)'
  },
  {
    id: 'agadir-beach',
    name: 'Agadir Beach & Marina',
    arabicName: 'شاطئ ومارينا أكادير',
    tagline: 'Sun-drenched crescent bay, luxury marina & historic Kasbah views',
    region: 'agadir-beach',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    experiencesCount: 18,
    description: 'Morocco’s premier seaside resort boasting 300+ days of sunshine a year. Features a 10km palm-lined beach promenade, state-of-the-art marina yacht charters, sunset camel rides at the Souss estuary, and panoramic sunsets from Kasbah Agadir Oufella.',
    highlights: ['10km Golden Sand Crescent Beach', 'Agadir Oufella Hilltop Fortress Views', 'Agadir Marina Catamaran Cruises', 'Sunset Flamingo Beach Rides'],
    bestSeason: 'Year-round (Over 300 days of sunshine)'
  },
  {
    id: 'souss-valley',
    name: 'Souss Valley & Argan Biosphere',
    arabicName: 'سهل سوس ومحمية الأركان',
    tagline: 'UNESCO Argan biosphere, sunrise balloon flights & Berber villages',
    region: 'souss-valley',
    imageUrl: 'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=1200&q=80',
    experiencesCount: 14,
    description: 'The ancient fertile basin stretching east of Agadir towards the Anti-Atlas. Home to the endemic Argan forest (a UNESCO Biosphere Reserve), sunrise hot air balloon adventures, traditional organic argan cooperatives, and Berber earthen villages.',
    highlights: ['Sunrise Hot Air Balloon Over Souss', 'Endemic UNESCO Argan Forests', 'Authentic Women’s Argan Oil Cooperatives', 'Berber Countryside Quad Safaris'],
    bestSeason: 'September – May'
  },
  {
    id: 'tifnit-massa',
    name: 'Tifnit & Souss-Massa Park',
    arabicName: 'تيفنيت ومنتزه سوس ماسة الطبيعي',
    tagline: 'Wild Atlantic cliffs, troglodyte caves & rare Bald Ibis sanctuary',
    region: 'tifnit-massa',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    experiencesCount: 9,
    description: 'Located 40km south of Agadir, this wild coastal expanse combines the dramatic troglodyte fisherman cliff-dwellings of Tifnit with the protected wetlands of Souss-Massa National Park, sanctuary to pink flamingos and the endangered Northern Bald Ibis.',
    highlights: ['Tifnit Cliffside Fisherman Caves', 'Souss-Massa National Park Birdwatching', 'Pristine Untamed Ocean Beaches', 'Atlantic Coastal 4x4 Expeditions'],
    bestSeason: 'October – April (Bird migration)'
  },
  {
    id: 'aourir',
    name: 'Aourir & Banana Village',
    arabicName: 'أورير وقرية الموز وتامراغت',
    tagline: 'Sweet banana groves, bohemian surf breaks & authentic souks',
    region: 'aourir',
    imageUrl: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1200&q=80',
    experiencesCount: 11,
    description: 'Nestled between the Atlantic waves and lush foothills, Aourir is famous for its sweet coastal banana plantations, Wednesday Berber market, and chilled-out surf spots like Banana Point and Devil’s Rock.',
    highlights: ['Banana Point & Devil’s Rock Surf', 'Wednesday Traditional Berber Souk', 'Sweet Mountain Banana Plantations', 'Authentic Roadside Tagine Cafes'],
    bestSeason: 'Year-round'
  }
];

// Pure database-backed catalog: no hardcoded fake activities or tours. All items come from Firestore.
export const LISTINGS: ListingItem[] = [];

// No fake reviews: only real reviews if added
export const REVIEWS: Review[] = [];

export const CURRENCY_RATES: Record<string, { symbol: string; rateFromMAD: number }> = {
  MAD: { symbol: 'MAD', rateFromMAD: 1 },
  EUR: { symbol: '€', rateFromMAD: 0.093 },
  USD: { symbol: '$', rateFromMAD: 0.10 },
  GBP: { symbol: '£', rateFromMAD: 0.08 }
};
