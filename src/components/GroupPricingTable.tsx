import React from 'react';
import { Users, Sparkles, Check } from 'lucide-react';
import { GroupPricingTier, Currency, LanguageCode } from '../types';
import { formatGroupPricingRange, formatGroupPricingPrice } from '../utils/groupPricing';

interface GroupPricingTableProps {
  tiers?: GroupPricingTier[];
  currency?: Currency;
  currentLang?: LanguageCode;
  selectedParticipants?: number;
  onSelectTier?: (tier: GroupPricingTier) => void;
  className?: string;
}

export const GroupPricingTable: React.FC<GroupPricingTableProps> = ({
  tiers,
  currency = 'EUR' as Currency,
  currentLang = 'en' as LanguageCode,
  selectedParticipants,
  onSelectTier,
  className = ''
}) => {
  if (!tiers || !Array.isArray(tiers) || tiers.length === 0) {
    return null;
  }

  // Sort ascending by min
  const sortedTiers = [...tiers].sort((a, b) => (Number(a.min) || 1) - (Number(b.min) || 1));

  const isAr = currentLang === 'ar';

  const labels = {
    title: isAr ? 'أسعار المجموعات' : currentLang === 'fr' ? 'Tarification de groupe' : currentLang === 'es' ? 'Precios por grupo' : currentLang === 'de' ? 'Gruppenpreise' : currentLang === 'it' ? 'Prezzi di gruppo' : 'Group Pricing',
    participantsHeader: isAr ? 'عدد المشاركين' : currentLang === 'fr' ? 'Nombre de participants' : currentLang === 'es' ? 'Número de participantes' : currentLang === 'de' ? 'Teilnehmeranzahl' : currentLang === 'it' ? 'Numero di partecipanti' : 'Participants Number',
    priceHeader: isAr ? 'السعر' : currentLang === 'fr' ? 'Tarif' : currentLang === 'es' ? 'Precio' : currentLang === 'de' ? 'Preis' : currentLang === 'it' ? 'Prezzo' : 'Price',
    selectedBadge: isAr ? 'فئتك المحددة' : currentLang === 'fr' ? 'Votre sélection' : currentLang === 'es' ? 'Seleccionado' : currentLang === 'de' ? 'Ausgewählt' : currentLang === 'it' ? 'Selezionato' : 'Your Tier'
  };

  return (
    <div className={`space-y-2.5 font-body ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-heading font-bold text-sm sm:text-base text-[#2E2118] flex items-center gap-2">
          <div className="w-6 h-6 rounded-[8px] bg-[#9C4A2F]/10 text-[#9C4A2F] flex items-center justify-center">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span>{labels.title}</span>
        </h4>
        <span className="text-[11px] text-[#2E2118]/65 font-medium">
          {sortedTiers.length} {isAr ? 'فئات سعرية' : currentLang === 'fr' ? 'paliers disponibles' : 'tiered rates'}
        </span>
      </div>

      {/* Modern Group Pricing Table */}
      <div className="rounded-[14px] border border-[#C98B4B]/30 overflow-hidden bg-white shadow-2xs">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-[#2E2118]/5 border-b border-[#C98B4B]/20 text-[#2E2118]">
              <th scope="col" className={`py-2.5 sm:py-3 px-2.5 sm:px-4 font-heading font-bold text-[11px] sm:text-xs text-[#2E2118] ${isAr ? 'text-right' : 'text-left'}`}>
                {labels.participantsHeader}
              </th>
              <th scope="col" className={`py-2.5 sm:py-3 px-2.5 sm:px-4 font-heading font-bold text-[11px] sm:text-xs text-[#9C4A2F] ${isAr ? 'text-left' : 'text-right'}`}>
                {labels.priceHeader}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-[#C98B4B]/25">
            {sortedTiers.map((tier, idx) => {
              const min = Number(tier.min) || 1;
              const hasMax = tier.max !== undefined && tier.max !== null && (tier.max as unknown) !== '' && !isNaN(Number(tier.max));
              const max = hasMax ? Number(tier.max) : null;
              
              const isCurrentSelected = selectedParticipants !== undefined && (
                max !== null 
                  ? selectedParticipants >= min && selectedParticipants <= max
                  : selectedParticipants >= min
              );

              return (
                <tr
                  key={idx}
                  onClick={() => onSelectTier && onSelectTier(tier)}
                  className={`transition-colors ${
                    onSelectTier ? 'cursor-pointer' : ''
                  } ${
                    isCurrentSelected 
                      ? 'bg-[#9C4A2F]/10 text-[#2E2118] font-semibold' 
                      : 'hover:bg-[#F8F5F0]/80'
                  }`}
                >
                  <td className={`py-2.5 sm:py-3 px-2.5 sm:px-4 text-[#2E2118] text-xs sm:text-sm ${isAr ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {isCurrentSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9C4A2F] shrink-0 animate-pulse" />
                      )}
                      <span>{formatGroupPricingRange(tier, currentLang)}</span>
                      {isCurrentSelected && (
                        <span className="hidden xs:inline-flex items-center gap-0.5 text-[10px] font-bold text-[#9C4A2F] bg-[#9C4A2F]/15 px-2 py-0.5 rounded-full">
                          <Check className="w-2.5 h-2.5" />
                          <span>{labels.selectedBadge}</span>
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`py-2.5 sm:py-3 px-2.5 sm:px-4 font-bold text-xs sm:text-sm text-[#9C4A2F] whitespace-nowrap ${isAr ? 'text-left' : 'text-right'}`}>
                    {formatGroupPricingPrice(tier.pricePerPerson, currency, currentLang)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
