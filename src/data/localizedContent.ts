import { LanguageCode, ListingItem, Destination, Review } from '../types';

export interface LocalizedListingFields {
  title: string;
  tagline: string;
  location: string;
  city: string;
  duration: string;
  groupSize?: string;
  difficulty?: string;
  promoBadge?: string;
  overview: string;
  highlights: string[];
  included: string[];
  notIncluded: string[];
  meetingPoint: string;
  cancellationPolicy: string;
  hostRole: string;
  availableAddons?: { id: string; name: string; description: string }[];
  itinerary?: { day: number; title: string; description: string; mealsIncluded?: string }[];
}

export interface LocalizedDestinationFields {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  bestSeason: string;
}

export interface LocalizedReviewFields {
  title: string;
  comment: string;
  travelerType: string;
}

export const LOCALIZED_DESTINATIONS: Record<string, Record<LanguageCode, LocalizedDestinationFields>> = {
  taghazout: {
    en: {
      name: 'Taghazout Bay & Surf Coast',
      tagline: 'World-renowned point breaks, ocean yoga & vibrant coastal culture',
      description: 'Morocco’s legendary Atlantic surfing capital just 20 minutes north of Agadir. Renowned for world-class breaks like Anchor Point and Killer Point, oceanfront yoga shalas, laid-back cafes, and golden sandy beaches.',
      highlights: ['World-Class Anchor Point Waves', 'Oceanfront Yoga & Surf Camps', 'Fresh Atlantic Grilled Seafood', 'Sunset Beachfront Cafes & Promenade'],
      bestSeason: 'Year-round (Surf peak: September – April)'
    },
    fr: {
      name: 'Baie de Taghazout & Côte Surf',
      tagline: 'Vagues de renommée mondiale, yoga face à l’océan et ambiance côtière',
      description: 'La capitale légendaire du surf au Maroc à 20 minutes au nord d’Agadir. Célèbre pour ses spots mythiques comme Anchor Point et Killer Point, ses shalas de yoga sur les toits et ses terrasses animées.',
      highlights: ['Vagues mythiques d’Anchor Point', 'Surf Camps & Yoga face à l’océan', 'Poissons frais grillés au port', 'Cafés et terrasses au coucher du soleil'],
      bestSeason: 'Toute l’année (Pic surf : Septembre – Avril)'
    },
    es: {
      name: 'Bahía de Taghazout y Costa de Surf',
      tagline: 'Olas de clase mundial, yoga frente al océano y ambiente costero',
      description: 'La legendaria meca del surf en Marruecos a solo 20 minutos al norte de Agadir. Famosa por sus olas como Anchor Point, escuelas de surf y yoga frente al mar.',
      highlights: ['Olas legendarias de Anchor Point', 'Campamentos de Surf y Yoga', 'Pescado fresco del Atlántico', 'Atardeceres frente a la playa'],
      bestSeason: 'Todo el año (Mejores olas: Septiembre – Abril)'
    },
    de: {
      name: 'Taghazout Bucht & Surferküste',
      tagline: 'Weltberühmte Surfspots, Yoga am Ozean & lebendige Küstenkultur',
      description: 'Marokkos legendäre Surfhauptstadt nur 20 Minuten nördlich von Agadir. Bekannt für Weltklasse-Wellen wie Anchor Point, Dachterrassen-Yoga und Strandcafés.',
      highlights: ['Weltklasse-Wellen am Anchor Point', 'Surf- & Yoga-Lodges am Meer', 'Frischer Atlantik-Grillfisch', 'Sonnenuntergangs-Cafés an der Promenade'],
      bestSeason: 'Ganzjährig (Beste Wellen: September – April)'
    },
    ar: {
      name: 'خليج تغازوت وعاصمة ركوب الأمواج',
      tagline: 'أمواج عالمية شهيرة، يوغا على شاطئ المحيط وأجواء ساحلية ساحرة',
      description: 'عاصمة ركوب الأمواج الأسطورية في المغرب على بعد 20 دقيقة شمال أكادير. تشتهر بأمواج أنكور بوينت وكيلر بوينت العالمية، ومعسكرات اليوغا والمقاهي الشاطئية.',
      highlights: ['أمواج أنكور بوينت العالمية', 'معسكرات ركوب الأمواج واليوغا', 'مأكولات سمك أطلسية طازجة', 'مقاهي وإطلالات غروب الشمس'],
      bestSeason: 'طوال العام (موسم الذروة: سبتمبر – أبريل)'
    },
    it: {
      name: 'Baia di Taghazout & Costa del Surf',
      tagline: 'Onde leggendarie, yoga vista oceano e atmosfera costiera',
      description: 'La capitale del surf in Marocco a 20 minuti a nord di Agadir. Famosa per le onde di Anchor Point, yoga sui tetti e caffè panoramici.',
      highlights: ['Onde di Anchor Point', 'Surf Camp & Yoga sull’oceano', 'Pesce fresco grigliato', 'Tramonti mozzafiato sul mare'],
      bestSeason: 'Tutto l’anno (Picco surf: Settembre – Aprile)'
    }
  },
  'paradise-valley': {
    en: {
      name: 'Paradise Valley & Imouzzer',
      tagline: 'Lush palm gorges, emerald rock pools & the historic Honey Route',
      description: 'A breathtaking oasis tucked into the High Atlas foothills above Agadir. Hike along crystal-clear riverbeds, swim in natural turquoise limestone pools, and taste wild thyme honey in Imouzzer Ida Outanane.',
      highlights: ['Natural Emerald Rock Pools', 'Palm Canyon Cliff Hikes', 'Imouzzer Mountain Honey Tasting', 'River Oasis Tagine Picnics'],
      bestSeason: 'Year-round (Best water levels: October – June)'
    },
    fr: {
      name: 'Paradise Valley & Imouzzer',
      tagline: 'Gorges verdoyantes, piscines naturelles émeraude et route du miel',
      description: 'Une oasis spectaculaire nichée dans les contreforts de l’Atlas au-dessus d’Agadir. Randonnées dans les palmeraies, baignade dans les vasques turquoise et dégustation de miel sauvage à Imouzzer.',
      highlights: ['Vasques naturelles émeraude', 'Randonnées dans les gorges de palmiers', 'Dégustation de miel d’Imouzzer', 'Déjeuner tagine les pieds dans l’eau'],
      bestSeason: 'Toute l’année (Belles vasques : Octobre – Juin)'
    },
    es: {
      name: 'Paradise Valley e Imouzzer',
      tagline: 'Gargantas de palmeras, pozas esmeralda y la ruta de la miel',
      description: 'Un oasis espectacular en las estribaciones del Atlas sobre Agadir. Senderismo por cañones, baños en pozas de agua turquesa y miel pura en Imouzzer.',
      highlights: ['Pozas naturales de roca esmeralda', 'Senderismo por el cañón de palmeras', 'Degustación de miel de tomillo', 'Picnic de tagine junto al río'],
      bestSeason: 'Todo el año (Mejor caudal: Octubre – Junio)'
    },
    de: {
      name: 'Paradise Valley & Imouzzer',
      tagline: 'Grüne Palmentäler, smaragdgrüne Felsenpools & Honigstraße',
      description: 'Eine atemberaubende Oase in den Ausläufern des Atlas-Gebirges über Agadir. Wandern entlang klarer Flussbetten, Schwimmen in türkisfarbenen Felsenpools und Verkostung von Wildhonig in Imouzzer.',
      highlights: ['Natürliche Smaragd-Felsenpools', 'Wanderungen durch Palmenschluchten', 'Verkostung von Imouzzer-Honig', 'Tagine-Picknick am Fluss'],
      bestSeason: 'Ganzjährig (Bester Wasserstand: Oktober – Juni)'
    },
    ar: {
      name: 'وادي الجنة وإيموزار إداوتنان',
      tagline: 'مضايق نخيل خلابة، مسابح صخرية فيروزية وطريق العسل التاريخي',
      description: 'واحة طبيعية ساحرة في سفوح الأطلس شمال شرق أكادير. مسارات مشي بين بساتين النخيل، سباحة في المسابح الصخرية الطبيعية وتذوق عسل الزعتر الحر بإيموزار إداوتنان.',
      highlights: ['مسابح صخرية فيروزية طبيعية', 'مسارات مشي في مضايق النخيل', 'تذوق عسل إيموزار الحر وأملو', 'غداء طاجين بربري على ضفاف الوادي'],
      bestSeason: 'طوال العام (أفضل تدفق للمياه: أكتوبر – يونيو)'
    },
    it: {
      name: 'Paradise Valley & Imouzzer',
      tagline: 'Gole di palme, piscine naturali color smeraldo e via del miele',
      description: 'Un’oasi spettacolare ai piedi dell’Atlante sopra Agadir. Trekking tra palmeti, bagni in vasche naturali d’acqua turchese e degustazione di miele.',
      highlights: ['Piscine naturali di roccia', 'Trekking nel canyon di palme', 'Degustazione miele di timo', 'Pranzo tagine lungo il fiume'],
      bestSeason: 'Tutto l’anno (Migliori acque: Ottobre – Giugno)'
    }
  },
  'agadir-beach': {
    en: {
      name: 'Agadir Beach & Marina',
      tagline: 'Sun-drenched crescent bay, luxury marina & historic Kasbah views',
      description: 'Morocco’s premier seaside resort boasting 300+ days of sunshine a year. Features a 10km palm-lined beach promenade, luxury marina yacht charters, and panoramic sunsets from Kasbah Agadir Oufella.',
      highlights: ['10km Golden Sand Crescent Beach', 'Agadir Oufella Hilltop Fortress Views', 'Agadir Marina Catamaran Cruises', 'Sunset Flamingo Beach Rides'],
      bestSeason: 'Year-round (Over 300 days of sunshine)'
    },
    fr: {
      name: 'Plage & Marina d’Agadir',
      tagline: 'Baie ensoleillée, marina moderne et vue panoramique sur la Kasbah',
      description: 'La plus grande station balnéaire du Maroc avec plus de 300 jours de soleil par an. Promenade de 10 km bordée de palmiers, sorties en catamaran et coucher de soleil depuis Agadir Oufella.',
      highlights: ['Plage dorée de 10 km', 'Vue panoramique depuis la Kasbah Oufella', 'Croisières en catamaran à la Marina', 'Balades à dromadaire au coucher du soleil'],
      bestSeason: 'Toute l’année (300+ jours de soleil)'
    },
    es: {
      name: 'Playa y Marina de Agadir',
      tagline: 'Bahía soleada, marina de lujo y vistas desde la histórica Kasbah',
      description: 'El principal destino de playa de Marruecos con más de 300 días de sol al año. Paseo marítimo de 10 km, paseos en catamarán y atardeceres en Agadir Oufella.',
      highlights: ['Playa dorada de 10 km', 'Vistas desde la Kasbah Agadir Oufella', 'Cruceros en catamarán desde la Marina', 'Paseos en camello al atardecer'],
      bestSeason: 'Todo el año'
    },
    de: {
      name: 'Agadir Strand & Marina',
      tagline: 'Sonnige Bucht, moderne Marina & Ausblick von der historischen Kasbah',
      description: 'Marokkos führender Badeort mit über 300 Sonnentagen im Jahr. Eine 10 km lange Strandpromenade, Katamaran-Ausflüge und Sonnenuntergänge an der Kasbah Agadir Oufella.',
      highlights: ['10 km langer goldener Sandstrand', 'Panoramablick von der Kasbah Agadir Oufella', 'Katamaran-Fahrten ab der Marina', 'Kamelritte zum Sonnenuntergang'],
      bestSeason: 'Ganzjährig'
    },
    ar: {
      name: 'شاطئ ومارينا أكادير',
      tagline: 'خليج هلالي مشمس، مارينا لليخوت وإطلالة بانورامية من قصبة أوفلا',
      description: 'أبرز منتجع سياحي بحري في المغرب بأكثر من 300 يوم مشمس سنوياً. كورنيش ساحلي بطول 10 كم، رحلات يخوت كاتاماران من المارينا، وغروب الشمس من قصبة أكادير أوفلا.',
      highlights: ['شاطئ رملي ذهبي بطول 10 كم', 'إطلالة بانورامية من قصبة أكادير أوفلا', 'رحلات بحرية بيخوت الكاتاماران', 'جولات الجمال عند شاطئ الفلامينغو'],
      bestSeason: 'طوال العام (أكثر من 300 يوم مشمس)'
    },
    it: {
      name: 'Spiaggia & Marina di Agadir',
      tagline: 'Baia soleggiata, marina moderna e vista panoramica dalla Kasbah',
      description: 'La principale località balneare del Marocco con oltre 300 giorni di sole all’anno. Lungomare di 10 km, crociere in catamarano e tramonti spettacolari.',
      highlights: ['10 km di spiaggia dorata', 'Vista panoramica da Agadir Oufella', 'Crociere in catamarano dalla Marina', 'Passeggiate in cammello al tramonto'],
      bestSeason: 'Tutto l’anno'
    }
  },
  'souss-valley': {
    en: {
      name: 'Souss Valley & Argan Biosphere',
      tagline: 'UNESCO Argan biosphere, sunrise balloon flights & Berber villages',
      description: 'The ancient fertile basin stretching east of Agadir towards the Anti-Atlas. Home to the endemic Argan forest, sunrise hot air balloon adventures, and traditional Berber cooperatives.',
      highlights: ['Sunrise Hot Air Balloon Over Souss', 'Endemic UNESCO Argan Forests', 'Authentic Women’s Argan Cooperatives', 'Berber Countryside Quad Safaris'],
      bestSeason: 'September – May'
    },
    fr: {
      name: 'Vallée du Souss & Forêts d’Arganiers',
      tagline: 'Réserve de biosphère UNESCO, vols en montgolfière et villages berbères',
      description: 'Le bassin fertile à l’est d’Agadir. Berceau de la forêt d’arganiers endémique, des survols en montgolfière au lever du soleil et des coopératives féminines traditionnelles.',
      highlights: ['Montgolfière au lever du soleil sur le Souss', 'Forêts d’arganiers classées UNESCO', 'Coopératives d’huile d’argan authentiques', 'Safaris quad dans les villages berbères'],
      bestSeason: 'Septembre – Mai'
    },
    es: {
      name: 'Valle de Souss y Biosfera de Argán',
      tagline: 'Biosfera UNESCO del Argán, vuelos en globo y pueblos bereberes',
      description: 'La fértil cuenca al este de Agadir. Hogar del bosque endémico de argán, paseos en globo aerostático al amanecer y cooperativas tradicionales.',
      highlights: ['Vuelo en globo al amanecer sobre Souss', 'Bosques de argán protegidos por la UNESCO', 'Cooperativas auténticas de aceite de argán', 'Safaris en quad por el campo bereber'],
      bestSeason: 'Septiembre – Mayo'
    },
    de: {
      name: 'Souss-Tal & Argan-Biosphäre',
      tagline: 'UNESCO-Argan-Biosphäre, Ballonfahrten bei Sonnenaufgang & Berberdörfer',
      description: 'Die fruchtbare Ebene östlich von Agadir. Heimat des seltenen Arganwalds, Heißluftballonfahrten zum Sonnenaufgang und traditioneller Frauenkooperativen.',
      highlights: ['Heißluftballonfahrt zum Sonnenaufgang', 'UNESCO-geschützte Arganbaumwälder', 'Authentische Arganöl-Kooperativen', 'Quad-Safaris durch Berberdörfer'],
      bestSeason: 'September – Mai'
    },
    ar: {
      name: 'سهل سوس ومحمية الأركان',
      tagline: 'محمية الأركان لليونسكو، رحلات المنطاد عند الشروق والقرى الأمازيغية',
      description: 'الحوض الخصيب التاريخي شرق أكادير باتجاه الأطلس الصغير. موطن شجرة الأركان النادرة المصنفة يونسكو، ورحلات المنطاد الطائر والتعاونيات النسوية التقليدية.',
      highlights: ['رحلة منطاد طائر عند شروق الشمس فوق سوس', 'غابات شجر الأركان المصنفة يونسكو', 'تعاونيات نسوية أصيلة لإنتاج زيت الأركان', 'سفاري كواد في القرى والبوادي الأمازيغية'],
      bestSeason: 'سبتمبر – ماي'
    },
    it: {
      name: 'Valle del Souss & Biosfera dell’Argan',
      tagline: 'Biosfera UNESCO, voli in mongolfiera all’alba e villaggi berberi',
      description: 'La fertile pianura a est di Agadir. Terra delle foreste di argan, voli in mongolfiera all’alba e cooperative tradizionali.',
      highlights: ['Volo in mongolfiera all’alba sul Souss', 'Foreste di argan protette dall’UNESCO', 'Cooperative autentiche di olio di argan', 'Safari in quad nella campagna berbera'],
      bestSeason: 'Settembre – Maggio'
    }
  },
  'tifnit-massa': {
    en: {
      name: 'Tifnit & Souss-Massa Park',
      tagline: 'Wild Atlantic cliffs, troglodyte caves & rare Bald Ibis sanctuary',
      description: 'Located 40km south of Agadir, this wild coastal expanse combines troglodyte fisherman cliff-dwellings of Tifnit with the protected wetlands of Souss-Massa National Park.',
      highlights: ['Tifnit Cliffside Fisherman Caves', 'Souss-Massa National Park Birdwatching', 'Pristine Untamed Ocean Beaches', 'Atlantic Coastal 4x4 Expeditions'],
      bestSeason: 'October – April'
    },
    fr: {
      name: 'Tifnit & Parc Souss-Massa',
      tagline: 'Falaises sauvages, grottes de pêcheurs et sanctuaire de l’Ibis chauve',
      description: 'À 40 km au sud d’Agadir, une côte sauvage spectaculaire abritant les grottes troglodytiques de Tifnit et le Parc National de Souss-Massa avec ses flamants roses et ibis chauves.',
      highlights: ['Grottes troglodytes de Tifnit', 'Observation ornithologique à Souss-Massa', 'Plages océaniques sauvages', 'Expéditions 4x4 côtières'],
      bestSeason: 'Octobre – Avril'
    },
    es: {
      name: 'Tifnit y Parque Souss-Massa',
      tagline: 'Acantilados salvajes, cuevas de pescadores y santuario del Ibis Eremita',
      description: 'A 40 km al sur de Agadir, costa virgen con las cuevas de pescadores de Tifnit y el Parque Nacional de Souss-Massa con flamencos y fauna protegida.',
      highlights: ['Cuevas de pescadores en los acantilados', 'Observación de aves en Souss-Massa', 'Playas vírgenes del Atlántico', 'Expediciones en 4x4 por la costa'],
      bestSeason: 'Octubre – Abril'
    },
    de: {
      name: 'Tifnit & Souss-Massa Nationalpark',
      tagline: 'Wilde Klippen, Höhlenwohnungen & Zufluchtsort des Waldrapps',
      description: '40 km südlich von Agadir: wilde Steilküsten mit Höhlendörfern in Tifnit und der Souss-Massa-Nationalpark mit Flamingos und seltenen Wüstentieren.',
      highlights: ['Fischerhöhlen in den Klippen von Tifnit', 'Vogelbeobachtung im Souss-Massa-Park', 'Unberührte Atlantikstrände', '4x4 Küsten-Safaris'],
      bestSeason: 'Oktober – April'
    },
    ar: {
      name: 'تيفنيت ومنتزه سوس ماسة الطبيعي',
      tagline: 'جروف أطلسية برية، كهوف الصيادين ومحمية طائر أبو منجل النادر',
      description: 'على بعد 40 كم جنوب أكادير، شريط ساحلي بري يجمع بين كهوف صيادي تيفنيت المنحوتة في الجروف والمحمية الطبيعية لسوس ماسة وملاذ طيور النحام وأبو منجل الأقرع.',
      highlights: ['كهوف صيادي تيفنيت المنحوتة في الجروف', 'سفاري ومراقبة الطيور بمنتزه سوس ماسة', 'شواطئ أطلسية برية وعذراء', 'رحلات دفع رباعي على الكثبان الساحلية'],
      bestSeason: 'أكتوبر – أبريل'
    },
    it: {
      name: 'Tifnit & Parco Souss-Massa',
      tagline: 'Scogliere selvagge, grotte di pescatori e riserva dell’Ibis eremita',
      description: 'A 40 km a sud di Agadir: costa selvaggia con le grotte dei pescatori di Tifnit e il Parco Nazionale di Souss-Massa ricco di fauna protetta.',
      highlights: ['Grotte dei pescatori a Tifnit', 'Birdwatching nel Parco Souss-Massa', 'Spiagge atlantiche incontaminate', 'Spedizioni 4x4 costiere'],
      bestSeason: 'Ottobre – Aprile'
    }
  },
  aourir: {
    en: {
      name: 'Aourir & Banana Village',
      tagline: 'Sweet banana groves, bohemian surf breaks & authentic souks',
      description: 'Nestled between Atlantic waves and foothills, Aourir is famous for sweet coastal banana plantations, Wednesday Berber markets, and surf spots like Banana Point.',
      highlights: ['Banana Point & Devil’s Rock Surf', 'Wednesday Traditional Berber Souk', 'Sweet Mountain Banana Plantations', 'Authentic Roadside Tagine Cafes'],
      bestSeason: 'Year-round'
    },
    fr: {
      name: 'Aourir & Village Banane',
      tagline: 'Plantations de bananes, spots de surf bohèmes et souks traditionnels',
      description: 'Niché entre mer et collines, Aourir est réputé pour ses bananeraies douces, son souk berbère du mercredi et ses spots comme Banana Point et Devil’s Rock.',
      highlights: ['Spots de Banana Point & Devil’s Rock', 'Souk traditionnel du mercredi', 'Plantations de bananes douces', 'Tagines parfumés en bord de route'],
      bestSeason: 'Toute l’année'
    },
    es: {
      name: 'Aourir y Pueblo Platanero',
      tagline: 'Plataneras dulces, spots de surf y zocos tradicionales',
      description: 'Entre las olas del Atlántico y las colinas, famoso por sus plantaciones de plátanos, el zoco del miércoles y las olas de Banana Point.',
      highlights: ['Surf en Banana Point y Devil’s Rock', 'Zoco tradicional de los miércoles', 'Plantaciones de plátanos', 'Tagines tradicionales en ruta'],
      bestSeason: 'Todo el año'
    },
    de: {
      name: 'Aourir & Bananendorf',
      tagline: 'Süße Bananenhaine, entspannte Surfspots & Wochenmärkte',
      description: 'Zwischen Ozean und Bergen gelegen, berühmt für Bananenplantagen, den traditionellen Mittwochs-Souk und Surfspots wie Banana Point.',
      highlights: ['Surfen am Banana Point & Devil’s Rock', 'Traditioneller Mittwochs-Souk', 'Bananenplantagen am Berg', 'Authentische Tagine-Restaurants'],
      bestSeason: 'Ganzjährig'
    },
    ar: {
      name: 'أورير وقرية الموز وتامراغت',
      tagline: 'بساتين الموز السكرية، شواطئ ركوب الأمواج والأسواق الشعبية',
      description: 'بين أمواج المحيط وسفوح الجبال، تشتهر أورير ببساتين الموز الحلو، وسوق الأربعاء الأسبوعي، وشواطئ بانانا بوينت وصخرة الشيطان لركوب الأمواج.',
      highlights: ['ركوب الأمواج في بانانا بوينت وصخرة الشيطان', 'سوق الأربعاء البربري التقليدي', 'بساتين الموز الجبلي السكري', 'طواجن أورير الشهيرة على الطريق'],
      bestSeason: 'طوال العام'
    },
    it: {
      name: 'Aourir & Villaggio delle Banane',
      tagline: 'Piantagioni di banane dolci, spot per il surf e souk settimanali',
      description: 'Tra l’oceano e le colline, famosa per le sue piantagioni di banane, il souk del mercoledì e gli spot di surf come Banana Point.',
      highlights: ['Surf a Banana Point e Devil’s Rock', 'Souk tradizionale del mercoledì', 'Piantagioni di banane locali', 'Tagine tradizionali su strada'],
      bestSeason: 'Tutto l’anno'
    }
  }
};

