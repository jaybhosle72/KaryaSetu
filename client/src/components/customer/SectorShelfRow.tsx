import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { MasterSector, MasterServiceItem } from '../../data/masterCatalog';
import { Language, translations, getTranslatedSectorTitle, getTranslatedServiceName, getTranslatedDuration } from '../../i18n/translations';

interface SectorShelfRowProps {
  sector: MasterSector;
  onSeeAll: (sectorId: string) => void;
  onSelectService: (sectorId: string, service: MasterServiceItem) => void;
  currentLanguage?: Language;
}

import { getCuratedServiceImage } from '../../data/serviceImages';

export const getServiceImage = (serviceId: string, serviceName: string, sectorId: string = ''): string => {
  return getCuratedServiceImage(serviceId, serviceName, sectorId);
};

export const SectorShelfRow: React.FC<SectorShelfRowProps> = ({
  sector,
  onSeeAll,
  onSelectService,
  currentLanguage = 'en'
}) => {
  const t = translations[currentLanguage] || translations.en;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Gather representative sub-services across all subTrades to ensure shelves are well-populated
  const featuredServices: MasterServiceItem[] = [];
  sector.subTrades.forEach((subTrade) => {
    if (subTrade.services) {
      subTrade.services.forEach((s) => {
        if (!featuredServices.find(item => item.id === s.id) && featuredServices.length < 10) {
          featuredServices.push(s);
        }
      });
    }
  });

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 py-3 border-b border-slate-100 last:border-0">
      {/* 1. First Main Service Group Name + See All Option */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {getTranslatedSectorTitle(sector.id, sector.title, currentLanguage)}
          </h2>
          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {sector.subTrades.length} {t.portal.tradesCount}
          </span>
        </div>

        {/* Option for See All */}
        <button
          type="button"
          onClick={() => onSeeAll(sector.id)}
          className="px-3.5 py-1 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-xs font-bold text-purple-600 shadow-2xs transition cursor-pointer"
        >
          {t.portal.seeAll}
        </button>
      </div>

      {/* 2. Sub Services Horizontal Shelf (Layout matching Reference Photo) */}
      <div className="relative group/shelf">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto pb-3 pt-1 scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {featuredServices.map((svc) => {
            const imageUrl = svc.image || getServiceImage(svc.id, svc.name, sector.id);

            return (
              <div
                key={svc.id}
                onClick={() => onSelectService(sector.id, svc)}
                className="w-40 sm:w-48 flex-shrink-0 group/card cursor-pointer space-y-2 select-none"
              >
                {/* Sub Service Card Image with optional badge */}
                <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 relative shadow-2xs group-hover/card:shadow-md transition">
                  <img
                    src={imageUrl}
                    alt={svc.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover/card:scale-105 transition duration-300"
                  />
                  {svc.instant && (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                      {t.portal.instant}
                    </span>
                  )}
                  {svc.price >= 800 && !svc.instant && (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                      {t.portal.off}
                    </span>
                  )}
                </div>

                {/* Sub Service Name */}
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover/card:text-purple-700 transition min-h-[2.4rem]">
                  {getTranslatedServiceName(svc.name, currentLanguage)}
                </h3>

                {/* Sub Service Rating & Duration */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="text-slate-800 font-bold flex items-center gap-0.5">
                    ★ {svc.rating}
                  </span>
                  <span>•</span>
                  <span>{svc.instant ? t.portal.instant : getTranslatedDuration(svc.duration, currentLanguage)}</span>
                </div>

                {/* Sub Service Price */}
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    ₹{svc.price.toLocaleString('en-IN')}
                  </span>
                  {svc.price >= 800 && (
                    <span className="text-[11px] text-slate-400 line-through">
                      ₹{Math.round(svc.price * 1.15).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Right Scroll Arrow Button (Just like second photo) */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute -right-2 sm:-right-3 top-[38%] -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center font-bold text-sm z-10 cursor-pointer hover:scale-110 transition hidden sm:flex"
        >
          ➔
        </button>
      </div>
    </div>
  );
};
