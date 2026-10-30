import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CategoryFilterBar } from './components/CategoryFilterBar';
import { ListingCard } from './components/ListingCard';
import { Footer } from './components/Footer';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';

// Code-split heavy interactive modals, drawers and below-the-fold sections to drastically reduce initial JS bundle size
const AboutSection = React.lazy(() =>
  import('./components/AboutSection').then((m) => ({ default: m.AboutSection }))
);
const ContactSection = React.lazy(() =>
  import('./components/ContactSection').then((m) => ({ default: m.ContactSection }))
);
const ItemDetailModal = React.lazy(() =>
  import('./components/ItemDetailModal').then((m) => ({ default: m.ItemDetailModal }))
);
const WishlistDrawer = React.lazy(() =>
  import('./components/WishlistDrawer').then((m) => ({ default: m.WishlistDrawer }))
);
const AdminDashboardModal = React.lazy(() =>
  import('./components/AdminDashboardModal').then((m) => ({ default: m.AdminDashboardModal }))
);
import { ListingItem, ItemType, Region, ActivityCategory, Currency, LanguageCode, SiteSettings } from './types';
import { TRANSLATIONS } from './utils/translations';
import { Compass } from 'lucide-react';
import { 
  subscribeToActivities, 
  createFirestoreActivity, 
  updateFirestoreActivity, 
  deleteFirestoreActivity,
  subscribeToSiteSettings,
  updateSiteSettings,
  DEFAULT_SITE_SETTINGS,
  migrateLargeActivityDocuments
} from './lib/firebase';

