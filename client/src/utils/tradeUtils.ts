/**
 * Client-side Canonical Trade Resolver & Matcher
 * 
 * Ensures strict trade routing:
 * - Electrical requests -> Electrician only
 * - Plumbing requests -> Plumber only
 * - Carpentry requests -> Carpenter only
 * - Painting requests -> Painter only
 * - Masonry requests -> Mason only
 * - Deep Cleaning requests -> Cleaning technician only
 * - Appliance Repair requests -> Appliance technician only
 * - Gardening requests -> Gardener only
 * - Caregiver requests -> Caregiver only
 * - Driver requests -> Driver only
 */

export const CANONICAL_TRADES = [
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Painting',
  'Masonry',
  'Deep Cleaning',
  'Appliance Repair',
  'Gardening',
  'Caregiver',
  'Driver',
  'General Labour'
] as const;

export type CanonicalTrade = typeof CANONICAL_TRADES[number];

/**
 * Normalizes input string to one of the canonical trades if matched.
 */
export function normalizeTrade(str?: string | null): CanonicalTrade | null {
  if (!str) return null;
  const s = String(str).toLowerCase().trim();
  if (!s) return null;

  for (const trade of CANONICAL_TRADES) {
    if (s === trade.toLowerCase() || s.includes(trade.toLowerCase()) || trade.toLowerCase().includes(s)) {
      return trade;
    }
  }

  // Common aliases
  if (s.includes('electr') || s.includes('wireman')) return 'Electrical';
  if (s.includes('plumb') || s.includes('pipe') || s.includes('leak') || s.includes('tap') || s.includes('drain')) return 'Plumbing';
  if (s.includes('carpent') || s.includes('wood') || s.includes('furnitur')) return 'Carpentry';
  if (s.includes('paint') || s.includes('polish') || s.includes('whitewash')) return 'Painting';
  if (s.includes('mason') || s.includes('brick') || s.includes('cement') || s.includes('tile')) return 'Masonry';
  if (s.includes('clean') || s.includes('sanitiz') || s.includes('housekeep') || s.includes('maid')) return 'Deep Cleaning';
  if (s.includes('appliance') || s.includes('ac ') || s.includes('hvac') || s.includes('refrigerat') || s.includes('ro service')) return 'Appliance Repair';
  if (s.includes('garden') || s.includes('lawn') || s.includes('landscap') || s.includes('plant')) return 'Gardening';
  if (s.includes('care') || s.includes('nurse') || s.includes('elder') || s.includes('attendant')) return 'Caregiver';
  if (s.includes('driv') || s.includes('chauffeur') || s.includes('cab') || s.includes('vehicle')) return 'Driver';

  return null;
}

/**
 * Resolves the canonical trade for a booking or service request object.
 */
