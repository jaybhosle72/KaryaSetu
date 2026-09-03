import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { MasterSector, MasterServiceItem } from '../../data/masterCatalog';

interface SectorShelfRowProps {
  sector: MasterSector;
  onSeeAll: (sectorId: string) => void;
  onSelectService: (sectorId: string, service: MasterServiceItem) => void;
}

// Curated high-resolution images tailored to specific trade services
export const getServiceImage = (serviceId: string, serviceName: string, sectorId: string): string => {
  const s = serviceName.toLowerCase();
  
  // Electrical
  if (s.includes('fan')) return 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=500&q=80';
  if (s.includes('switch') || s.includes('socket')) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=500&q=80';
  if (s.includes('wire') || s.includes('wiring')) return 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80';
  if (s.includes('light') || s.includes('mcb') || s.includes('inverter') || s.includes('fault') || s.includes('electrician')) return 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=500&q=80';

  // Plumbing
  if (s.includes('drain') || s.includes('blockage')) return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80';
  if (s.includes('tap') || s.includes('faucet') || s.includes('leak') || s.includes('plumb')) return 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=500&q=80';
  if (s.includes('pump') || s.includes('water tank')) return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=500&q=80';

  // Carpentry
  if (s.includes('carpent') || s.includes('furniture') || s.includes('door') || s.includes('wood') || s.includes('table')) return 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=500&q=80';
  if (s.includes('wardrobe') || s.includes('cabinet') || s.includes('bed')) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80';

  // Painting & Civil
  if (s.includes('paint')) return 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=500&q=80';
  if (s.includes('mason') || s.includes('brick') || s.includes('plaster') || s.includes('wall repair')) return 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=500&q=80';
  if (s.includes('tile') || s.includes('floor') || s.includes('marble')) return 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=500&q=80';

  // Appliances
  if (s.includes('water purifier') || s.includes('ro') || s.includes('filter')) return 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=500&q=80';
  if (s.includes('geyser') || s.includes('water heater')) return 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=500&q=80';
  if (s.includes('ac') || s.includes('air conditioner') || s.includes('hvac')) return 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=500&q=80';
  if (s.includes('microwave') || s.includes('oven')) return 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=500&q=80';
  if (s.includes('tv') || s.includes('television')) return 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=80';
  if (s.includes('washing machine')) return 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=500&q=80';
  if (s.includes('refrigerator') || s.includes('fridge')) return 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=500&q=80';

  // Cleaning
  if (s.includes('bathroom') && s.includes('clean')) return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=500&q=80';
  if (s.includes('kitchen') && s.includes('clean')) return 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=500&q=80';
  if (s.includes('sofa') || s.includes('fabric')) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=500&q=80';
  if (s.includes('clean') || s.includes('deep clean') || s.includes('sanitiz')) return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80';

  // Gardening
  if (s.includes('lawn') || s.includes('mow')) return 'https://images.unsplash.com/photo-1592417817098-8f3d69104a49?auto=format&fit=crop&w=500&q=80';
  if (s.includes('garden') || s.includes('plant') || s.includes('prun') || s.includes('tree')) return 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=80';

  // Care
  if (s.includes('elder') || s.includes('patient') || s.includes('care')) return 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=500&q=80';
  if (s.includes('cook') || s.includes('chef') || s.includes('meal')) return 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=500&q=80';
  if (s.includes('baby') || s.includes('child')) return 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=500&q=80';

  // Transport
  if (s.includes('driver')) return 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=500&q=80';
  if (s.includes('car wash') || s.includes('vehicle')) return 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=500&q=80';
  if (s.includes('shift') || s.includes('tempo') || s.includes('packers')) return 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=500&q=80';

  // Digital
  if (s.includes('laptop') || s.includes('computer') || s.includes('pc')) return 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=500&q=80';
  if (s.includes('mobile') || s.includes('phone')) return 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=500&q=80';
  if (s.includes('wifi') || s.includes('network') || s.includes('router')) return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=500&q=80';
  if (s.includes('cctv')) return 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&q=80';

  // Emergency
  if (s.includes('lock') || s.includes('key')) return 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=500&q=80';
  return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=500&q=80';
};

export const SectorShelfRow: React.FC<SectorShelfRowProps> = ({
  sector,
  onSeeAll,
  onSelectService
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Gather representative sub-services from across the sector's subTrades
  const featuredServices: MasterServiceItem[] = [];
  sector.subTrades.forEach((subTrade) => {
    if (subTrade.services && subTrade.services.length > 0) {
      featuredServices.push(subTrade.services[0]);
      if (subTrade.services.length > 1 && featuredServices.length < 9) {
        featuredServices.push(subTrade.services[1]);
      }
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
            {sector.title}
          </h2>
          <span className="text-[10px] font-extrabold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {sector.subTrades.length} Trades
          </span>
        </div>

        {/* Option for See All */}
        <button
          type="button"
          onClick={() => onSeeAll(sector.id)}
          className="px-3.5 py-1 rounded-lg border border-purple-200 bg-white hover:bg-purple-50 text-xs font-bold text-purple-600 shadow-2xs transition cursor-pointer"
        >
          See all
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
                      Instant
                    </span>
                  )}
                  {svc.price >= 800 && !svc.instant && (
                    <span className="absolute top-2 left-2 bg-emerald-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow-xs">
                      10% OFF
                    </span>
                  )}
                </div>

                {/* Sub Service Name */}
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 line-clamp-2 leading-snug group-hover/card:text-purple-700 transition min-h-[2.4rem]">
                  {svc.name}
                </h3>

                {/* Sub Service Rating & Duration */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="text-slate-800 font-bold flex items-center gap-0.5">
                    ★ {svc.rating}
                  </span>
                  <span>•</span>
                  <span>{svc.instant ? 'Instant' : svc.duration}</span>
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
