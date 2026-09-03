/**
 * Cooperative Geo-Location AI Matching Engine
 * 
 * Implements:
 * 1. Haversine geo-distance calculation (km)
 * 2. Pune locality coordinate resolution
 * 3. Worker Matching Score (Solo Service):
 *    - Skill Match: 40%
 *    - Distance: 25%
 *    - Availability: 20%
 *    - Reliability: 10%
 *    - Experience: 5%
 *    (Emergency Override: Distance 40%, Availability 40%, Skill 20%)
 * 4. Contractor Matching Score (Level 1: Customer -> Contractor):
 *    - Project Capability: 30%
 *    - Location / Proximity: 25%
 *    - Available Workforce: 20%
 *    - Experience: 15%
 *    - Rating: 10%
 * 5. Level 2 Proximity Sorting (Contractor -> Workers)
 */

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 2.5; // fallback
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Map major Pune localities to accurate GPS coordinates
const PUNE_LOCALITY_COORDS = {
  'kothrud': { lat: 18.5074, lng: 73.8077, area: 'Kothrud' },
  'baner': { lat: 18.5590, lng: 73.7868, area: 'Baner' },
  'hinjewadi': { lat: 18.5987, lng: 73.7607, area: 'Hinjewadi' },
  'hinjawadi': { lat: 18.5987, lng: 73.7607, area: 'Hinjewadi' },
  'wakad': { lat: 18.5987, lng: 73.7607, area: 'Wakad' },
  'shivajinagar': { lat: 18.5308, lng: 73.8475, area: 'Shivajinagar' },
  'karve nagar': { lat: 18.4912, lng: 73.8185, area: 'Karve Nagar' },
  'hadapsar': { lat: 18.5089, lng: 73.9260, area: 'Hadapsar' },
  'magarpatta': { lat: 18.5089, lng: 73.9260, area: 'Magarpatta' },
  'viman nagar': { lat: 18.5679, lng: 73.9143, area: 'Viman Nagar' },
  'aundh': { lat: 18.5580, lng: 73.8075, area: 'Aundh' },
  'bavdhan': { lat: 18.5158, lng: 73.7707, area: 'Bavdhan' },
  'pashan': { lat: 18.5414, lng: 73.7929, area: 'Pashan' },
  'pimpri': { lat: 18.6298, lng: 73.7997, area: 'Pimpri' },
  'chinchwad': { lat: 18.6298, lng: 73.7997, area: 'Chinchwad' }
};

function resolveAreaCoordinates(addressOrArea, defaultCoords = { lat: 18.5074, lng: 73.8077, area: 'Kothrud' }) {
  if (!addressOrArea) return defaultCoords;
  if (typeof addressOrArea === 'object' && addressOrArea.lat && addressOrArea.lng) {
    return addressOrArea;
  }
  const text = String(addressOrArea).toLowerCase();
  for (const [key, coords] of Object.entries(PUNE_LOCALITY_COORDS)) {
    if (text.includes(key)) {
      return coords;
    }
  }
  return defaultCoords;
}