export function resolveCanonicalTrade(item?: any): CanonicalTrade {
  if (!item) return 'General Labour';

  // 1. Direct trade attribute
  if (typeof item.trade === 'string' && item.trade.trim()) {
    const direct = normalizeTrade(item.trade.trim());
    if (direct) return direct;
  }

  // 2. Scan combined textual fields
  const text = [
    item.subTrade || '',
    item.serviceCategory || '',
    item.workerType || '',
    item.notes || '',
    item.emergencyType || '',
    item.name || '',
    item.serviceName || ''
  ].join(' ').toLowerCase();

  // Strict keyword signatures
  if (
    text.includes('electr') ||
    text.includes('wiring') ||
    text.includes('wireman') ||
    text.includes('switch') ||
    text.includes('socket') ||
    text.includes('mcb') ||
    text.includes('inverter') ||
    text.includes('short circuit') ||
    text.includes('spark') ||
    text.includes('ceiling fan') ||
    text.includes('light install') ||
    text.includes('light repair') ||
    text.includes('fuse')
  ) {
    return 'Electrical';
  }

  if (
    text.includes('plumb') ||
    text.includes('pipe') ||
    text.includes('tap') ||
    text.includes('faucet') ||
    text.includes('leak') ||
    text.includes('drain') ||
    text.includes('sewer') ||
    text.includes('basin') ||
    text.includes('toilet') ||
    text.includes('flush') ||
    text.includes('geyser install') ||
    text.includes('water tank') ||
    text.includes('plumbing')
  ) {
    return 'Plumbing';
  }

  if (
    text.includes('carpent') ||
    text.includes('wood') ||
    text.includes('furniture') ||
    text.includes('door lock') ||
    text.includes('hinge') ||
    text.includes('wardrobe') ||
    text.includes('cabinet') ||
    text.includes('drill') ||
    text.includes('shelf')
  ) {
    return 'Carpentry';
  }

  if (
    text.includes('paint') ||
    text.includes('whitewash') ||
    text.includes('distemper') ||
    text.includes('primer') ||
    text.includes('putty') ||
    text.includes('waterproof') ||
    text.includes('polish')
  ) {
    return 'Painting';
  }

  if (
    text.includes('mason') ||
    text.includes('brick') ||
    text.includes('cement') ||
    text.includes('tile') ||
    text.includes('plaster') ||
    text.includes('flooring') ||
    text.includes('grouting')
  ) {
    return 'Masonry';
  }

  if (
    text.includes('clean') ||
    text.includes('sanitiz') ||
    text.includes('maid') ||
    text.includes('housekeep') ||
    text.includes('disinfect') ||
    text.includes('pest')
  ) {
    return 'Deep Cleaning';
  }

  if (
    text.includes('appliance') ||
    text.includes('ac ') ||
    text.includes('air condition') ||
    text.includes('refrigerat') ||
    text.includes('washing machine') ||
    text.includes('microwave') ||
    text.includes('chimney') ||
    text.includes('ro water') ||
    text.includes('water purifier')
  ) {
    return 'Appliance Repair';
  }

  if (
    text.includes('garden') ||
    text.includes('lawn') ||
    text.includes('plant') ||
    text.includes('tree') ||
    text.includes('trimming') ||
    text.includes('horticult')
  ) {
    return 'Gardening';
  }

  if (
    text.includes('care') ||
    text.includes('nurse') ||
    text.includes('elder') ||
    text.includes('patient') ||
    text.includes('babysit')
  ) {
    return 'Caregiver';
  }

  if (
    text.includes('driver') ||
    text.includes('drive') ||
    text.includes('chauffeur') ||
    text.includes('car driver')
  ) {
    return 'Driver';
  }

  return 'General Labour';
}

/**
 * Strict Trade Matcher: Checks if worker's certified trade matches booking requirement.
 */
export function isTradeMatch(
  workerTrade: string = '',
  bookingTradeOrItem: any = '',
  workerSubTrades: string[] = []
): boolean {
  if (!workerTrade) return false;

  const resolvedBookingTrade = typeof bookingTradeOrItem === 'string'
    ? (normalizeTrade(bookingTradeOrItem) || resolveCanonicalTrade({ serviceCategory: bookingTradeOrItem }))
    : resolveCanonicalTrade(bookingTradeOrItem);

  const normalizedWorkerTrade = normalizeTrade(workerTrade) || workerTrade.trim();

  // Direct trade equality
  if (normalizedWorkerTrade.toLowerCase() === resolvedBookingTrade.toLowerCase()) {
    return true;
  }

  // Worker secondary certified sub-trades
  if (Array.isArray(workerSubTrades) && workerSubTrades.length > 0) {
    const subMatch = workerSubTrades.some(st => {
      const normSub = normalizeTrade(st) || st.toLowerCase().trim();
      return normSub.toLowerCase() === resolvedBookingTrade.toLowerCase();
    });
    if (subMatch) return true;
  }

  return false;
}

/**
 * Badge styling helper for trade display
 */
export function getTradeBadgeStyle(trade: string): { bg: string; text: string; border: string } {
  const norm = normalizeTrade(trade) || 'General Labour';
  switch (norm) {
    case 'Electrical':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'Plumbing':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' };
    case 'Carpentry':
      return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' };
    case 'Painting':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' };
    case 'Masonry':
      return { bg: 'bg-stone-100 dark:bg-stone-900', text: 'text-stone-700 dark:text-stone-300', border: 'border-stone-300 dark:border-stone-700' };
    case 'Deep Cleaning':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'Appliance Repair':
      return { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' };
    case 'Gardening':
      return { bg: 'bg-green-50 dark:bg-green-950/40', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' };
    case 'Caregiver':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' };
    case 'Driver':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' };
    default:
      return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' };
  }
}
