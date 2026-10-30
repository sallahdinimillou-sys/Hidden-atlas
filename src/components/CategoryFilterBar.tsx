import React from 'react';
import { Mountain, Flame, Sparkles, Sun, Wind, LayoutGrid, Compass } from 'lucide-react';
import { ItemType, Region, ActivityCategory, LanguageCode } from '../types';
import { TRANSLATIONS } from '../utils/translations';

interface CategoryFilterBarProps {
  currentLang: LanguageCode;
  selectedType: ItemType | 'all';
  onSelectType: (type: ItemType | 'all') => void;
  selectedRegion: Region;
  onSelectRegion: (region: Region) => void;
  selectedActivityCat: ActivityCategory | 'all';
  onSelectActivityCat: (cat: ActivityCategory | 'all') => void;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  currentLang,
  selectedType,
  onSelectType,
  selectedRegion,
  onSelectRegion,
  selectedActivityCat,
  onSelectActivityCat
}) => {
  const t = TRANSLATIONS[currentLang];
  const isAr = currentLang === 'ar';

  const typeTabs: { id: ItemType | 'all'; label: string; icon: React.ReactNode; countLabel: string }[] = [
    { id: 'all', label: t.tabAll, icon: <LayoutGrid className="w-4 h-4 shrink-0" />, countLabel: 'All Tours' },
    { id: 'trip', label: t.tabTrips, icon: <Mountain className="w-4 h-4 shrink-0" />, countLabel: 'Toubkal Treks' },
    { id: 'activity', label: t.tabActivities, icon: <Flame className="w-4 h-4 text-[#C98B4B] shrink-0" />, countLabel: 'Guided Adventures' },
  ];

  const regions: { id: Region; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: isAr ? 'كل المناطق' : 'All Regions', icon: <Sparkles className="w-3.5 h-3.5 shrink-0" /> },
    { id: 'atlas-mountains', label: isAr ? 'جبل توبقال والأطلس الكبير' : 'Mount Toubkal & High Atlas', icon: <Mountain className="w-3.5 h-3.5 text-[#9C4A2F] shrink-0" /> },
    { id: 'sahara-desert', label: isAr ? 'الصحراء الكبرى ومرزوكة' : 'Sahara Desert & Merzouga', icon: <Sun className="w-3.5 h-3.5 text-[#C98B4B] shrink-0" /> },
    { id: 'essaouira', label: isAr ? 'الصويرة وساحل المحيط' : 'Essaouira Coast', icon: <Wind className="w-3.5 h-3.5 text-[#55663A] shrink-0" /> },
    { id: 'paradise-valley', label: isAr ? 'وادي الجنة وأكادير' : 'Paradise Valley & Agadir', icon: <Compass className="w-3.5 h-3.5 text-[#C98B4B] shrink-0" /> },
  ];

  const activityCategories: { id: ActivityCategory | 'all'; label: string }[] = [
    { id: 'all', label: t.allActivities },
    { id: 'mountain-trekking', label: t.catMountainTrekking },
    { id: 'cultural-day-trips', label: t.catCultural },
    { id: 'desert-tours', label: t.catDesertTours },
    { id: 'camel-riding', label: t.catCamelRiding },
    { id: 'horseback', label: t.catHorseback },
    { id: 'quad-buggy', label: t.catQuadBuggy },
  ];

  return (
    <div id="category-filter-section" className="glass-panel-subtle border-y border-white/50 shadow-xs py-4 sm:py-5">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3 sm:space-y-4">
        {/* Main Category Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <div 
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto no-scrollbar scroll-smooth -mx-1 px-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {typeTabs.map((tab) => {
              const isSelected = selectedType === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-type-${tab.id}`}
                  onClick={() => onSelectType(tab.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-[12px] text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 min-h-[40px] sm:min-h-[44px] cursor-pointer font-body ${
                    isSelected
                      ? 'bg-[#9C4A2F] text-white shadow-md shadow-[#9C4A2F]/25 scale-[1.02]'
                      : 'bg-white/50 backdrop-blur-md text-[#2E2118] border border-white/60 hover:bg-white/80 hover:text-[#9C4A2F] active:scale-98'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-[#9C4A2F]'}>{tab.icon}</span>
                  <span className="leading-none">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="text-xs text-[#2E2118]/80 font-medium hidden md:flex items-center gap-1.5 font-body">
            <span className="inline-block w-2 h-2 rounded-full bg-[#55663A] animate-pulse"></span>
            <span>{isAr ? 'مرشد جبلي محلي معتمد • رحلات آمنة' : 'Certified Local Toubkal Mountain Guide'}</span>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div 
          className="pt-2 border-t border-white/40 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <span className="text-[11px] sm:text-xs font-bold text-[#2E2118]/70 shrink-0 me-1 font-body">
            {t.quickFiltersLabel}
          </span>
          {regions.map((reg) => {
            const isSelected = selectedRegion === reg.id;
            return (
              <button
                key={reg.id}
                id={`filter-reg-${reg.id}`}
                onClick={() => onSelectRegion(reg.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-xs font-semibold transition-all whitespace-nowrap shrink-0 min-h-[32px] cursor-pointer font-body ${
                  isSelected
                    ? 'bg-[#2E2118] text-white font-bold shadow-xs'
                    : 'bg-white/50 backdrop-blur-xs text-[#2E2118]/85 border border-white/50 hover:bg-white/80 hover:text-[#9C4A2F]'
                }`}
              >
                {reg.icon}
                <span>{reg.label}</span>
              </button>
            );
          })}
        </div>

        {/* Activity Specific Sub-Categories when in Activity or All tab */}
        {(selectedType === 'activity' || selectedType === 'all') && (
          <div 
            className="pt-2 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] -mx-1 px-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <span className="text-[11px] sm:text-xs font-bold text-[#2E2118]/70 shrink-0 me-1 font-body">
              {t.activityTypeLabel}
            </span>
            {activityCategories.map((act) => {
              const isSelected = selectedActivityCat === act.id;
              return (
                <button
                  key={act.id}
                  id={`filter-act-${act.id}`}
                  onClick={() => onSelectActivityCat(act.id)}
                  className={`px-3 py-1 rounded-[8px] font-semibold transition-all whitespace-nowrap shrink-0 min-h-[28px] cursor-pointer font-body ${
                    isSelected
                      ? 'bg-[#C98B4B]/30 text-[#9C4A2F] font-bold border border-[#C98B4B]/50 shadow-2xs'
                      : 'bg-white/45 backdrop-blur-xs text-[#2E2118]/80 hover:bg-white/75 border border-white/50'
                  }`}
                >
                  <span>{act.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