export default function App() {
  // Localization & Preferences with persistent storage
  const [currentLang, setCurrentLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('hiddenatlas_lang') as LanguageCode;
      if (saved && ['en', 'fr', 'es', 'de', 'ar', 'it'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const [currentCurrency, setCurrentCurrency] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem('hiddenatlas_currency') as Currency;
      if (saved && ['MAD', 'EUR', 'USD', 'GBP'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'EUR';
  });

  const handleLanguageChange = (newLang: LanguageCode) => {
    setCurrentLang(newLang);
    try {
      localStorage.setItem('hiddenatlas_lang', newLang);
    } catch {}
  };

  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrentCurrency(newCurr);
    try {
      localStorage.setItem('hiddenatlas_currency', newCurr);
    } catch {}
  };

  // Browsing Filters
  const [selectedType, setSelectedType] = useState<ItemType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<Region>('all');
  const [selectedActivityCat, setSelectedActivityCat] = useState<ActivityCategory | 'all'>('all');
  const [activeNavSection, setActiveNavSection] = useState<string>('home');

  // Live Catalog State backed ONLY by Firestore Real-Time Database
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState<boolean>(true);

  // Live Site Settings (WhatsApp, Socials, Hero Image, Guide Info)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  // Modals & Drawers State
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<ListingItem | null>(null);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);

  // Persistent Wishlist
  const [wishlist, setWishlist] = useState<ListingItem[]>(() => {
    try {
      const saved = localStorage.getItem('hiddenatlas_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const t = TRANSLATIONS[currentLang];
  const isAr = currentLang === 'ar';

  // Synchronize document direction and language for typography and layout
  useEffect(() => {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    if (isAr) {
      document.body.classList.add('rtl-layout');
    } else {
      document.body.classList.remove('rtl-layout');
    }
  }, [currentLang, isAr]);

  // Real-time Firestore synchronization for site settings
  useEffect(() => {
    const unsubscribe = subscribeToSiteSettings(
      (settings) => {
        setSiteSettings(settings);
      },
      (err) => {
        console.warn('Site settings real-time subscription notice:', err);
      }
    );
    return () => unsubscribe();
  }, []);

  // One-time safe migration to clean any oversized legacy activities
  useEffect(() => {
    try {
      const alreadyChecked = sessionStorage.getItem('hiddenatlas_migration_checked');
      if (!alreadyChecked) {
        sessionStorage.setItem('hiddenatlas_migration_checked', 'true');
        migrateLargeActivityDocuments().catch((e) => console.warn('Safe migration notice:', e));
      }
    } catch {}
  }, []);

  // Real-time Firestore synchronization for activities with onSnapshot
  useEffect(() => {
    setIsLoadingActivities(true);
    const unsubscribe = subscribeToActivities(
      (items) => {
        setListings(items || []);
        setIsLoadingActivities(false);

        // Keep active detail modal in sync with real-time updates/deletes
        setSelectedItemForDetails((prevSelected) => {
          if (!prevSelected) return null;
          const freshItem = (items || []).find((it) => it.id === prevSelected.id);
          return freshItem || null;
        });
      },
      (error) => {
        console.warn('Firestore activities listener error:', error);
        setListings([]);
        setIsLoadingActivities(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Admin Firestore CRUD Handlers
  const handleAddListing = async (
    itemData: Partial<ListingItem> & { title: string; priceMAD: number; duration: string; region: Region },
    files?: File[],
    onProgress?: (progress: number, text: string) => void
  ) => {
    await createFirestoreActivity(itemData, files, onProgress);
  };

  const handleUpdateListing = async (
    id: string,
    updates: Partial<ListingItem>,
    newFiles?: File[],
    onProgress?: (progress: number, text: string) => void
  ) => {
    await updateFirestoreActivity(id, updates, newFiles, onProgress);
  };

  const handleDeleteListing = async (id: string, imageUrls?: string[]) => {
    // Optimistically update state immediately so deleted item disappears instantly
    setListings((prev) => prev.filter((item) => item.id !== id));
    setWishlist((prev) => prev.filter((item) => item.id !== id));
    if (selectedItemForDetails?.id === id) {
      setSelectedItemForDetails(null);
    }
    // Delete from Firestore permanently
    await deleteFirestoreActivity(id, imageUrls);
  };

  // Wishlist toggle handler
  const handleToggleWishlist = (item: ListingItem) => {
    setWishlist((prev) => {
      let updated: ListingItem[];
      if (prev.some((i) => i.id === item.id)) {
        updated = prev.filter((i) => i.id !== item.id);
      } else {
        updated = [...prev, item];
      }
      try {
        localStorage.setItem('hiddenatlas_wishlist', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Smooth Navigation Handler for core tour guide links
  const handleNavigate = (sectionId: string) => {
    setActiveNavSection(sectionId);
    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (sectionId === 'trips' || sectionId === 'trekking') {
      setSelectedType('trip');
      scrollToCatalog();
    } else if (sectionId === 'activities' || sectionId === 'adventures') {
      setSelectedType('activity');
      scrollToCatalog();
    } else if (sectionId === 'about') {
      const el = document.getElementById('about-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (sectionId === 'contact') {
      const el = document.getElementById('contact-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Active section scroll tracking to update active link in navbar
  useEffect(() => {
    let ticking = false;
    const handleScrollSpy = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollPos = window.scrollY + 250;
          const contactEl = document.getElementById('contact-section');
          const aboutEl = document.getElementById('about-section');
          const catalogEl = document.getElementById('catalog-grid-section');

          if (contactEl && scrollPos >= contactEl.offsetTop) {
            setActiveNavSection('contact');
          } else if (aboutEl && scrollPos >= aboutEl.offsetTop) {
            setActiveNavSection('about');
          } else if (catalogEl && scrollPos >= catalogEl.offsetTop) {
            setActiveNavSection(selectedType === 'activity' ? 'activities' : 'trips');
          } else {
            setActiveNavSection('home');
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [selectedType]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-grid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Smart Region Matcher supporting both predefined keys and free-text places
  const matchRegion = (item: ListingItem, selected: string): boolean => {
    if (!selected || selected === 'all') return true;
    const itemRegion = (item.region || '').toLowerCase();
    const itemCity = (item.city || '').toLowerCase();
    const itemLocation = (item.location || '').toLowerCase();
    const itemTitle = (item.title || '').toLowerCase();
    const itemArTitle = (item.arabicTitle || '').toLowerCase();
    const textBlob = `${itemRegion} ${itemCity} ${itemLocation} ${itemTitle} ${itemArTitle}`;

    switch (selected) {
      case 'atlas-mountains':
        return textBlob.includes('atlas') || textBlob.includes('toubkal') || textBlob.includes('توبقال') || textBlob.includes('أطلس') || textBlob.includes('imlil') || textBlob.includes('إمليل');
      case 'sahara-desert':
        return textBlob.includes('sahara') || textBlob.includes('desert') || textBlob.includes('صحراء') || textBlob.includes('merzouga') || textBlob.includes('مرزوكة') || textBlob.includes('zagora');
      case 'essaouira':
        return textBlob.includes('essaouira') || textBlob.includes('صويرة') || textBlob.includes('beach') || textBlob.includes('coast');
      case 'paradise-valley':
        return textBlob.includes('paradise') || textBlob.includes('جنة') || textBlob.includes('valley') || textBlob.includes('agadir') || textBlob.includes('أكادير');
      default: {
        const q = selected.toLowerCase().trim();
        return textBlob.includes(q) || itemRegion === q;
      }
    }
  };

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) {
        return false;
      }
      if (selectedRegion !== 'all' && !matchRegion(item, selectedRegion)) {
        return false;
      }
      if (selectedType === 'activity' || selectedType === 'all') {
        if (selectedActivityCat !== 'all' && item.category !== selectedActivityCat) {
          return false;
        }
      }
      return true;
    });
  }, [listings, selectedType, selectedRegion, selectedActivityCat]);

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      lang={currentLang}
      className={`min-h-screen bg-gradient-to-b from-[#F6F2EC] via-[#F8F5F0] to-[#EFE8DD] bg-amazigh-pattern text-[#2E2118] flex flex-col selection:bg-[#9C4A2F] selection:text-white ${
        isAr ? 'font-arabic-body' : 'font-body'
      }`}
    >
      {/* 1. Top Navbar (Solid on scroll, Toubkal Logo, sunrise orange WhatsApp button) */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        currentCurrency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
        activeSection={activeNavSection}
        onNavigate={handleNavigate}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setWishlistDrawerOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        whatsappNumber={siteSettings.whatsappNumber}
      />

      <main className="flex-1">
        {/* 2. Hero Section (Toubkal Visual Identity, mountain divider, sunrise orange CTA) */}
        <HeroSection
          currentLang={currentLang}
          onSelectCategory={(type) => {
            setSelectedType(type);
            scrollToCatalog();
          }}
          onExploreClick={scrollToCatalog}
          heroImageUrl={siteSettings.heroImageUrl}
          whatsappNumber={siteSettings.whatsappNumber}
        />

        {/* 3. Interactive Catalog Filter Bar */}
        <div id="catalog-grid-section">
          <CategoryFilterBar
            currentLang={currentLang}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            selectedActivityCat={selectedActivityCat}
            onSelectActivityCat={setSelectedActivityCat}
          />
        </div>

        {/* 4. Filtered Listings Grid */}
        <section className="py-14 sm:py-20 bg-transparent">
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8 sm:mb-10 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#2E2118]">
                    {selectedType === 'trip'
                      ? t.catalogTrips
                      : selectedType === 'activity'
                      ? t.catalogActivities
                      : t.catalogAll}
                  </h2>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/50 backdrop-blur-xs text-[#9C4A2F] border border-white/60 text-[10px] font-bold shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#55663A] animate-pulse" />
                    Live Firestore
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#2E2118]/75 mt-1 font-body">
                  {isAr
                    ? `عرض ${filteredListings.length} ${t.catalogShowing}`
                    : `Showing ${filteredListings.length} ${t.catalogShowing}`}
                </p>
              </div>

              {/* Reset Filters if customized */}
              {(selectedType !== 'all' || selectedRegion !== 'all' || selectedActivityCat !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedRegion('all');
                    setSelectedActivityCat('all');
                  }}
                  className="px-3.5 py-1.5 rounded-[10px] text-xs font-semibold text-[#9C4A2F] bg-white/60 backdrop-blur-xs hover:bg-white border border-white/70 transition-colors cursor-pointer font-body shadow-2xs"
                >
                  {t.clearAllFilters}
                </button>
              )}
            </div>

            {/* Loading Skeletons */}
            {isLoadingActivities && listings.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 py-8">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="rounded-[16px] glass-card animate-pulse h-96 flex flex-col justify-between p-4">
                    <div className="bg-[#2E2118]/10 h-48 rounded-[12px] w-full" />
                    <div className="space-y-2 mt-4">
                      <div className="h-4 bg-[#2E2118]/10 rounded w-3/4" />
                      <div className="h-3 bg-[#2E2118]/10 rounded w-1/2" />
                    </div>
                    <div className="h-10 bg-[#2E2118]/10 rounded-[12px] mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              /* Grid of Cards (16px rounded with warm soft shadows & glassmorphism) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredListings.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    currentCurrency={currentCurrency}
                    currentLang={currentLang}
                    isWishlisted={wishlist.some((w) => w.id === item.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onViewDetails={(it) => setSelectedItemForDetails(it)}
                    whatsappNumber={siteSettings.whatsappNumber}
                  />
                ))}
              </div>
            ) : listings.length === 0 ? (
              /* Dedicated Empty State when Database has NO activities at all */
              <div className="text-center py-16 glass-box-elevated rounded-[16px] p-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-[14px] bg-[#9C4A2F]/10 text-[#9C4A2F] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2E2118]">
                  {t.noActivitiesAvailable}
                </h3>
                <p className="text-xs text-[#2E2118]/75 mt-1 font-body">
                  {t.noActivitiesAvailableSub}
                </p>
              </div>
            ) : (
              <div className="text-center py-16 glass-box-elevated rounded-[16px] p-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-[14px] bg-[#9C4A2F]/10 text-[#9C4A2F] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="font-heading font-bold text-base text-[#2E2118]">
                  {t.noFilterResults}
                </h3>
                <p className="text-xs text-[#2E2118]/75 mt-1 font-body">
                  {t.noFilterResultsSub}
                </p>
                <button
                  onClick={() => {
                    setSelectedType('all');
                    setSelectedRegion('all');
                    setSelectedActivityCat('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-[12px] text-xs font-bold text-white bg-[#9C4A2F] hover:bg-[#853C24] cursor-pointer shadow-md transition-all active:scale-95"
                >
                  {t.showAllExpBtn}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* 5. About & Contact Sections wrapped in lazy Suspense */}
        <React.Suspense fallback={<div className="min-h-[160px]" />}>
          {/* About Single Guide Section (Hossain Amalo) */}
          <AboutSection 
            currentLang={currentLang} 
            whatsappNumber={siteSettings.whatsappNumber} 
          />

          {/* Contact & Social Channels Section */}
          <ContactSection 
            currentLang={currentLang} 
            whatsappNumber={siteSettings.whatsappNumber}
            whatsappDisplay={siteSettings.whatsappDisplay}
            facebookUrl={siteSettings.facebookUrl}
            instagramUrl={siteSettings.instagramUrl}
            guideEmail={siteSettings.email}
          />
        </React.Suspense>
      </main>

      {/* 7. Toubkal Footer */}
      <Footer
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        currentCurrency={currentCurrency}
        onCurrencyChange={handleCurrencyChange}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setAdminModalOpen(true)}
        settings={siteSettings}
      />

      {/* Lazy Loaded Modals wrapped in Suspense */}
      <React.Suspense fallback={null}>
        {/* Item Detail Modal */}
        {selectedItemForDetails && (
          <ItemDetailModal
            item={selectedItemForDetails}
            isOpen={!!selectedItemForDetails}
            onClose={() => setSelectedItemForDetails(null)}
            currentCurrency={currentCurrency}
            currentLang={currentLang}
            isWishlisted={wishlist.some((w) => w.id === selectedItemForDetails.id)}
            onToggleWishlist={handleToggleWishlist}
            whatsappNumber={siteSettings.whatsappNumber}
          />
        )}

        {/* Wishlist Drawer */}
        <WishlistDrawer
          isOpen={wishlistDrawerOpen}
          onClose={() => setWishlistDrawerOpen(false)}
          wishlist={wishlist}
          onRemoveItem={handleToggleWishlist}
          onViewDetails={(item) => setSelectedItemForDetails(item)}
          currentCurrency={currentCurrency}
          currentLang={currentLang}
        />

        {/* Admin Dashboard Modal */}
        <AdminDashboardModal
          isOpen={adminModalOpen}
          onClose={() => setAdminModalOpen(false)}
          listings={listings}
          isLoading={isLoadingActivities}
          onAddListing={handleAddListing}
          onUpdateListing={handleUpdateListing}
          onDeleteListing={handleDeleteListing}
          currentLang={currentLang}
          settings={siteSettings}
          onUpdateSettings={updateSiteSettings}
        />
      </React.Suspense>

      {/* 8. Floating Quick-Contact WhatsApp Button (safe-area, z-30, hidden when modal open to never obscure content) */}
      <FloatingWhatsAppButton
        currentLang={currentLang}
        whatsappNumber={siteSettings.whatsappNumber}
        isHidden={Boolean(selectedItemForDetails || wishlistDrawerOpen || adminModalOpen)}
      />
    </div>
  );
}
