import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Star, ShieldCheck, Check, Plus, Minus, 
  CreditCard, ChevronRight, Sparkles, Wrench, Zap, Hammer, 
  Home, Tv, Users, Briefcase, Award, Clock, MapPin, AlertTriangle, 
  HeartHandshake, FileText, CheckCircle2, Calendar, ShoppingBag, Trash2, X
} from 'lucide-react';
import { MASTER_SECTORS, MasterSector, MasterSubTrade, MasterServiceItem } from '../../data/masterCatalog';
import { Worker, GeoLocationCoords, WorkerMatchResult, ContractorMatchResult } from '../../types';
import { api } from '../../services/api';
import { Language, translations, getTranslatedSectorTitle, getTranslatedServiceName } from '../../i18n/translations';
import { GoogleMapLocationModal } from './GoogleMapLocationModal';
import { PaymentModal } from './PaymentModal';
import { TransparentInvoiceModal } from './TransparentInvoiceModal';
import { CartItem } from './CartDrawerModal';

interface MasterSectorDetailPageProps {
  sectorId: string;
  onBack: () => void;
  onSubmitBooking: (bookingData: any) => Promise<any>;
  onPayBooking?: (bookingId: string, paymentMethod?: string) => Promise<void>;
  workers?: Worker[];
  initialService?: any;
  customerLocation?: GeoLocationCoords;
  currentLanguage?: Language;
  cart?: CartItem[];
  onAddToCart?: (item: any) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  onClearCart?: () => void;
  onOpenCart?: () => void;
  currentUser?: { name: string; phone: string; address?: string } | null;
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
  onPayBooking,
  workers = [],
  initialService,
  customerLocation,
  currentLanguage = 'en',
  cart = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOpenCart,
  currentUser
}) => {
  const t = translations[currentLanguage] || translations.en;
  // Find matching sector from master catalog (fallback to sector 0)
  const sector: MasterSector = MASTER_SECTORS.find(s => s.id === sectorId) || MASTER_SECTORS[0];

  const [activeSubTradeId, setActiveSubTradeId] = useState<string>(sector.subTrades[0]?.id || '');
  const activeSubTrade = sector.subTrades.find(st => st.id === activeSubTradeId) || sector.subTrades[0];

  // Multi-service booking selection state
  const [selectedServices, setSelectedServices] = useState<Array<{ service: MasterServiceItem; quantity: number }>>(() => {
    const defaultSvc = initialService || activeSubTrade?.services[0] || {
      id: 'default',
      name: sector.title,
      price: 499,
      rating: 4.85,
      duration: '1 hr',
      description: sector.description
    };
    return [{ service: defaultSvc, quantity: 1 }];
  });

  const selectedService = selectedServices[0]?.service || activeSubTrade?.services[0] || {
    id: 'default',
    name: sector.title,
    price: 499,
    rating: 4.85,
    duration: '1 hr',
    description: sector.description
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(item => item.service.id === serviceId);
  };

  const getServiceQty = (serviceId: string) => {
    const item = selectedServices.find(item => item.service.id === serviceId);
    return item ? item.quantity : 0;
  };

  const toggleSelectService = (svc: MasterServiceItem) => {
    setSelectedServices(prev => {
      const exists = prev.find(item => item.service.id === svc.id);
      if (exists) {
        if (prev.length <= 1) return prev; // Keep at least one selected
        return prev.filter(item => item.service.id !== svc.id);
      } else {
        return [...prev, { service: svc, quantity: 1 }];
      }
    });
  };

  const addServiceToBooking = (svc: MasterServiceItem) => {
    setSelectedServices(prev => {
      const exists = prev.find(item => item.service.id === svc.id);
      if (exists) {
        return prev.map(item => item.service.id === svc.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { service: svc, quantity: 1 }];
    });
  };

  const updateServiceQty = (serviceId: string, delta: number) => {
    setSelectedServices(prev => {
      return prev.map(item => {
        if (item.service.id === serviceId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean) as Array<{ service: MasterServiceItem; quantity: number }>;
    });
  };

  const removeServiceFromBooking = (serviceId: string) => {
    setSelectedServices(prev => {
      if (prev.length <= 1) return prev;
      return prev.filter(item => item.service.id !== serviceId);
    });
  };

  const [selectedWorkerTier, setSelectedWorkerTier] = useState<'STANDARD' | 'MASTER' | 'HELPER'>('STANDARD');
  const [bookingMode, setBookingMode] = useState<'SOLO_WORKER' | 'CONTRACTOR_TEAM'>(
    sector.domain === 'PROJECTS_CONTRACTS' ? 'CONTRACTOR_TEAM' : 'SOLO_WORKER'
  );

  const isContractorProject = bookingMode === 'CONTRACTOR_TEAM';

  // Outcome-Driven Project Scope states (Customer describes WHAT they want; Contractor plans HOW to do it)
  const [taskOutcome, setTaskOutcome] = useState('I want to paint my 3 BHK flat');
  const [propertyType, setPropertyType] = useState('3 BHK');
  const [scopeType, setScopeType] = useState<'Interior' | 'Exterior' | 'Both'>('Interior');
  const [approxArea, setApproxArea] = useState('1,200 sq.ft');
  const [preferredDate, setPreferredDate] = useState('Immediate / Flexible');
  const [specialRequirements, setSpecialRequirements] = useState('Full 3 BHK repainting with premium emulsion, ceiling touchup and crack filling.');

  const [customerName, setCustomerName] = useState(currentUser?.name || 'Citizen Customer');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+91 98220 11223');
  const [address, setAddress] = useState(currentUser?.address || 'Flat 504, Windsor Park, Kothrud, Pune 411038');

  useEffect(() => {
    if (currentUser?.name) setCustomerName(currentUser.name);
    if (currentUser?.phone) setCustomerPhone(currentUser.phone);
    if (currentUser?.address) setAddress(currentUser.address);
  }, [currentUser]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Payment states
  const [paymentBooking, setPaymentBooking] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paidResult, setPaidResult] = useState<any>(null);

  // Scheduling state for solo services (SIH Requirement: Customer booking and scheduling system)
  const [scheduleMode, setScheduleMode] = useState<'INSTANT' | 'SCHEDULED'>('INSTANT');
  const [scheduledDay, setScheduledDay] = useState<'TODAY' | 'TOMORROW' | 'DAY_AFTER'>('TODAY');
  const [scheduledSlot, setScheduledSlot] = useState<string>('09:00 AM - 12:00 PM');

  // Geo-Location Service Matching states
  const [nearbyWorkers, setNearbyWorkers] = useState<WorkerMatchResult[]>([]);
  const [nearbyContractors, setNearbyContractors] = useState<ContractorMatchResult[]>([]);
  const [selectedContractorId, setSelectedContractorId] = useState<string>('cnt_101');
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [showGoogleMap, setShowGoogleMap] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<GeoLocationCoords>(
    customerLocation || { lat: 18.5074, lng: 73.8077, area: 'Kothrud', address: 'Flat 504, Windsor Park, Kothrud, Pune 411038' }
  );

  // Synchronize address with customerLocation
  useEffect(() => {
    if (customerLocation?.address) {
      setAddress(customerLocation.address);
      setCurrentCoords(customerLocation);
    }
  }, [customerLocation]);

  // Fetch Geo-Location matching
  useEffect(() => {
    let isMounted = true;
    setIsLoadingMatch(true);

    const coords = currentCoords;

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
  }, [selectedService, currentCoords, isContractorProject, sector.title, taskOutcome, propertyType, scopeType, approxArea]);

  useEffect(() => {
    if (initialService) {
      setSelectedServices([{ service: initialService, quantity: 1 }]);
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
        setSelectedServices([{ service: defaultSubTrade.services[0], quantity: 1 }]);
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

  // Dynamic statutory cost estimation for multi-service booking
  const totalItemsCount = selectedServices.reduce((sum, item) => sum + item.quantity, 0);
  const rawTotalPrice = selectedServices.reduce((sum, item) => sum + (item.service.price || 0) * item.quantity, 0);

  let estimatedCost = rawTotalPrice;

  if (rawTotalPrice > 0) {
    // When customer has added specific services to booking, estimated cost strictly EQUALS the exact sum of selected services
    estimatedCost = rawTotalPrice;
  } else if (isContractorProject) {
    // Fallback benchmark calculation ONLY for custom open-scope contractor projects without catalog items
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

    estimatedCost = Math.round(16500 * propertyMultiplier * scopeMultiplier);
  } else {
    // Solo worker default rate if no specific service picked
    const tierAdjustment = selectedWorkerTier === 'MASTER' ? 150 : selectedWorkerTier === 'HELPER' ? -50 : 0;
    estimatedCost = Math.max(99, 499 + tierAdjustment);
  }

  const finalAmount = estimatedCost;
  const workerAmount = Math.round(finalAmount * 0.80);
  const coopAmount = Math.round(finalAmount * 0.10);
  const welfareAmount = Math.round(finalAmount * 0.06);
  const platformAmount = finalAmount - (workerAmount + coopAmount + welfareAmount);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert('Please select at least one service to proceed with booking.');
      return;
    }
    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      const servicesSummary = selectedServices.map(i => `${i.service.name}${i.quantity > 1 ? ` (x${i.quantity})` : ''}`).join(', ');

      const created = await onSubmitBooking({
        customerName,
        customerPhone,
        serviceCategory: sector.title,
        subTrade: isContractorProject ? taskOutcome : `${activeSubTrade?.title || sector.title}: ${servicesSummary}`,
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
        notes: `Multi-service booking (${totalItemsCount} items: ${servicesSummary}). Statutory split: ₹${workerAmount} direct to Shramik, ₹${welfareAmount} to PM-JAY.`,
        projectScope: isContractorProject ? {
          taskDescription: taskOutcome,
          propertyType,
          scopeType,
          approxAreaSqFt: parseInt(approxArea.replace(/[^0-9]/g, '')) || 1200,
          preferredStartDate: preferredDate,
          specialRequirements
        } : undefined
      });

      const activeBookingObj = created || {
        _id: `bk_${Date.now()}`,
        customerName,
        customerPhone,
        serviceCategory: sector.title,
        subTrade: `${activeSubTrade?.title || sector.title}: ${servicesSummary}`,
        totalAmount: finalAmount,
        workerName: 'Pravin Maruti Jadhav',
        cooperativeName: 'Pune Electrical Workers Cooperative Society',
        paymentStatus: 'PENDING',
        status: 'ALLOCATED'
      };

      setPaymentBooking(activeBookingObj);

      if (isContractorProject) {
        setSuccessMessage(`Requirement Registered! Mukaddam Balasaheb Shinde is evaluating your site scope and preparing the workforce proposal.`);
      } else {
        setSuccessMessage(`Booking for ${totalItemsCount} services dispatched! Certified technician is en route. Pay ₹${finalAmount.toLocaleString('en-IN')} securely after service completion.`);
      }

      // Smoothly navigate back to customer portal tracker
      setTimeout(() => {
        onBack();
      }, 1200);
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
          <span>← {t.portal.backToSectors}</span>
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
              {getTranslatedSectorTitle(sector.id, sector.title, currentLanguage)}
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
              <span>Direct Escrow Protected</span>
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
                      if (st.services.length > 0 && selectedServices.length === 0) {
                        setSelectedServices([{ service: st.services[0], quantity: 1 }]);
                      }
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

      {/* Live Booking & Payment Action Console */}
      {paymentBooking ? (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn ${
          isPaid ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-slate-900 text-white border-slate-800'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-xs flex-shrink-0 ${
              isPaid ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-sm sm:text-base tracking-tight">
                  {isPaid ? 'Payment Verified & Statutory Escrow Settled' : `Booking Dispatched • Certified Technician Assigned`}
                </h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isPaid ? 'bg-emerald-600 text-white' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {isPaid ? 'PAID via Razorpay' : 'Pay Post-Service'}
                </span>
              </div>
              <p className={`text-xs ${isPaid ? 'text-emerald-700 font-medium' : 'text-slate-300'} mt-0.5`}>
                {isPaid
                  ? `Invoice #${paidResult?.invoice?.invoiceNumber || paymentBooking?.invoiceNumber || 'INV-2026'} • Verified Payment to ${paymentBooking.workerName || 'Worker'}`
                  : `Assigned: ${paymentBooking.workerName || 'Pravin Maruti Jadhav'} • ₹${(paymentBooking.totalAmount || finalAmount).toLocaleString('en-IN')} payment due after service completion.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isPaid ? (
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] active:scale-[0.99] transition cursor-pointer"
              >
                <span>Track Doorstep Arrival ➔</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-300 shadow-xs transition cursor-pointer"
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>View GST Tax Invoice</span>
              </button>
            )}
          </div>
        </div>
      ) : successMessage ? (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage('')} className="text-white/80 hover:text-white text-sm cursor-pointer">✕</button>
        </div>
      ) : null}

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

          {/* Multi-Service Selection Summary Tray */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-xs">
                {totalItemsCount}
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <span>{totalItemsCount === 1 ? '1 Service Selected in Order' : `${totalItemsCount} Services in Multi-Booking`}</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded-md">
                    1 Single Payment
                  </span>
                </h4>
                <p className="text-[10px] text-slate-600 font-medium">
                  Subtotal: <strong className="text-slate-950 font-black">₹{finalAmount.toLocaleString('en-IN')}</strong> • Select multiple services below to pay once
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedServices.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedServices([selectedServices[0]])}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition cursor-pointer"
                >
                  Clear Others
                </button>
              )}
              {onOpenCart && (
                <button
                  type="button"
                  onClick={onOpenCart}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                  <span>Cart ({cart?.reduce((a, b) => a + b.quantity, 0) || 0})</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {activeSubTrade?.services.map((svc) => {
              const isSelected = isServiceSelected(svc.id);
              const qty = getServiceQty(svc.id);
              return (
                <div
                  key={svc.id}
                  onClick={() => toggleSelectService(svc)}
                  className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? 'bg-orange-50/20 border-slate-950 shadow-md ring-2 ring-slate-950/20'
                      : 'bg-white hover:border-slate-300 border-slate-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectService(svc);
                        }}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition flex-shrink-0 cursor-pointer ${
                          isSelected ? 'bg-slate-950 border-slate-950 text-white shadow-2xs' : 'border-slate-300 bg-white hover:border-slate-500'
                        }`}
                        title={isSelected ? 'Remove from booking' : 'Add to booking'}
                      >
                        {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                      </button>

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
                          {isSelected && (
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white">
                              ✓ In Order (x{qty})
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
                    </div>

                    <div className="text-right flex-shrink-0 sm:pl-4 space-y-2">
                      {svc.hideCostEstimate ? (
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

                      <div className="flex flex-wrap items-center justify-end gap-1.5 pt-1">
                        {/* Multi-service Quantity / Select Controller */}
                        {isSelected ? (
                          <div className="flex items-center gap-1 bg-slate-950 text-white rounded-xl p-0.5 shadow-2xs" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => updateServiceQty(svc.id, -1)}
                              className="w-6 h-6 rounded-lg hover:bg-slate-800 flex items-center justify-center font-black text-xs cursor-pointer"
                              title="Decrease quantity"
                            >
                              -
                            </button>
                            <span className="px-1.5 text-xs font-black font-mono">{qty}</span>
                            <button
                              type="button"
                              onClick={() => updateServiceQty(svc.id, 1)}
                              className="w-6 h-6 rounded-lg hover:bg-slate-800 flex items-center justify-center font-black text-xs cursor-pointer"
                              title="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addServiceToBooking(svc);
                            }}
                            className="px-3 py-1.5 rounded-xl text-xs font-black bg-slate-900 hover:bg-orange-600 text-white transition shadow-2xs flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 stroke-[2.5]" />
                            <span>Add Service</span>
                          </button>
                        )}

                        {/* Add to Global Cart Button */}
                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart({
                                id: svc.id,
                                name: svc.name,
                                price: svc.price,
                                category: sector.title,
                                quantity: 1,
                                duration: svc.duration,
                                description: svc.description
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition shadow-2xs flex items-center gap-1 cursor-pointer"
                            title="Add to Global Booking Cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                            <span className="hidden sm:inline">+ Cart</span>
                          </button>
                        )}
                      </div>
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
                {selectedServices.length > 1
                  ? `Multi-Service Order (${selectedServices.length} Trades • ${totalItemsCount} Services)`
                  : (selectedService?.name || 'Select a Service')}
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Verified Rail
            </span>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-4 text-xs">
            
            {/* Selected Services in this Booking Basket */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 pb-1 border-b border-slate-200">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                  <span>Services in this Booking ({totalItemsCount})</span>
                </span>
                <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md">
                  Single Combined Payment
                </span>
              </div>

              {selectedServices.length === 0 ? (
                <div className="py-3 text-center text-xs text-slate-500">
                  No services selected. Click "+ Add Service" on the left to include services.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {selectedServices.map(item => (
                    <div key={item.service.id} className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                      <div className="min-w-0 pr-2">
                        <strong className="block text-xs font-black text-slate-900 truncate">{item.service.name}</strong>
                        <span className="text-[10px] text-slate-500">₹{item.service.price} × {item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateServiceQty(item.service.id, -1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-black cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-1.5 text-[11px] font-bold font-mono text-slate-900">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateServiceQty(item.service.id, 1)}
                            className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-200 font-black cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-black text-slate-900 min-w-[50px] text-right">
                          ₹{(item.service.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeServiceFromBooking(item.service.id)}
                          className="w-5 h-5 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition cursor-pointer"
                          title="Remove service"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-slate-500 leading-tight">
                💡 Add multiple services from the left to bundle into this single appointment and single payment.
              </p>
            </div>
            
            {/* 1. Service Delivery Model (For general sectors) */}
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

              </div>
            ) : null}

            {/* 2.5 GEO-LOCATION MATCHING ENGINE WIDGET */}
            {!isContractorProject && (
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
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Service Address (Pune)</label>
                  <button
                    type="button"
                    onClick={() => setShowGoogleMap(true)}
                    className="text-[10px] font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-0.5 rounded-lg border border-red-200 flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  >
                    <MapPin className="w-3 h-3 text-red-600 animate-bounce" />
                    <span>Pick on Google Map</span>
                  </button>
                </div>
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

            {/* Cost Split */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {isContractorProject ? 'Statutory Estimated Budget' : 'Service Price Breakdown'}
                  </span>
                  <span className="text-[9px] text-slate-400 block font-semibold">
                    {totalItemsCount > 0 
                      ? `Total for ${totalItemsCount} selected service${totalItemsCount > 1 ? 's' : ''}` 
                      : (isContractorProject ? `Cooperative benchmark for ${propertyType} (${scopeType})` : 'Standard Cooperative Tariff')}
                  </span>
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

              <div className="space-y-1 text-[11px] text-slate-700">
                <div className="flex items-center justify-between px-1">
                  <span>Doorstep OTP Verification</span>
                  <span className="font-bold text-emerald-700">Included</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span>Certified Cooperative Shramik</span>
                  <span className="font-bold text-blue-700">Guaranteed</span>
                </div>
                <div className="flex items-center justify-between px-1">
                  <span>Cooperative Service Warranty</span>
                  <span className="font-bold text-purple-700">30 Days</span>
                </div>
              </div>

              {isContractorProject && (
                <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-200">
                  💡 Final cost and crew composition confirmed in Mukaddam's workforce proposal based on site scope.
                </p>
              )}
            </div>

            {/* Direct Dispatch Button */}
            <button
              type="submit"
              disabled={isSubmitting || selectedServices.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-50 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting to Cooperative...</span>
              ) : (
                <span>
                  {isContractorProject
                    ? `Request Contractor Proposal (₹${finalAmount.toLocaleString('en-IN')} Est.) ➔`
                    : `Confirm & Book ${totalItemsCount > 1 ? `${totalItemsCount} Services` : (selectedService?.name || 'Service')} (₹${finalAmount.toLocaleString('en-IN')}) ➔`}
                </span>
              )}
            </button>

          </form>

        </div>

      </div>

      {/* Interactive Google Map Modal for Site Pinpoint */}
      {showGoogleMap && (
        <GoogleMapLocationModal
          isOpen={showGoogleMap}
          onClose={() => setShowGoogleMap(false)}
          currentLocation={currentCoords}
          onConfirmLocation={(newLoc) => {
            setCurrentCoords(newLoc);
            if (newLoc.address) setAddress(newLoc.address);
          }}
        />
      )}

      {/* Official Razorpay Payment Gateway Modal */}
      {showPaymentModal && paymentBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          booking={paymentBooking}
          onClose={() => {
            setShowPaymentModal(false);
            onBack();
          }}
          onPaymentSuccess={(result) => {
            setIsPaid(true);
            setPaidResult(result);
            if (paymentBooking?._id) {
              try {
                localStorage.setItem('karyasetu_last_paid_booking_id', paymentBooking._id);
              } catch {}
            }
            if (onPayBooking && paymentBooking._id) {
              onPayBooking(paymentBooking._id, 'UPI_RAZORPAY');
            }
            setShowPaymentModal(false);
            onBack();
          }}
        />
      )}

      {/* Official GST Tax Invoice Modal */}
      {showInvoiceModal && paymentBooking && (
        <TransparentInvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          booking={{
            ...paymentBooking,
            paymentStatus: 'PAID',
            status: 'COMPLETED',
            invoiceNumber: paidResult?.invoice?.invoiceNumber || paymentBooking.invoiceNumber || 'INV-KARYA-2026-001'
          }}
        />
      )}

    </div>
  );
};
