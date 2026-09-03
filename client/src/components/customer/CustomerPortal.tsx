import React, { useState, useRef, useEffect } from 'react';
import { Booking, Cooperative, Worker, DemandForecast } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { 
  Zap, Wrench, Hammer, Paintbrush, Sparkles, Tv, Heart, 
  Building2, Clock, CheckCircle2, AlertTriangle, MapPin, Phone, 
  CreditCard, FileText, Star, ChevronRight, ChevronLeft, Search, ShieldCheck, 
  Car, Home, AlertCircle, ArrowRight, Shield, Layers, Info, X, HeartHandshake,
  Users, Briefcase, Award, Check, Shovel
} from 'lucide-react';
import { EmergencySOSModal } from './EmergencySOSModal';
import { TransparentInvoiceModal } from './TransparentInvoiceModal';
import { InstitutionalRequestModal } from './InstitutionalRequestModal';
import { RatingModal } from './RatingModal';
import { DisputeModal } from './DisputeModal';
import { ServiceCategoryDetailPage, ServiceCategoryId } from './ServiceCategoryDetailPage';
import { MasterSectorDetailPage } from './MasterSectorDetailPage';
import { SectorShelfRow } from './SectorShelfRow';
import { CustomerLocationBar, PUNE_LOCALITIES } from './CustomerLocationBar';
import { GeoLocationCoords } from '../../types';
import { MASTER_SECTORS, MasterSector } from '../../data/masterCatalog';
import { CartItem } from './CartDrawerModal';

