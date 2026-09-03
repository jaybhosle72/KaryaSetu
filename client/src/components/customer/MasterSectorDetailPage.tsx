import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, ShieldCheck, Check, Plus, Minus, 
  CreditCard, ChevronRight, Sparkles, Wrench, Zap, Hammer, 
  Home, Tv, Users, Briefcase, Award, Clock, MapPin, AlertTriangle, 
  HeartHandshake, FileText, CheckCircle2, Calendar
} from 'lucide-react';
import { MASTER_SECTORS, MasterSector, MasterSubTrade, MasterServiceItem } from '../../data/masterCatalog';
import { Worker, GeoLocationCoords, WorkerMatchResult, ContractorMatchResult } from '../../types';
import { api } from '../../services/api';

interface MasterSectorDetailPageProps {
  sectorId: string;
  onBack: () => void;
  onSubmitBooking: (bookingData: any) => Promise<void>;
  workers?: Worker[];
  initialService?: any;
  customerLocation?: GeoLocationCoords;
}

const getSubTradeIcon = (id: string): string => {
  switch (id) {
    case 'ac': return '❄️';
    case 'refrigeration': return '🧊';
    case 'washing-machine': return '🧺';
    case 'water-ro': return '💧';
    case 'cctv-networking': return '📹';
    case 'solar-power': return '☀️';
    case 'electrical': return '⚡';
    case 'plumbing': return '🔧';
    case 'carpentry': return '🔨';
    case 'painting': return '🎨';
    case 'masonry-civil': return '🧱';
    case 'skilled-crews': return '👷';
    case 'support-labour-crews': return '👥';
    case 'home-cleaning': return '🧹';
    case 'kitchen-bath': return '🧼';
    case 'fabric-sofa': return '🛋️';
    case 'pest-control': return '🐜';
    case 'home-garden': return '🌱';
    case 'lawn-tree': return '🌳';
    case 'elderly-patient': return '🩺';
    case 'domestic-cook': return '🍳';
    case 'driver-services': return '🚗';
    case 'vehicle-cleaning': return '🚘';
    case 'computer-it': return '💻';
    case 'sos-electrical': return '⚡';
    case 'sos-plumbing': return '💧';
    case 'civil-renovation': return '🏗️';
    case 'rwa-society': return '🏢';
    case 'annual-amc': return '📋';
    default: return '🛠️';
  }
};

