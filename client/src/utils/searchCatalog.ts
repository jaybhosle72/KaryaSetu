import { MASTER_SECTORS, MasterSector, MasterSubTrade, MasterServiceItem } from '../data/masterCatalog';

export interface SearchResultService {
  type: 'service';
  service: MasterServiceItem;
  subTrade: MasterSubTrade;
  sector: MasterSector;
}

export interface SearchResultSector {
  type: 'sector';
  sector: MasterSector;
}

export interface SearchCatalogResult {
  services: SearchResultService[];
  sectors: SearchResultSector[];
  totalMatches: number;
}

// Synonyms dictionary to enhance search experience
const SYNONYMS: Record<string, string[]> = {
  electrician: ['electrical', 'electric', 'wiring', 'switch', 'light', 'fan', 'mcb'],
  plumber: ['plumbing', 'tap', 'leak', 'pipe', 'drain', 'basin', 'sink'],
  carpenter: ['carpentry', 'wood', 'furniture', 'door', 'lock', 'table', 'chair'],
  painter: ['painting', 'paint', 'wall', 'waterproofing', 'primer'],
  cleaner: ['cleaning', 'clean', 'sanitization', 'deep clean', 'mop', 'wash'],
  maid: ['housekeeping', 'cook', 'domestic', 'cleaning'],
  ro: ['water purifier', 'filter', 'membrane'],
  ac: ['air conditioner', 'cooling', 'hvac', 'servicing', 'gas refilling'],
  pest: ['pest control', 'termite', 'cockroach', 'bedbug', 'mosquito'],
  driver: ['car', 'driving', 'chauffeur', 'vehicle'],
  gardener: ['gardening', 'garden', 'lawn', 'plants', 'tree', 'pruning'],
  renovation: ['civil', 'construction', 'masonry', 'tiling', 'flooring']
};

export const POPULAR_SEARCH_CHIPS = [
  { label: '⚡ Fan Repair', query: 'fan' },
  { label: '❄️ AC Servicing', query: 'ac' },
  { label: '💧 Tap & Pipe Leak', query: 'leak' },
  { label: '🧹 Deep Cleaning', query: 'cleaning' },
  { label: '🎨 Painting', query: 'painting' },
  { label: '🔨 Carpentry', query: 'carpentry' },
  { label: '🐜 Pest Control', query: 'pest' },
  { label: '🌱 Gardening', query: 'garden' }
];

export function searchCatalog(query: string, maxResults = 12): SearchCatalogResult {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return { services: [], sectors: [], totalMatches: 0 };
  }

  const rawTokens = trimmed.split(/\s+/).filter(Boolean);
  
  // Expand tokens with synonyms
  const expandedTokens = new Set<string>(rawTokens);
  for (const token of rawTokens) {
    if (SYNONYMS[token]) {
      for (const syn of SYNONYMS[token]) {
        expandedTokens.add(syn.toLowerCase());
      }
    }
  }
  const tokenList = Array.from(expandedTokens);

  const matchedServices: SearchResultService[] = [];
  const matchedSectors: SearchResultSector[] = [];
  const seenServiceIds = new Set<string>();
  const seenSectorIds = new Set<string>();

  for (const sector of MASTER_SECTORS) {
    const sectorTitle = sector.title.toLowerCase();
    const sectorShort = sector.shortTitle.toLowerCase();
    const sectorDesc = sector.description.toLowerCase();
    const subTradesListStr = sector.subTradesList.join(' ').toLowerCase();

    // Check sector match
    const sectorMatches = rawTokens.some(t => 
      sectorTitle.includes(t) || 
      sectorShort.includes(t) || 
      subTradesListStr.includes(t)
    );

    if (sectorMatches && !seenSectorIds.has(sector.id)) {
      seenSectorIds.add(sector.id);
      matchedSectors.push({ type: 'sector', sector });
    }

    // Check sub-trades and individual services
    for (const subTrade of sector.subTrades) {
      const subTitle = subTrade.title.toLowerCase();
      const subTagline = (subTrade.tagline || '').toLowerCase();

      for (const service of subTrade.services) {
        if (seenServiceIds.has(service.id)) continue;

        const name = service.name.toLowerCase();
        const desc = service.description.toLowerCase();

        // Check if raw query matches or tokens match
        const exactPhrase = name.includes(trimmed) || desc.includes(trimmed) || subTitle.includes(trimmed);

        const tokenMatch = rawTokens.every(t => 
          name.includes(t) || 
          desc.includes(t) || 
          subTitle.includes(t) || 
          subTagline.includes(t) || 
          sectorTitle.includes(t)
        );

        // Check synonym matches
        const synonymMatch = tokenList.some(t =>
          name.includes(t) || subTitle.includes(t)
        );

        if (exactPhrase || tokenMatch || synonymMatch) {
          seenServiceIds.add(service.id);
          matchedServices.push({
            type: 'service',
            service,
            subTrade,
            sector
          });
        }
      }
    }
  }

  // Rank services: exact phrase match first, then startsWith, then rating
  matchedServices.sort((a, b) => {
    const aName = a.service.name.toLowerCase();
    const bName = b.service.name.toLowerCase();
    
    if (aName === trimmed) return -1;
    if (bName === trimmed) return 1;
    if (aName.startsWith(trimmed) && !bName.startsWith(trimmed)) return -1;
    if (!aName.startsWith(trimmed) && bName.startsWith(trimmed)) return 1;
    if (aName.includes(trimmed) && !bName.includes(trimmed)) return -1;
    if (!aName.includes(trimmed) && bName.includes(trimmed)) return 1;
    return (b.service.rating || 0) - (a.service.rating || 0);
  });

  return {
    services: matchedServices.slice(0, maxResults),
    sectors: matchedSectors.slice(0, 4),
    totalMatches: matchedServices.length + matchedSectors.length
  };
}