export const LOCALIZED_LISTINGS: Record<string, Partial<Record<LanguageCode, Partial<LocalizedListingFields>>>> = {};

export const LOCALIZED_REVIEWS: Record<string, Record<LanguageCode, LocalizedReviewFields>> = {
  'rev-1': {
    en: {
      title: 'Unforgettable Mount Toubkal & Atlas Trekking with Hidden Atlas',
      comment: 'Our guided trek to Mount Toubkal and Lake Ifni was the highlight of our journey in Morocco! Our local guide was incredibly knowledgeable, attentive, and safe. Experiencing Berber hospitality along the mountain trail was deeply moving.',
      travelerType: 'Couple'
    },
    fr: {
      title: 'Trek inoubliable au Mont Toubkal & Haut Atlas avec Hidden Atlas',
      comment: 'Notre ascension guidée du Toubkal et la découverte du lac d’Ifni ont été le moment fort de notre voyage au Maroc. Notre guide local était formidable, bienveillant et passionné.',
      travelerType: 'Couple'
    },
    es: {
      title: 'Trekking inolvidable en el Monte Tubkal y el Atlas con Hidden Atlas',
      comment: 'Nuestra ruta guiada al Tubkal y al Lago Ifni fue lo mejor de nuestro viaje. Nuestro guía local demostró gran profesionalidad y cercanía en todo momento.',
      travelerType: 'Pareja'
    },
    de: {
      title: 'Unvergessliches Toubkal- & Atlas-Trekking mit Hidden Atlas',
      comment: 'Die geführte Wanderung zum Toubkal und zum Ifni-See war der Höhepunkt unserer Marokkoreise! Unser Bergführer war kompetent und herzlich.',
      travelerType: 'Paar'
    },
    ar: {
      title: 'رحلة مشي وتسلق لا تُنسى في جبل توبقال وبحيرة إفني مع هيدن أطلس',
      comment: 'كانت رحلة تسلق قمة توبقال واستكشاف بحيرة إفني مع مرشدنا المحلي أروع تجربة في المغرب. احترافية عالية، أمان تام، وكرم ضيافة بربرية أصيلة لا تُنسى.',
      travelerType: 'زوجان'
    },
    it: {
      title: 'Trekking indimenticabile sul Monte Toubkal e Alto Atlante con Hidden Atlas',
      comment: 'Il trekking guidato sul Toubkal e al Lago Ifni è stato il momento più bello del viaggio in Marocco. La nostra guida locale era preparatissima e cordiale.',
      travelerType: 'Coppia'
    }
  },
  'rev-2': {
    en: {
      title: 'Sensational Sahara Camel Ride & Desert Sunset with Hidden Atlas',
      comment: 'The camel ride and sunset desert tour was absolutely extraordinary. The golden sands, traditional mint tea, and attentive local guidance made this a once-in-a-lifetime experience. Highly recommended!',
      travelerType: 'Solo'
    },
    fr: {
      title: 'Balade à dos de dromadaire & coucher de soleil magique dans le désert',
      comment: 'La traversée des dunes au coucher du soleil était extraordinaire. Les sables dorés, le thé à la menthe traditionnel et l’accueil chaleureux de notre guide ont rendu ce moment inoubliable.',
      travelerType: 'Solo'
    },
    es: {
      title: 'Paseo en camello por el desierto al atardecer con Hidden Atlas',
      comment: 'Una experiencia mágica entre las dunas doradas del Sahara al caer el sol. La atención de nuestro guía local y el té a la menta fueron insuperables.',
      travelerType: 'Solo'
    },
    de: {
      title: 'Traumhafter Kamelritt & Sonnenuntergang in der Wüste mit Hidden Atlas',
      comment: 'Der Kamelritt bei Sonnenuntergang war absolut atemberaubend. Toller Guide, wunderschöne Dünen und echter marokkanischer Minztee.',
      travelerType: 'Solo'
    },
    ar: {
      title: 'جولة ركوب الجمال عند غروب الشمس في الصحراء مع هيدن أطلس',
      comment: 'جولة ركوب الجمال بين الكثبان الرملية الذهبية عند الغروب كانت في غاية الروعة والسحر. شاي بالنعناع أصيل ومرافقة دافئة ومتمكنة من المرشد المحلي.',
      travelerType: 'فردي'
    },
    it: {
      title: 'Passeggiata a dorso di dromedario al tramonto con Hidden Atlas',
      comment: 'Un tramonto favoloso sulle dune del deserto. Guida attentissima, sabbie dorate e tè alla menta indimenticabile.',
      travelerType: 'Solo'
    }
  },
  'rev-3': {
    en: {
      title: 'Superb Essaouira Day Trip & Dunes Quad Biking with Hidden Atlas',
      comment: 'An unforgettable day with our local guide from Hidden Atlas. The cultural day trip to Essaouira and thrilling quad biking across coastal dunes were perfectly organized from start to finish.',
      travelerType: 'Family'
    },
    fr: {
      title: 'Superbe excursion d’une journée à Essaouira & Quad dans les dunes',
      comment: 'Une journée inoubliable avec notre guide local d’Hidden Atlas. La visite culturelle d’Essaouira et la session de quad dans les dunes étaient exceptionnelles. Tout était parfaitement organisé du début à la fin.',
      travelerType: 'Famille'
    },
    es: {
      title: 'Excursión inolvidable a Essaouira y Quad en las dunas con Hidden Atlas',
      comment: 'Un día maravilloso con nuestro guía local. La visita cultural a Essaouira y la aventura en quad por las dunas estuvieron perfectamente organizadas.',
      travelerType: 'Familia'
    },
    de: {
      title: 'Toller Tagesausflug nach Essaouira & Quad-Biking mit Hidden Atlas',
      comment: 'Ein fantastischer Tag mit unserem lokalen Guide. Der Kulturausflug nach Essaouira und das Quadfahren in den Dünen waren perfekt organisiert.',
      travelerType: 'Familie'
    },
    ar: {
      title: 'رحلة يوم مميزة إلى الصويرة وجولة الكواد بين الكثبان مع هيدن أطلس',
      comment: 'يوم لا يُنسى مع مرشدنا المحلي في هيدن أطلس. الرحلة الثقافية إلى مدينة الصويرة وركوب دراجات الكواد في الكثبان الساحلية كانت منظمة بدقة متناهية من البداية حتى النهاية.',
      travelerType: 'عائلة'
    },
    it: {
      title: 'Splendida escursione a Essaouira & Quad tra le dune con Hidden Atlas',
      comment: 'Una giornata magnifica con la nostra guida locale. La visita a Essaouira e l’avventura in quad sono state organizzate alla perfezione.',
      travelerType: 'Famiglia'
    }
  }
};