// Calculate 5-factor Worker Matching Score
function calculateWorkerMatchScore(worker, query, customerCoords) {
  const { serviceCategory = '', subTrade = '', isEmergency = false } = query;
  const wLat = worker.location?.lat || 18.5204;
  const wLng = worker.location?.lng || 73.8567;
  const cLat = customerCoords?.lat || 18.5074;
  const cLng = customerCoords?.lng || 73.8077;

  const distKm = calculateDistanceKm(cLat, cLng, wLat, wLng);

  // 1. Skill Match (40%)
  let rawSkill = 70;
  const subTradeLower = (subTrade || '').toLowerCase();
  const categoryLower = (serviceCategory || '').toLowerCase();
  const workerTrade = (worker.trade || '').toLowerCase();

  if (workerTrade === categoryLower || categoryLower.includes(workerTrade) || workerTrade.includes(categoryLower)) {
    rawSkill = 85;
  }
  if (worker.subTrades && worker.subTrades.some(st => subTradeLower.includes(st.toLowerCase()) || st.toLowerCase().includes(subTradeLower))) {
    rawSkill = 95;
  }
  if (worker.verifiedSkills && worker.verifiedSkills.length > 0) {
    rawSkill = Math.min(100, rawSkill + 5);
  }

  // 2. Distance Score (25%)
  const rawDistance = Math.max(25, Math.min(100, Math.round(100 - (distKm * 6.5))));

  // 3. Availability Score (20%)
  let rawAvailability = 40;
  if (worker.status === 'AVAILABLE' || worker.status === 'EMERGENCY_READY') {
    rawAvailability = 100;
  } else if (worker.status === 'ON_DUTY') {
    const workloadRatio = (worker.currentWorkload || 1) / (worker.maxDailyCapacity || 5);
    rawAvailability = Math.max(30, Math.round((1 - workloadRatio) * 80));
  } else {
    rawAvailability = 20;
  }

  // 4. Reliability Score (10%)
  const rawReliability = worker.reliabilityScore || Math.min(100, Math.round(((worker.customerRating || 4.8) / 5) * 100));

  // 5. Experience Score (5%)
  const rawExperience = Math.min(100, Math.max(40, (worker.experienceYears || 3) * 12));

  let totalScore = 0;
  let breakdown = {};

  if (isEmergency) {
    // Emergency Mode: Hyper-local dispatch prioritizes Distance (40%) + Availability (40%) + Skill (20%)
    totalScore = (0.40 * rawDistance) + (0.40 * rawAvailability) + (0.20 * rawSkill);
    breakdown = {
      skillScore: Math.round(0.20 * rawSkill),
      distanceScore: Math.round(0.40 * rawDistance),
      availabilityScore: Math.round(0.40 * rawAvailability),
      reliabilityScore: 0,
      experienceScore: 0
    };
  } else {
    // Standard Mode: Skill 40% + Distance 25% + Availability 20% + Reliability 10% + Experience 5%
    totalScore = (
      (0.40 * rawSkill) +
      (0.25 * rawDistance) +
      (0.20 * rawAvailability) +
      (0.10 * rawReliability) +
      (0.05 * rawExperience)
    );
    breakdown = {
      skillScore: Math.round(0.40 * rawSkill * 10) / 10,
      distanceScore: Math.round(0.25 * rawDistance * 10) / 10,
      availabilityScore: Math.round(0.20 * rawAvailability * 10) / 10,
      reliabilityScore: Math.round(0.10 * rawReliability * 10) / 10,
      experienceScore: Math.round(0.05 * rawExperience * 10) / 10
    };
  }

  const etaMinutes = isEmergency
    ? Math.max(8, Math.round(distKm * 2.2))
    : Math.max(15, Math.round(distKm * 3.8));

  return {
    distKm,
    etaMinutes,
    totalScore: Math.round(totalScore * 10) / 10,
    scoreBreakdown: breakdown,
    rationale: `${Math.round(totalScore)}% Match • ${distKm} km away • ${etaMinutes} mins ETA • ${worker.experienceYears || 5} yrs exp`
  };
}

