/**
 * Canonical Trade Resolver & Matcher
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

const CANONICAL_TRADES = [
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
];

/**
 * Resolves the primary canonical trade for any booking, service item, or query parameters.
 */
function resolveCanonicalTrade(item = {}) {
  if (!item) return 'General Labour';

  // 1. Explicit trade property
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

  // Distinct trade keyword signatures (ordered carefully to prevent false cross-matching)
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
    text.includes('faucet') ||
    text.includes('tap ') ||
    text.includes('tap repair') ||
    text.includes('drain') ||
    text.includes('blockage') ||
    text.includes('water tank') ||
    text.includes('commode') ||
    text.includes('sanitary') ||
    text.includes('flush') ||
    text.includes('washbasin') ||
    text.includes('water leakage') ||
    text.includes('burst pipe') ||
    text.includes('water pump') ||
    text.includes('sewage')
  ) {
    return 'Plumbing';
  }

  if (
    text.includes('carp') ||
    text.includes('wood') ||
    text.includes('furniture') ||
    text.includes('door repair') ||
    text.includes('window repair') ||
    text.includes('lock ') ||
    text.includes('locksmith') ||
    text.includes('cabinet') ||
    text.includes('wardrobe') ||
    text.includes('latch') ||
    text.includes('hinge')
  ) {
    return 'Carpentry';
  }

  if (
    text.includes('paint') ||
    text.includes('whitewash') ||
    text.includes('distemper') ||
    text.includes('wall color') ||
    text.includes('waterproof coat') ||
    text.includes('texture paint')
  ) {
    return 'Painting';
  }

  if (
    text.includes('mason') ||
    text.includes('brick') ||
    text.includes('plaster') ||
    text.includes('civil') ||
    text.includes('concrete') ||
    text.includes('tiling') ||
    text.includes('flooring')
  ) {
    return 'Masonry';
  }

  if (
    text.includes('deep clean') ||
    text.includes('sanitiz') ||
    text.includes('pest') ||
    text.includes('disinfect') ||
    text.includes('housekeep') ||
    text.includes('maid') ||
    text.includes('cleaning')
  ) {
    return 'Deep Cleaning';
  }

  if (
    text.includes('appliance') ||
    text.includes('refrigerat') ||
    text.includes('fridge') ||
    text.includes('washing machine') ||
    text.includes('microwave') ||
    text.includes('oven') ||
    text.includes('chimney') ||
    text.includes('geyser') ||
    text.includes('ac repair') ||
    text.includes('air condition')
  ) {
    return 'Appliance Repair';
  }

  if (
    text.includes('garden') ||
    text.includes('lawn') ||
    text.includes('plant') ||
    text.includes('grass')
  ) {
    return 'Gardening';
  }

  if (
    text.includes('caregiver') ||
    text.includes('nurse') ||
    text.includes('elderly') ||
    text.includes('patient care')
  ) {
    return 'Caregiver';
  }

  if (
    text.includes('driver') ||
    text.includes('chauffeur') ||
    text.includes('car driver')
  ) {
    return 'Driver';
  }

  // 3. Fallback to direct category match if valid
  if (item.serviceCategory) {
    const directCat = normalizeTrade(item.serviceCategory);
    if (directCat) return directCat;
  }

  return 'General Labour';
}

/**
 * Normalizes input string to one of the canonical trades if matched.
 */
function normalizeTrade(str = '') {
  const s = String(str).toLowerCase().trim();
  if (!s) return null;
  for (const trade of CANONICAL_TRADES) {
    if (s === trade.toLowerCase() || s.includes(trade.toLowerCase()) || trade.toLowerCase().includes(s)) {
      return trade;
    }
  }
  return null;
}

/**
 * Strict Trade Matcher: Determines whether a worker is qualified to service a given booking.
 * 
 * An Electrical request will return TRUE ONLY for an Electrician.
 * A Plumbing request will return TRUE ONLY for a Plumber.
 */
function isTradeMatch(workerTrade = '', bookingTradeOrItem = '', workerSubTrades = []) {
  if (!workerTrade) return false;

  const resolvedBookingTrade = typeof bookingTradeOrItem === 'string'
    ? (normalizeTrade(bookingTradeOrItem) || resolveCanonicalTrade({ serviceCategory: bookingTradeOrItem }))
    : resolveCanonicalTrade(bookingTradeOrItem);

  const normalizedWorkerTrade = normalizeTrade(workerTrade) || workerTrade.trim();

  // Direct trade equality
  if (normalizedWorkerTrade.toLowerCase() === resolvedBookingTrade.toLowerCase()) {
    return true;
  }

  // Worker registered sub-trades (e.g. Multi-skilled worker having explicit secondary certification)
  if (Array.isArray(workerSubTrades) && workerSubTrades.length > 0) {
    const subTradeMatch = workerSubTrades.some(st => {
      const normSub = normalizeTrade(st) || st.toLowerCase().trim();
      return normSub.toLowerCase() === resolvedBookingTrade.toLowerCase();
    });
    if (subTradeMatch) return true;
  }

  return false;
}

module.exports = {
  CANONICAL_TRADES,
  resolveCanonicalTrade,
  normalizeTrade,
  isTradeMatch
};