/**
 * Resolves a listing item with localized texts dynamically.
 */
export function getLocalizedListing(item: ListingItem, lang: LanguageCode): ListingItem {
  const overrides = LOCALIZED_LISTINGS[item.id]?.[lang];
  if (!overrides) {
    if (lang === 'ar' && item.arabicTitle) {
      return {
        ...item,
        title: item.arabicTitle
      };
    }
    return item;
  }

  return {
    ...item,
    title: overrides.title ?? (lang === 'ar' && item.arabicTitle ? item.arabicTitle : item.title),
    tagline: overrides.tagline ?? item.tagline,
    location: overrides.location ?? item.location,
    city: overrides.city ?? item.city,
    duration: overrides.duration ?? item.duration,
    groupSize: overrides.groupSize ?? item.groupSize,
    difficulty: (overrides.difficulty as any) ?? item.difficulty,
    promoBadge: overrides.promoBadge ?? item.promoBadge,
    overview: overrides.overview ?? item.overview,
    highlights: overrides.highlights ?? item.highlights,
    included: overrides.included ?? item.included,
    notIncluded: overrides.notIncluded ?? item.notIncluded,
    meetingPoint: overrides.meetingPoint ?? item.meetingPoint,
    cancellationPolicy: overrides.cancellationPolicy ?? item.cancellationPolicy,
    hostRole: overrides.hostRole ?? item.hostRole,
    availableAddons: overrides.availableAddons
      ? item.availableAddons.map((addon) => {
          const match = overrides.availableAddons?.find((a) => a.id === addon.id);
          return match
            ? { ...addon, name: match.name, description: match.description }
            : addon;
        })
      : item.availableAddons,
    itinerary: overrides.itinerary ?? item.itinerary
  };
}

/**
 * Resolves a destination with localized texts dynamically.
 */
export function getLocalizedDestination(dest: Destination, lang: LanguageCode): Destination {
  const overrides = LOCALIZED_DESTINATIONS[dest.id]?.[lang];
  if (!overrides) return dest;

  return {
    ...dest,
    name: overrides.name ?? (lang === 'ar' && dest.arabicName ? dest.arabicName : dest.name),
    tagline: overrides.tagline ?? dest.tagline,
    description: overrides.description ?? dest.description,
    highlights: overrides.highlights ?? dest.highlights,
    bestSeason: overrides.bestSeason ?? dest.bestSeason
  };
}

/**
 * Resolves a review with localized texts dynamically.
 */
export function getLocalizedReview(review: Review, lang: LanguageCode): Review {
  const overrides = LOCALIZED_REVIEWS[review.id]?.[lang];
  if (!overrides) return review;

  return {
    ...review,
    title: overrides.title ?? review.title,
    comment: overrides.comment ?? review.comment,
    travelerType: (overrides.travelerType as any) ?? review.travelerType
  };
}