interface CustomerPortalProps {
  cooperatives: Cooperative[];
  workers: Worker[];
  bookings: Booking[];
  forecasts: DemandForecast[];
  currentLanguage: Language;
  onBookService: (data: any) => Promise<void>;
  onEmergencyBooking: (data: any) => Promise<void>;
  onUpdateBookingStatus: (id: string, status: string) => Promise<void>;
  onPayBooking: (id: string) => Promise<void>;
  onRateBooking: (id: string, ratings: any) => Promise<void>;
  onRequestContract: (contractData: any) => Promise<void>;
  onSubmitDispute: (disputeData: any) => Promise<void>;
  openCategoryNavTrigger?: string;
  openActiveBookingTrigger?: number;
  externalCategorySelect?: ServiceCategoryId | null;
  cart?: CartItem[];
  onAddToCart?: (item: any) => void;
  onUpdateQuantity?: (id: string, delta: number) => void;
  onRemoveItem?: (id: string) => void;
  onRemoveFromCart?: (id: string) => void;
  onClearCart?: () => void;
  onOpenCart?: () => void;
  onApproveProposal?: (bookingId: string) => Promise<any>;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  cooperatives,
  workers,
  bookings,
  forecasts,
  currentLanguage,
  onBookService,
  onEmergencyBooking,
  onUpdateBookingStatus,
  onPayBooking,
  onRateBooking,
  onRequestContract,
  onSubmitDispute,
  openCategoryNavTrigger,
  openActiveBookingTrigger,
  externalCategorySelect,
  cart = [],
  onAddToCart,
  onUpdateQuantity,
  onRemoveItem,
  onRemoveFromCart,
  onClearCart,
  onOpenCart,
  onApproveProposal
}) => {
  const t = translations[currentLanguage];

  // 2-Page Routing: 'HOME' vs Master Sector / Legacy Category
  const [subView, setSubView] = useState<'HOME' | string>('HOME');

  // Domain Switcher: Home Services vs Projects & Contracts
  const [activeDomain, setActiveDomain] = useState<'HOME_SERVICES' | 'PROJECTS_CONTRACTS'>('HOME_SERVICES');
  const [customerLocation, setCustomerLocation] = useState<GeoLocationCoords>(PUNE_LOCALITIES[0]);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [activeViewingBooking, setActiveViewingBooking] = useState<Booking | null>(null);
  const [preselectedService, setPreselectedService] = useState<any>(null);

  const activeBookingRef = useRef<HTMLDivElement>(null);
  const activeBooking = bookings[0] || null;

  // React to navbar triggers
  useEffect(() => {
    if (openCategoryNavTrigger === 'HOMES') {
      setSubView('HOME');
      setActiveDomain('HOME_SERVICES');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (openCategoryNavTrigger === 'INSTITUTIONAL') {
      setSubView('HOME');
      setActiveDomain('PROJECTS_CONTRACTS');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (openCategoryNavTrigger === 'WELFARE') {
      setShowWelfareModal(true);
    }
  }, [openCategoryNavTrigger]);

  useEffect(() => {
    if (openActiveBookingTrigger) {
      if (activeBooking && activeBookingRef.current) {
        activeBookingRef.current.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert('No active booking right now. You can browse and select services below!');
      }
    }
  }, [openActiveBookingTrigger]);

  useEffect(() => {
    if (externalCategorySelect) {
      setSubView(externalCategorySelect);
    }
  }, [externalCategorySelect]);

  // If a category detail view is selected -> REDIRECT TO SECOND PAGE!
  if (subView !== 'HOME') {
    // Check if it's one of the 12 master sectors
    const isMasterSector = MASTER_SECTORS.some(s => s.id === subView);
    if (isMasterSector) {
      return (
        <MasterSectorDetailPage
          sectorId={subView}
          onBack={() => { setSubView('HOME'); setPreselectedService(null); }}
          onSubmitBooking={onBookService}
          workers={workers}
          initialService={preselectedService}
          customerLocation={customerLocation}
        />
      );
    }

    // Otherwise render standard category detail page
    return (
      <ServiceCategoryDetailPage
        categoryId={subView as ServiceCategoryId}
        onBack={() => setSubView('HOME')}
        onSubmitBooking={onBookService}
        workers={workers}
        cart={cart}
        onAddToCart={onAddToCart || (() => {})}
        onUpdateQuantity={onUpdateQuantity || (() => {})}
        onRemoveItem={onRemoveItem || onRemoveFromCart || (() => {})}
        onClearCart={onClearCart}
      />
    );
  }

  // Filter sectors by active domain
  const visibleSectors = MASTER_SECTORS.filter(s => s.domain === activeDomain);

  // Helper function to render Lucide icon by name
  const renderSectorIcon = (name: string) => {
    switch (name) {
      case 'Wrench': return <Wrench className="w-5 h-5 text-amber-600" />;
      case 'Tv': return <Tv className="w-5 h-5 text-blue-600" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-emerald-600" />;
      case 'Shovel': return <Shovel className="w-5 h-5 text-lime-600" />;
      case 'Heart': return <Heart className="w-5 h-5 text-rose-600" />;
      case 'Car': return <Car className="w-5 h-5 text-indigo-600" />;
      case 'AlertTriangle': return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'Building2': return <Building2 className="w-5 h-5 text-sky-700" />;
      case 'Users': return <Users className="w-5 h-5 text-blue-700" />;
      case 'FileText': return <FileText className="w-5 h-5 text-purple-700" />;
      default: return <Wrench className="w-5 h-5 text-slate-700" />;
    }
  };

  return (
    <div className="space-y-10 font-sans pb-16">
      
      {/* 1. TOP SOVEREIGN HEADER & DOMAIN SELECTOR */}
      <section className="pt-2 sm:pt-4 space-y-5">
        <div className="max-w-[1360px] mx-auto text-center space-y-3">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-2xs text-[11px] font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            <span className="uppercase tracking-wider">National Cooperative Digital Public Infrastructure • NCCT</span>
            <span className="w-2 h-2 rounded-full bg-[#138808]" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {activeDomain === 'HOME_SERVICES' ? 'Home services at your doorstep' : 'Contractor & Institutional Projects'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Choose a main service sector to view verified trade shramiks, transparent gazetted rates, and direct cooperative booking.
          </p>

          {/* Customer Geo-Location Hub Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <span>📍 Service Location:</span>
            </span>
            <CustomerLocationBar
              currentLocation={customerLocation}
              onLocationChange={(newLoc) => {
                setCustomerLocation(newLoc);
              }}
            />
          </div>

          {/* Domain Switcher Buttons */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xs gap-1.5">
              <button
                type="button"
                onClick={() => setActiveDomain('HOME_SERVICES')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
                  activeDomain === 'HOME_SERVICES'
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Home className="w-4 h-4 text-orange-400" />
                <span>🏠 Home Services (8 Main Sectors)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveDomain('PROJECTS_CONTRACTS')}
                className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-2 cursor-pointer ${
                  activeDomain === 'PROJECTS_CONTRACTS'
                    ? 'bg-blue-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-300" />
                <span>🏗️ Projects & Contracts (4 Contractor Sectors)</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 1.5 CONTRACTOR WORKFORCE PROPOSAL REVIEW CARDS */}
      {bookings.filter(b => b.status === 'PROPOSAL_RECEIVED').map((propBooking) => (
        <div key={propBooking._id} className="max-w-[1360px] mx-auto animate-fadeIn mb-2">
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 rounded-3xl p-6 text-white border-2 border-blue-500/50 shadow-2xl space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-black text-2xl shadow-inner">
                  📋
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/40">
                      Contractor Proposal Received
                    </span>
                    <span className="text-xs text-slate-300">
                      from Mukaddam <strong>{propBooking.contractorName || 'Balasaheb Shinde'}</strong>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    "{propBooking.projectScope?.taskDescription || propBooking.subTrade}"
                  </h3>
                  <p className="text-xs text-slate-300">
                    Property: <strong>{propBooking.projectScope?.propertyType || '3 BHK'}</strong> • Scope: <strong>{propBooking.projectScope?.scopeType || 'Interior'}</strong> • {propBooking.address}
                  </p>
                </div>
              </div>

              <div className="text-right sm:self-auto self-start">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Statutory Proposal Cost</span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  ₹{propBooking.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Recommended Workforce Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-300 block">👨‍🎨 Recommended Workforce</span>
                <strong className="text-sm font-black text-white block">
                  {propBooking.proposal?.workforce?.map(w => `${w.count} ${w.role}`).join(' + ') || `${propBooking.teamSize || 4} Verified Shramiks`}
                </strong>
                <p className="text-[11px] text-slate-400">Determined by Mukaddam based on site scope</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">📅 Estimated Duration</span>
                <strong className="text-sm font-black text-white block">
                  {propBooking.proposal?.estimatedDurationDays || propBooking.projectDurationDays || 4} Days
                </strong>
                <p className="text-[11px] text-slate-400">Turnaround time from start to completion</p>
              </div>

              <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">🛠️ Depot Equipment</span>
                <strong className="text-sm font-black text-white block truncate">
                  {propBooking.proposal?.materialsAndEquipment?.join(', ') || 'Scaffolding, Putty Sanders & PPE'}
                </strong>
                <p className="text-[11px] text-slate-400">Supplied from cooperative tool depot</p>
              </div>
            </div>

            {/* Proposal Notes */}
            {propBooking.proposal?.notes && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-300 italic">
                Mukaddam Note: "{propBooking.proposal.notes}"
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Statutory 80/10/6/4 Fair Wage Split. 80% direct to workers, 6% to PM-JAY medical coverage.</span>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if (onApproveProposal) {
                    await onApproveProposal(propBooking._id);
                  }
                }}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Contractor Plan & Start Work ➔</span>
              </button>
            </div>

          </div>
        </div>
      ))}

      {/* 2. ACTIVE SERVICE PROGRESS BANNER (If a booking exists) */}
      {activeBooking && (
        <div ref={activeBookingRef} className="max-w-[1360px] mx-auto">
          <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
              <div>
                <strong className="text-xs font-black text-slate-900 uppercase">
                  Active On-Site Job: {activeBooking.serviceCategory} ({activeBooking.subTrade})
                </strong>
                <p className="text-xs text-slate-600 mt-0.5">
                  Worker: <strong>{activeBooking.workerName}</strong> • Status: <span className="font-bold text-emerald-800">{activeBooking.status}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-900 mr-2">
                ₹{activeBooking.totalAmount.toLocaleString('en-IN')}
              </span>
              {activeBooking.status !== 'COMPLETED' && (
                <button
                  onClick={() => onUpdateBookingStatus(activeBooking._id, 'IN_PROGRESS')}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  Worker On-Site
                </button>
              )}
              {activeBooking.paymentStatus === 'PENDING' && (
                <button
                  onClick={() => onPayBooking(activeBooking._id)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay & Settle Split</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MAIN GROUP SERVICES DISPLAY (All Sectors Listed - Click redirects to second page) */}
      <section className="max-w-[1360px] mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span>{activeDomain === 'HOME_SERVICES' ? 'All Cooperative Service Sectors' : 'Contractor & Institutional Sectors'}</span>
              <span className="text-xs font-extrabold text-orange-800 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-200">
                {visibleSectors.length} Sectors
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Click on any main sector below to view all services and certified shramiks under that sector.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Govt Gazetted Minimum Wages</span>
          </span>
        </div>

        {/* 8 Main Groups Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {visibleSectors.map((sector, index) => (
            <div
              key={sector.id}
              onClick={() => setSubView(sector.id)}
              className="group bg-white rounded-3xl overflow-hidden border border-slate-200 hover:border-slate-400 hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
            >
              {/* Sector Header Image Banner */}
              <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={sector.heroImage}
                  alt={sector.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                
                {/* Sector Index & Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-slate-950/90 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-xs border border-white/20 flex items-center gap-1.5">
                    <span>{sector.id === 'emergency-services' ? '🚨' : `#${index + 1}`}</span>
                    <span>{sector.shortTitle}</span>
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <span className="text-amber-400 font-extrabold">★ {sector.rating}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-200 text-[11px]">{sector.bookingsCount}</span>
                  </span>
                  <span className="text-[10px] font-black bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded-md text-white">
                    {sector.subTrades.length} Sub-Trades
                  </span>
                </div>
              </div>

              {/* Sector Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 group-hover:text-blue-900 transition leading-snug">
                    {sector.title}
                  </h3>

                  {/* Sub-Trade Tags Preview */}
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {sector.subTrades.slice(0, 5).map((st) => (
                      <span
                        key={st.id}
                        className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200/70"
                      >
                        {st.title}
                      </span>
                    ))}
                    {sector.subTrades.length > 5 && (
                      <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/60">
                        +{sector.subTrades.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Cooperative Assurance & Action */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{sector.shramiksAvailable} Ready</span>
                  </span>

                  <span className="font-black text-slate-900 group-hover:text-orange-600 flex items-center gap-1 transition">
                    <span>View Services</span>
                    <span>➔</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. EMERGENCY SOS PRIORITY STRIP */}
      <section className="max-w-[1360px] mx-auto">
        <div className="p-4 rounded-3xl bg-rose-50 border border-rose-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-black text-slate-900 block">
                Sahakar SOS Priority Emergency Dispatch (&lt;15 Mins)
              </strong>
              <p className="text-xs text-slate-600">
                Critical water pipeline burst, power failure, short circuit, structural minor hazard, or lockout crisis.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSubView('emergency-services')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-sm transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
          >
            <span>Trigger Emergency Dispatch ➔</span>
          </button>
        </div>
      </section>

      {/* 5. COOPERATIVE TRANSPARENCY & STATUTORY WAGES */}
      <section className="max-w-[1360px] mx-auto">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-orange-400 block mb-1">
                Sovereign Public Infrastructure • NCCT
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                The 80 / 10 / 6 / 4 Fair Labour Protocol
              </h2>
            </div>
            <button
              onClick={() => setShowWelfareModal(true)}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verify Sovereign Charter</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">80%</span>
              <strong className="text-xs font-bold block text-white">Worker Take-Home</strong>
              <p className="text-[11px] text-slate-400">Directly transferred to worker bank account without platform cuts.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-blue-400">10%</span>
              <strong className="text-xs font-bold block text-white">Tool Depot & Equipment</strong>
              <p className="text-[11px] text-slate-400">Cooperative depot tools, high-pressure machines, and safety kits.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">6%</span>
              <strong className="text-xs font-bold block text-white">PM-JAY Health & Safety</strong>
              <p className="text-[11px] text-slate-400">Government insurance, accidental coverage, and pensions.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-2xl sm:text-3xl font-black text-purple-400">4%</span>
              <strong className="text-xs font-bold block text-white">DPI Digital Rail</strong>
              <p className="text-[11px] text-slate-400">Open-source digital public rail server & infrastructure operations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MODALS */}
      {showEmergencyModal && (
        <EmergencySOSModal
          isOpen={showEmergencyModal}
          onClose={() => setShowEmergencyModal(false)}
          onSubmitEmergency={onEmergencyBooking}
        />
      )}

      {showInvoiceModal && activeViewingBooking && (
        <TransparentInvoiceModal
          isOpen={showInvoiceModal}
          booking={activeViewingBooking}
          onClose={() => setShowInvoiceModal(false)}
        />
      )}

      {showContractModal && (
        <InstitutionalRequestModal
          isOpen={showContractModal}
          onClose={() => setShowContractModal(false)}
          onSubmitContract={onRequestContract}
        />
      )}

      {showRatingModal && activeViewingBooking && (
        <RatingModal
          isOpen={showRatingModal}
          booking={activeViewingBooking}
          onClose={() => setShowRatingModal(false)}
          onSubmitRating={onRateBooking}
        />
      )}

      {showDisputeModal && activeViewingBooking && (
        <DisputeModal
          isOpen={showDisputeModal}
          booking={activeViewingBooking}
          onClose={() => setShowDisputeModal(false)}
          onSubmitDispute={onSubmitDispute}
        />
      )}

      {showWelfareModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-black text-slate-900 text-base">National Cooperative Charter</h3>
              </div>
              <button onClick={() => setShowWelfareModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              SahakarSetu is built in compliance with the National Council for Cooperative Training (NCCT) and the Ministry of Cooperation, Government of India. Every registered worker receives gazetted minimum wages, PM-JAY medical benefits, and verified digital identity through e-Shram.
            </p>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-bold">
              ✓ 100% Cooperative • Zero Private Intermediary Extraction
            </div>
            <button
              onClick={() => setShowWelfareModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-950 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
            >
              Close Charter
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