export const MasterSectorDetailPage: React.FC<MasterSectorDetailPageProps> = ({
  sectorId,
  onBack,
  onSubmitBooking,
  workers = [],
  initialService,
  customerLocation
}) => {
  // Find matching sector from master catalog (fallback to sector 0)
  const sector: MasterSector = MASTER_SECTORS.find(s => s.id === sectorId) || MASTER_SECTORS[0];

  const [activeSubTradeId, setActiveSubTradeId] = useState<string>(sector.subTrades[0]?.id || '');
  const activeSubTrade = sector.subTrades.find(st => st.id === activeSubTradeId) || sector.subTrades[0];

  const [selectedService, setSelectedService] = useState<MasterServiceItem>(
    activeSubTrade?.services[0] || {
      id: 'default',
      name: sector.title,
      price: 499,
      rating: 4.85,
      duration: '1 hr',
      description: sector.description
    }
  );

  const [selectedWorkerTier, setSelectedWorkerTier] = useState<'STANDARD' | 'MASTER' | 'HELPER'>('STANDARD');
  const [bookingMode, setBookingMode] = useState<'SOLO_WORKER' | 'CONTRACTOR_TEAM'>(
    sector.domain === 'PROJECTS_CONTRACTS' ? 'CONTRACTOR_TEAM' : 'SOLO_WORKER'
  );

  const isContractorProject = sector.id === 'workforce-labour' || sector.domain === 'PROJECTS_CONTRACTS' || bookingMode === 'CONTRACTOR_TEAM';

  // Outcome-Driven Project Scope states (Customer describes WHAT they want; Contractor plans HOW to do it)
  const [taskOutcome, setTaskOutcome] = useState('I want to paint my 3 BHK flat');
  const [propertyType, setPropertyType] = useState('3 BHK');
  const [scopeType, setScopeType] = useState<'Interior' | 'Exterior' | 'Both'>('Interior');
  const [approxArea, setApproxArea] = useState('1,200 sq.ft');
  const [preferredDate, setPreferredDate] = useState('Immediate / Flexible');
  const [specialRequirements, setSpecialRequirements] = useState('Full 3 BHK repainting with premium emulsion, ceiling touchup and crack filling.');

  const [customerName, setCustomerName] = useState('Rahul Deshmukh');
  const [customerPhone, setCustomerPhone] = useState('+91 98224 55667');
  const [address, setAddress] = useState('Flat 504, Windsor Park, Kothrud, Pune 411038');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Scheduling state for solo services (SIH Requirement: Customer booking and scheduling system)
  const [scheduleMode, setScheduleMode] = useState<'INSTANT' | 'SCHEDULED'>('INSTANT');
  const [scheduledDay, setScheduledDay] = useState<'TODAY' | 'TOMORROW' | 'DAY_AFTER'>('TODAY');
  const [scheduledSlot, setScheduledSlot] = useState<string>('09:00 AM - 12:00 PM');

  // Geo-Location Service Matching states
  const [nearbyWorkers, setNearbyWorkers] = useState<WorkerMatchResult[]>([]);
  const [nearbyContractors, setNearbyContractors] = useState<ContractorMatchResult[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState<string>('cnt_101');
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);

  // Synchronize address with customerLocation
  useEffect(() => {
    if (customerLocation?.address) {
      setAddress(customerLocation.address);
    }
  }, [customerLocation]);

  // Fetch Geo-Location matching
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMatch(true);

    const coords = customerLocation || { lat: 18.5074, lng: 73.8077, area: 'Kothrud' };

    if (!isContractorProject) {
      api.getNearbyWorkers({
        serviceCategory: sector.title,
        subTrade: selectedService?.name,
        address: coords.address || address,
        lat: coords.lat,
        lng: coords.lng
      }).then((res: any) => {
        if (isMounted && res.data) {
          setNearbyWorkers(res.data);
        }
      }).catch(console.error).finally(() => {
        if (isMounted) setIsLoadingMatch(false);
      });
    } else {
      api.getNearbyContractors({
        serviceCategory: sector.title,
        projectScope: {
          taskDescription: taskOutcome,
          propertyType,
          scopeType,
          approxAreaSqFt: parseInt(approxArea.replace(/[^0-9]/g, '')) || 1200
        },
        address: coords.address || address,
        lat: coords.lat,
        lng: coords.lng
      }).then((res: any) => {
        if (isMounted && res.data) {
          setNearbyContractors(res.data);
          if (res.data[0]) {
            setSelectedContractorId(res.data[0].contractor._id);
          }
        }
      }).catch(console.error).finally(() => {
        if (isMounted) setIsLoadingMatch(false);
      });
    }

    return () => { isMounted = false; };
  }, [selectedService, customerLocation, isContractorProject, sector.title, taskOutcome, propertyType, scopeType, approxArea]);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
      const parentSub = sector.subTrades.find(st => st.services.some(s => s.id === initialService.id));
      if (parentSub) {
        setActiveSubTradeId(parentSub.id);
      }
    }
  }, [initialService]);

  // Synchronize active sub-trade and selected service when sectorId changes
  useEffect(() => {
    const defaultSubTrade = sector.subTrades[0];
    if (defaultSubTrade) {
      setActiveSubTradeId(defaultSubTrade.id);
      if (defaultSubTrade.services.length > 0) {
        setSelectedService(defaultSubTrade.services[0]);
      }
    }
  }, [sectorId]);

  useEffect(() => {
    if (selectedService) {
      const name = selectedService.name.toLowerCase();
      if (name.includes('paint')) {
        setTaskOutcome('I want to paint my 3 BHK flat');
        setSpecialRequirements('Surface putty, 2-coat emulsion & weathercoat finish');
      } else if (name.includes('plumb') || name.includes('bathroom')) {
        setTaskOutcome('I want to renovate my bathroom plumbing');
        setSpecialRequirements('Fix high-pressure pipeline, new sanitary fittings & drainage');
      } else if (name.includes('electr')) {
        setTaskOutcome('Complete concealed wiring and distribution board setup');
        setSpecialRequirements('ITI certified wiremen for switchgear, conduit drawing & earthing');
      } else if (name.includes('carpent') || name.includes('kitchen')) {
        setTaskOutcome('I want to renovate my kitchen & custom woodwork');
        setSpecialRequirements('Modular kitchen cabinets, wooden shutter doors and hydraulic hinges');
      } else if (name.includes('clean')) {
        setTaskOutcome('I want to deep clean my apartment building');
        setSpecialRequirements('Mechanized single-disc floor scrubbing and post-construction cleanup');
      } else if (name.includes('garden') || name.includes('landscap')) {
        setTaskOutcome('I want to landscape my garden & lawn maintenance');
        setSpecialRequirements('Lawn mowing, hedge trimming and pre-monsoon safety pruning');
      } else if (name.includes('mason') || name.includes('civil') || name.includes('labour')) {
        setTaskOutcome('Build a boundary wall & civil repairs');
        setSpecialRequirements('Brickwork, plastering, mortar mixing and site debris clearing');
      } else {
        setTaskOutcome(`Complete ${selectedService.name} project`);
      }
    }
  }, [selectedService]);

  // Dynamic statutory cost estimation
  const rawUnitPrice = selectedService.price || 499;

  let estimatedCost = rawUnitPrice;

  if (isContractorProject) {
    // Dynamic multiplier based on property type and scope
    let propertyMultiplier = 1.0;
    if (propertyType === '1 BHK') propertyMultiplier = 0.85;
    else if (propertyType === '2 BHK') propertyMultiplier = 1.0;
    else if (propertyType === '3 BHK') propertyMultiplier = 1.25;
    else if (propertyType === '4+ BHK / Villa') propertyMultiplier = 1.65;
    else if (propertyType === 'Office') propertyMultiplier = 1.4;
    else if (propertyType === 'Housing Society') propertyMultiplier = 2.5;

    let scopeMultiplier = 1.0;
    if (scopeType === 'Interior') scopeMultiplier = 1.0;
    else if (scopeType === 'Exterior') scopeMultiplier = 1.2;
    else if (scopeType === 'Both') scopeMultiplier = 1.45;

    // Use selectedService.price if meaningful (>= 1500), otherwise scale by benchmark rate
    const benchmark = rawUnitPrice >= 1500 ? rawUnitPrice : 16500;
    estimatedCost = Math.round(benchmark * propertyMultiplier * scopeMultiplier);
  } else {
    // Solo worker service
    const tierAdjustment = selectedWorkerTier === 'MASTER' ? 150 : selectedWorkerTier === 'HELPER' ? -50 : 0;
    estimatedCost = Math.max(99, rawUnitPrice + tierAdjustment);
  }

  const finalAmount = estimatedCost;
  const workerAmount = Math.round(finalAmount * 0.80);
  const coopAmount = Math.round(finalAmount * 0.10);
  const welfareAmount = Math.round(finalAmount * 0.06);
  const platformAmount = finalAmount - (workerAmount + coopAmount + welfareAmount);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      await onSubmitBooking({
        customerName,
        customerPhone,
        serviceCategory: sector.title,
        subTrade: isContractorProject ? taskOutcome : `${activeSubTrade?.title}: ${selectedService.name}`,
        address,
        estimatedAmount: finalAmount,
        bookingMode: isContractorProject ? 'CONTRACTOR_TEAM' : 'SOLO_WORKER',
        contractorId: isContractorProject ? selectedContractorId : undefined,
        contractorName: isContractorProject ? (nearbyContractors.find(c => c.contractor._id === selectedContractorId)?.contractor.name || 'Balasaheb Ramchandra Shinde') : undefined,
        teamSize: 0,
        projectDurationDays: 0,
        workerType: `${sector.shortTitle} Specialist`,
        workerTier: selectedWorkerTier,
        preferredTime: isContractorProject 
          ? preferredDate 
          : (scheduleMode === 'INSTANT' ? 'Immediate Dispatch (< 30 Mins)' : `${scheduledDay === 'TODAY' ? 'Today' : scheduledDay === 'TOMORROW' ? 'Tomorrow' : 'In 2 Days'} (${scheduledSlot})`),
        projectScope: isContractorProject ? {
          taskDescription: taskOutcome,
          propertyType,
          scopeType,
          approxAreaSqFt: parseInt(approxArea.replace(/[^0-9]/g, '')) || 1200,
          preferredStartDate: preferredDate,
          specialRequirements
        } : undefined
      });

      if (isContractorProject) {
        setSuccessMessage(`Requirement Registered! Mukaddam Balasaheb Shinde is evaluating your site scope and preparing the workforce proposal.`);
      } else {
        setSuccessMessage(`Booking successfully dispatched to Cooperative! Certified technician will arrive shortly.`);
      }
      setTimeout(() => setSuccessMessage(''), 8000);
    } catch (err: any) {
      alert(err.message || 'Booking submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 font-sans pb-20 max-w-[1360px] mx-auto">
      
      {/* 1. Top Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>← Back to All Services</span>
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">
            {sector.domain === 'HOME_SERVICES' ? 'Home Services' : 'Projects & Contracts'}
          </span>
          <span className="text-slate-300">/</span>
          <span className="font-bold text-slate-800">{sector.shortTitle}</span>
        </div>
      </div>

      {/* 2. Sovereign Sector Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>{sector.domain === 'HOME_SERVICES' ? 'Accredited Household Sector' : 'Contractor & Institutional Guild'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {sector.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {sector.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-600">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                {sector.rating} ({sector.bookingsCount})
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 font-bold text-emerald-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {sector.shramiksAvailable} Verified Shramiks Available
              </span>
            </div>
          </div>

          {/* Cooperative Credential Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs min-w-[260px]">
            <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
              Accredited Labour Cooperative
            </span>
            <strong className="text-slate-900 font-extrabold block text-xs">
              {sector.coopName}
            </strong>
            <p className="text-[11px] text-slate-500 font-mono">
              Reg: {sector.regNo}
            </p>
            <div className="pt-2 border-t border-slate-200 text-[10px] font-bold text-emerald-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>80% Take-Home Wage Assured</span>
            </div>
          </div>
        </div>

        {/* Standout Sub-Trade Navigation Filter Bar */}
        {sector.subTrades.length > 1 && (
          <div className="pt-5 border-t border-slate-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933] animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Select Specialization
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-500 font-medium">
                  • Click a trade category below to browse specific services
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-orange-800 bg-orange-100/80 px-2.5 py-0.5 rounded-full border border-orange-200">
                {sector.subTrades.length} Categories Available
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1">
              {sector.subTrades.map((st) => {
                const isActive = activeSubTradeId === st.id;
                const icon = getSubTradeIcon(st.id);
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      setActiveSubTradeId(st.id);
                      if (st.services.length > 0) setSelectedService(st.services[0]);
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-200 whitespace-nowrap cursor-pointer flex-shrink-0 flex items-center gap-2.5 border ${
                      isActive
                        ? 'bg-slate-950 text-white border-slate-950 shadow-md ring-2 ring-orange-500/50 scale-[1.03]'
                        : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200/90 hover:border-slate-400 hover:shadow-xs'
                    }`}
                  >
                    <span className="text-base sm:text-lg flex-shrink-0">{icon}</span>
                    <span className="tracking-tight">{st.title}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {st.services.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Sub-Trade Headline & Tagline Strip */}
            {activeSubTrade && activeSubTrade.tagline && (
              <div className="p-3 bg-gradient-to-r from-orange-50/80 via-white to-slate-50 rounded-2xl border border-orange-200/60 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-800 font-medium">
                  <span className="font-black text-orange-950 flex items-center gap-1.5">
                    <span>{getSubTradeIcon(activeSubTrade.id)}</span>
                    <span>{activeSubTrade.title}:</span>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">{activeSubTrade.tagline}</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                  ✓ Verified Pune Shramiks Ready
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-white/80 hover:text-white text-sm">✕</button>
        </div>
      )}

      {/* 3. Main Workspace: Services on Left (7 cols) | Dispatch Panel on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Detailed Services List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {activeSubTrade?.title} Services
              </h2>
              <p className="text-xs text-slate-500">
                {activeSubTrade?.tagline}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {activeSubTrade?.services.length} Gazetted Services
            </span>
          </div>

          <div className="space-y-3">
            {activeSubTrade?.services.map((svc) => {
              const isSelected = selectedService.id === svc.id;
              return (
                <div
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-white border-slate-950 shadow-md ring-1 ring-slate-950'
                      : 'bg-white hover:border-slate-300 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                          {svc.name}
                        </h3>
                        {svc.instant && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            ⚡ Instant
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          ★ {svc.rating}
                        </span>
                        <span>•</span>
                        <span>{svc.duration}</span>
                      </div>

                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                        {svc.description}
                      </p>

                      {svc.inclusions && svc.inclusions.length > 0 && (
                        <div className="pt-2 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">
                            Service Includes:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-600">
                            {svc.inclusions.map((inc, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span className="text-[11px]">{inc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex-shrink-0 sm:pl-4">
                      {svc.hideCostEstimate || sector.id === 'workforce-labour' ? (
                        <div>
                          <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full inline-block">
                            {svc.rateLabel || 'Govt Gazetted Wages'}
                          </span>
                          <span className="text-[11px] font-bold text-slate-500 block mt-1">
                            Flexible Gang Size
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Gazetted Rate</span>
                          <strong className="text-lg font-black text-slate-900">
                            ₹{svc.price.toLocaleString('en-IN')}
                          </strong>
                        </div>
                      )}
                      <button
                        type="button"
                        className={`mt-2 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
                          isSelected
                            ? 'bg-slate-950 text-white'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelected ? '✓ Selected' : (sector.id === 'workforce-labour' ? 'Select Crew' : 'Select Service')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bulk Workforce Showcase (If in workforce sector) */}
          {sector.bulkWorkforceOptions && (
            <div className="p-5 rounded-3xl bg-blue-50 border border-blue-200 space-y-3 mt-4">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <Users className="w-5 h-5 text-blue-700" />
                <h3 className="text-sm font-black">Bulk Workforce Requests for Contractors & Societies</h3>
              </div>
              <p className="text-xs text-blue-800 leading-relaxed">
                Need multiple workers for a construction milestone, society painting, or large event? Cooperative gangs are dispatched under registered Mukaddams with full tool depots and safety compliance.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs font-semibold text-blue-950">
                <div className="p-2.5 bg-white/90 rounded-xl border border-blue-100">
                  ⚡ Crew of Painters & Waterproofers
                </div>
                <div className="p-2.5 bg-white/90 rounded-xl border border-blue-100">
                  ⚡ Crew of Electricians & Wiremen
                </div>
                <div className="p-2.5 bg-white/90 rounded-xl border border-blue-100">
                  ⚡ Crew of Masons & Civil Labourers
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Direct Dispatch & 80/10/6/4 Split Panel (Zero Popups!) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 sticky top-20">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-orange-600 tracking-wider block">
                Cooperative Dispatch Console
              </span>
              <h3 className="text-base font-black text-slate-900">
                {selectedService.name}
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Verified Rail
            </span>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
            
            {/* 1. Service Delivery Model (For general sectors) */}
            {sector.id !== 'workforce-labour' && (
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Service Delivery Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMode('SOLO_WORKER')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      bookingMode === 'SOLO_WORKER'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <strong className="text-[11px] block">Solo Worker</strong>
                      <span className={`text-[9px] ${bookingMode === 'SOLO_WORKER' ? 'text-slate-300' : 'text-slate-500'}`}>
                        1 Technician
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBookingMode('CONTRACTOR_TEAM')}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                      bookingMode === 'CONTRACTOR_TEAM'
                        ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 text-blue-300 flex-shrink-0" />
                    <div>
                      <strong className="text-[11px] block">Contractor Team</strong>
                      <span className={`text-[9px] ${bookingMode === 'CONTRACTOR_TEAM' ? 'text-blue-200' : 'text-slate-500'}`}>
                        Custom Crew
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* 2. Outcome-Driven Project Scope Form (Customer describes WHAT they want) */}
            {isContractorProject ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                  <span className="text-[11px] font-black uppercase text-slate-900 tracking-wider">
                    Describe What Work You Want Done
                  </span>
                  <span className="text-[10px] text-blue-800 bg-blue-100 font-bold px-2 py-0.5 rounded-md">
                    Contractor Planning
                  </span>
                </div>

                {/* Question: What work do you want done? */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    What work do you want done?
                  </label>
                  <input
                    type="text"
                    required
                    value={taskOutcome}
                    onChange={(e) => setTaskOutcome(e.target.value)}
                    placeholder="e.g. I want to paint my 3 BHK flat / Renovate my bathroom"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:ring-2 focus:ring-blue-600/30 focus:outline-none"
                  />
                </div>

                {/* Property Type Selection */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Property / Site Type
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['1 BHK', '2 BHK', '3 BHK', '4+ BHK / Villa', 'Office', 'Housing Society'].map((pt) => (
                      <button
                        key={pt}
                        type="button"
                        onClick={() => setPropertyType(pt)}
                        className={`py-1.5 px-2 rounded-xl text-[11px] font-extrabold transition text-center border cursor-pointer ${
                          propertyType === pt
                            ? 'bg-slate-950 text-white border-slate-950 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {pt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Work Scope & Approx Area */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Work Scope
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Interior', 'Exterior', 'Both'] as const).map((sc) => (
                        <button
                          key={sc}
                          type="button"
                          onClick={() => setScopeType(sc)}
                          className={`py-1.5 rounded-lg text-[10px] font-extrabold transition text-center border cursor-pointer ${
                            scopeType === sc
                              ? 'bg-blue-900 text-white border-blue-900 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {sc}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                      Approx Area (Sq.Ft)
                    </label>
                    <input
                      type="text"
                      value={approxArea}
                      onChange={(e) => setApproxArea(e.target.value)}
                      placeholder="e.g. 1,200 sq.ft"
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:outline-none"
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Special Requirements & Notes
                  </label>
                  <textarea
                    rows={2}
                    value={specialRequirements}
                    onChange={(e) => setSpecialRequirements(e.target.value)}
                    placeholder="e.g. Pastel emulsion colors, ceiling touchup, anti-damp primer..."
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-semibold text-xs focus:outline-none"
                  />
                </div>

                {/* Outcome Architecture Assurance Banner */}
                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200/80 text-[11px] text-blue-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-blue-900">
                    <ShieldCheck className="w-4 h-4 text-blue-700 flex-shrink-0" />
                    <span>Contractor Planning Guarantee</span>
                  </div>
                  <p className="text-[10px] text-blue-800 leading-snug">
                    You don't need to guess how many workers you need. Licensed Mukaddam <strong>Balasaheb Shinde</strong> calculates the exact team (painters + helpers), duration, and equipment, and provides a transparent proposal within statutory minimum wage guidelines.
                  </p>
                </div>

              </div>
            ) : null}

            {/* 2.5 GEO-LOCATION MATCHING ENGINE WIDGET */}
            {!isContractorProject ? (
              <div className="p-3.5 bg-gradient-to-br from-emerald-50/80 to-slate-50 rounded-2xl border border-emerald-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200/60">
                  <span className="font-black text-emerald-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Geo-Location Worker Matching</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    5-Factor AI Score
                  </span>
                </div>

                {nearbyWorkers.length > 0 ? (
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-100 space-y-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-slate-900 font-black text-xs block">
                            {nearbyWorkers[0].worker.name}
                          </strong>
                          <span className="text-[10px] text-slate-500">
                            📍 {nearbyWorkers[0].distKm} km away • ETA {nearbyWorkers[0].etaMinutes} mins
                          </span>
                        </div>
                        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          {nearbyWorkers[0].totalScore}% Match
                        </span>
                      </div>

                      {/* 5-Factor Score Breakdown */}
                      <div className="pt-1 text-[10px] space-y-0.5 text-slate-600">
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase">
                          <span>Skill 40%</span>
                          <span>Dist 25%</span>
                          <span>Avail 20%</span>
                          <span>Rel 10%</span>
                          <span>Exp 5%</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1 text-center font-mono font-bold text-[10px]">
                          <span className="bg-blue-50 text-blue-800 rounded py-0.5">{nearbyWorkers[0].scoreBreakdown?.skillScore || 38}%</span>
                          <span className="bg-emerald-50 text-emerald-800 rounded py-0.5">{nearbyWorkers[0].scoreBreakdown?.distanceScore || 24}%</span>
                          <span className="bg-amber-50 text-amber-800 rounded py-0.5">{nearbyWorkers[0].scoreBreakdown?.availabilityScore || 20}%</span>
                          <span className="bg-purple-50 text-purple-800 rounded py-0.5">{nearbyWorkers[0].scoreBreakdown?.reliabilityScore || 9.8}%</span>
                          <span className="bg-slate-100 text-slate-800 rounded py-0.5">{nearbyWorkers[0].scoreBreakdown?.experienceScore || 4.8}%</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Cooperative nearest certified technician automatically prioritized.</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-2 text-center text-[11px] text-slate-500">
                    Scanning nearby certified {sector.shortTitle} shramiks in {customerLocation?.area || 'Kothrud'}...
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3.5 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-2xl border border-blue-200/80 space-y-2.5 text-xs">
                <div className="flex items-center justify-between pb-1 border-b border-blue-200/60">
                  <span className="font-black text-blue-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Level 1: Nearby Contractor Matching</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                    Proximity & Capability
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Select Licensed Nearby Contractor:
                  </span>
                  {nearbyContractors.map((cMatch) => {
                    const isSelected = selectedContractorId === cMatch.contractor._id;
                    return (
                      <button
                        key={cMatch.contractor._id}
                        type="button"
                        onClick={() => setSelectedContractorId(cMatch.contractor._id)}
                        className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <strong className="block text-xs font-black">
                            {cMatch.contractor.name}
                          </strong>
                          <span className={`text-[10px] block ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                            📍 {cMatch.contractor.location?.area || 'Pune'} ({cMatch.distKm} km) • {cMatch.contractor.communitySize || 12} Shramiks Pool
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-black block ${isSelected ? 'text-emerald-300' : 'text-emerald-700'}`}>
                            {cMatch.totalScore}% Match
                          </span>
                          <span className={`text-[9px] ${isSelected ? 'text-blue-200' : 'text-slate-400'}`}>
                            ★ {cMatch.contractor.rating}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 bg-blue-100/60 rounded-xl text-[10px] text-blue-950 font-semibold leading-tight">
                  Selected contractor evaluates site scope & formulates the workforce proposal (painters, helpers, duration, tools).
                </div>
              </div>
            )}

            {/* Customer Details */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Service Address (Pune)</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    className="w-full pl-8 pr-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-semibold focus:bg-white focus:outline-none text-xs"
                  />
                </div>
              </div>

              {/* SIH Requirement: Customer Booking and Scheduling System */}
              {!isContractorProject && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Booking Schedule & Timing
                    </span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Guaranteed Arrival Window
                    </span>
                  </div>

                  {/* Mode Toggles: Instant vs Scheduled */}
                  <div className="grid grid-cols-2 gap-1.5 p-0.5 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setScheduleMode('INSTANT')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        scheduleMode === 'INSTANT'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Instant (&lt;30m)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setScheduleMode('SCHEDULED')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        scheduleMode === 'SCHEDULED'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <span>Schedule Slot</span>
                    </button>
                  </div>

                  {/* Date & Time Selection when SCHEDULED */}
                  {scheduleMode === 'SCHEDULED' && (
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-fadeIn">
                      {/* Day selection */}
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Select Day</span>
                        <div className="grid grid-cols-3 gap-1">
                          {[
                            { key: 'TODAY', label: 'Today' },
                            { key: 'TOMORROW', label: 'Tomorrow' },
                            { key: 'DAY_AFTER', label: 'In 2 Days' }
                          ].map(d => (
                            <button
                              key={d.key}
                              type="button"
                              onClick={() => setScheduledDay(d.key as any)}
                              className={`py-1 px-2 rounded-lg text-[11px] font-bold transition border ${
                                scheduledDay === d.key
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Slot selection */}
                      <div>
                        <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Select 3-Hour Window</span>
                        <div className="grid grid-cols-2 gap-1">
                          {[
                            '09:00 AM - 12:00 PM',
                            '12:00 PM - 03:00 PM',
                            '03:00 PM - 06:00 PM',
                            '06:00 PM - 09:00 PM'
                          ].map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setScheduledSlot(slot)}
                              className={`py-1 px-2 rounded-lg text-[10px] font-bold transition border text-left flex items-center justify-between ${
                                scheduledSlot === slot
                                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-extrabold'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <span>{slot}</span>
                              {scheduledSlot === slot && <Check className="w-3 h-3 text-emerald-600 flex-shrink-0" />}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cost Split vs Workforce Assurance (No arbitrary cost estimation for crews) */}
            {sector.id === 'workforce-labour' ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    Statutory Cooperative Crew Dispatch
                  </span>
                  <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Govt Gazetted Wages
                  </span>
                </div>

                <div className="space-y-1 text-[11px] text-emerald-950">
                  <p className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span><strong>100% e-Shram & Aadhaar verified</strong> trade workers</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span><strong>PM-JAY health & accidental cover</strong> included</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span><strong>District tool depot scaffolding & PPE</strong> provided</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Mukaddam will coordinate on-site muster roll</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {isContractorProject ? 'Statutory Estimated Budget' : 'Statutory 4-Way Split'}
                    </span>
                    {isContractorProject && (
                      <span className="text-[9px] text-slate-400 block font-semibold">
                        Cooperative benchmark for {propertyType} ({scopeType})
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <strong className="text-sm font-black text-slate-900 block">
                      ₹{finalAmount.toLocaleString('en-IN')}
                    </strong>
                    {isContractorProject && (
                      <span className="text-[9px] text-blue-700 font-extrabold uppercase block">
                        Estimated
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
                    <span>80% Worker Take-Home</span>
                    <span>₹{workerAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 px-2">
                    <span>10% Tool Depot & Logistics</span>
                    <span>₹{coopAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    <span>6% PM-JAY & Accidental Fund</span>
                    <span>₹{welfareAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500 px-2">
                    <span>4% DPI Digital Rail</span>
                    <span>₹{platformAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {isContractorProject && (
                  <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                    💡 Final cost and crew composition confirmed in Mukaddam's workforce proposal based on site scope.
                  </p>
                )}
              </div>
            )}

            {/* Direct Dispatch Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting to Cooperative...</span>
              ) : (
                <span>
                  {isContractorProject
                    ? `Request Contractor Proposal (₹${finalAmount.toLocaleString('en-IN')} Est.) ➔`
                    : `Confirm & Book ${selectedService.name} (₹${finalAmount.toLocaleString('en-IN')}) ➔`}
                </span>
              )}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
};