// Calculate 5-factor Contractor Matching Score (Level 1: Customer -> Contractor)
function calculateContractorMatchScore(contractor, query, customerCoords) {
  const { serviceCategory = '', projectScope = {} } = query;
  const cLat = customerCoords?.lat || 18.5074;
  const cLng = customerCoords?.lng || 73.8077;
  const contLat = contractor.location?.lat || 18.5074;
  const contLng = contractor.location?.lng || 73.8077;

  const distKm = calculateDistanceKm(cLat, cLng, contLat, contLng);

  // 1. Project Capability Match (30%)
  let rawCapability = 75;
  const trades = (contractor.tradesManaged || []).map(t => t.toLowerCase());
  const cat = (serviceCategory || '').toLowerCase();
  const desc = (projectScope.taskDescription || '').toLowerCase();

  if (trades.some(t => cat.includes(t) || desc.includes(t) || (projectScope.specialRequirements || '').toLowerCase().includes(t))) {
    rawCapability = 100;
  } else if (trades.includes('multi-trade') || trades.includes('maintenance') || trades.includes('home maintenance & repair')) {
    rawCapability = 88;
  }

  // 2. Location / Proximity (25%)
  const rawLocation = Math.max(30, Math.min(100, Math.round(100 - (distKm * 5))));

  // 3. Available Workforce in Community (20%)
  const communityCount = contractor.communitySize || (contractor.workerIds ? contractor.workerIds.length : 10);
  const rawWorkforce = Math.min(100, Math.round((communityCount / 16) * 100));

  // 4. Experience & Completed Contracts (15%)
  const completed = contractor.completedContracts || 30;
  const rawExperience = Math.min(100, Math.round((completed / 50) * 100));

  // 5. Rating & Cooperative Standing (10%)
  const rawRating = Math.min(100, Math.round(((contractor.rating || 4.8) / 5) * 100));

  const totalScore = (
    (0.30 * rawCapability) +
    (0.25 * rawLocation) +
    (0.20 * rawWorkforce) +
    (0.15 * rawExperience) +
    (0.10 * rawRating)
  );

  const breakdown = {
    capabilityScore: Math.round(0.30 * rawCapability * 10) / 10,
    locationScore: Math.round(0.25 * rawLocation * 10) / 10,
    workforceScore: Math.round(0.20 * rawWorkforce * 10) / 10,
    experienceScore: Math.round(0.15 * rawExperience * 10) / 10,
    ratingScore: Math.round(0.10 * rawRating * 10) / 10
  };

  return {
    distKm,
    totalScore: Math.round(totalScore * 10) / 10,
    scoreBreakdown: breakdown,
    rationale: `Contractor: ${contractor.name} (${distKm} km) • ${Math.round(totalScore)}% Match • Pool of ${communityCount} Shramiks`
  };
}

// Find and rank workers for a customer request
function matchWorkersForCustomer(workers, query, customerCoords) {
  const coords = resolveAreaCoordinates(customerCoords || query.address);
  
  const scored = workers.map(worker => {
    const match = calculateWorkerMatchScore(worker, query, coords);
    return {
      worker,
      distKm: match.distKm,
      etaMinutes: match.etaMinutes,
      totalScore: match.totalScore,
      scoreBreakdown: match.scoreBreakdown,
      rationale: match.rationale
    };
  });

  // Sort descending by totalScore, then ascending by distance
  scored.sort((a, b) => b.totalScore - a.totalScore || a.distKm - b.distKm);
  return scored;
}

// Find and rank contractors for a project scope (Level 1)
function matchContractorsForProject(contractors, query, customerCoords) {
  const coords = resolveAreaCoordinates(customerCoords || query.address);

  const scored = contractors.map(contractor => {
    const match = calculateContractorMatchScore(contractor, query, coords);
    return {
      contractor,
      distKm: match.distKm,
      totalScore: match.totalScore,
      scoreBreakdown: match.scoreBreakdown,
      rationale: match.rationale
    };
  });

  // Sort descending by totalScore, then ascending by distance
  scored.sort((a, b) => b.totalScore - a.totalScore || a.distKm - b.distKm);
  return scored;
}

// Legacy adapter for matchWorkerToBooking
function matchWorkerToBooking(booking, availableWorkers, cooperatives) {
  const coords = resolveAreaCoordinates(booking.address);
  const ranked = matchWorkersForCustomer(availableWorkers, {
    serviceCategory: booking.serviceCategory,
    subTrade: booking.subTrade,
    isEmergency: booking.urgency === 'EMERGENCY' || booking.type === 'EMERGENCY'
  }, coords);

  const best = ranked[0] || {
    worker: availableWorkers[0],
    totalScore: 85,
    distKm: 2.1,
    etaMinutes: 20,
    rationale: 'Assigned via cooperative queue.'
  };

  return {
    selectedWorker: best.worker,
    score: best.totalScore,
    distKm: best.distKm,
    rationale: best.rationale,
    etaMinutes: best.etaMinutes
  };
}

module.exports = {
  calculateDistanceKm,
  resolveAreaCoordinates,
  calculateWorkerMatchScore,
  calculateContractorMatchScore,
  matchWorkersForCustomer,
  matchContractorsForProject,
  matchWorkerToBooking
};
