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
import { PaymentModal } from './PaymentModal';
import { InstitutionalRequestModal } from './InstitutionalRequestModal';
import { RatingModal } from './RatingModal';
import { DisputeModal } from './DisputeModal';
import { ServiceCategoryDetailPage, ServiceCategoryId } from './ServiceCategoryDetailPage';
import { MasterSectorDetailPage } from './MasterSectorDetailPage';
import { SectorShelfRow } from './SectorShelfRow';
import { CustomerLocationBar, PUNE_LOCALITIES } from './CustomerLocationBar';
import { GoogleMapLocationModal } from './GoogleMapLocationModal';
import { GeoLocationCoords } from '../../types';
import { MASTER_SECTORS, MasterSector } from '../../data/masterCatalog';
import { CartItem } from './CartDrawerModal';
import { searchCatalog } from '../../utils/searchCatalog';
import { ActiveBookingTrackerCard } from './ActiveBookingTrackerCard';

interface CustomerPortalProps {
  cooperatives: Cooperative[];
  workers: Worker[];
  bookings: Booking[];
  forecasts: DemandForecast[];
  currentLanguage: Language;
  onBookService: (data: any) => Promise<any>;
  onEmergencyBooking: (data: any) => Promise<void>;
  onUpdateBookingStatus: (id: string, status: string) => Promise<void>;
  onVerifyOtp?: (id: string, otp: string) => Promise<any>;
  onPayBooking: (id: string, paymentMethod?: string) => Promise<void>;
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
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  preselectedService?: any;
  onClearPreselectedService?: () => void;
  onSelectService?: (sectorId: string, service: any) => void;
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
  onVerifyOtp,
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
  onApproveProposal,
  searchQuery = '',
  onSearchChange,
  preselectedService: propPreselectedService,
  onClearPreselectedService,
  onSelectService
}) => {
  const t = translations[currentLanguage];

  // 2-Page Routing: 'HOME' vs Master Sector / Legacy Category
  const [subView, setSubView] = useState<'HOME' | string>('HOME');

  // Domain Switcher: Home Services vs Projects & Contracts
  const [activeDomain, setActiveDomain] = useState<'HOME_SERVICES' | 'PROJECTS_CONTRACTS'>('HOME_SERVICES');
  const [customerLocation, setCustomerLocation] = useState<GeoLocationCoords>(PUNE_LOCALITIES[0]);
  const [showGoogleMapModal, setShowGoogleMapModal] = useState(false);

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showWelfareModal, setShowWelfareModal] = useState(false);
  const [activeViewingBooking, setActiveViewingBooking] = useState<Booking | null>(null);
  const [preselectedService, setPreselectedService] = useState<any>(propPreselectedService || null);
  const [selectedActiveBookingId, setSelectedActiveBookingId] = useState<string | null>(null);
  const [dismissedBookingIds, setDismissedBookingIds] = useState<string[]>([]);
  const [recentlyPaidBookingId, setRecentlyPaidBookingId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('karyasetu_last_paid_booking_id') || null;
    } catch {
      return null;
    }
  });

  // Sync recently paid booking ID whenever subView or bookings change
  useEffect(() => {
    try {
      const storedId = localStorage.getItem('karyasetu_last_paid_booking_id');
      if (storedId && storedId !== recentlyPaidBookingId) {
        setRecentlyPaidBookingId(storedId);
      }
    } catch {}
  }, [subView, bookings]);

  useEffect(() => {
    if (propPreselectedService) {
      setPreselectedService(propPreselectedService);
    }
  }, [propPreselectedService]);

  const activeBookingRef = useRef<HTMLDivElement>(null);
  
  // STRICT RULE: Only show services that the customer has RECENTLY or CURRENTLY PAID FOR (paymentStatus === 'PAID')
  // Never show unpaid/pending services in the active arrival tracker!
  const paidOngoingBookings = bookings.filter(b => 
    b.paymentStatus === 'PAID' && 
    b.status !== 'CANCELLED' && 
    b.status !== 'COMPLETED' && 
    !dismissedBookingIds.includes(b._id)
  );

  // If a paid booking was recently paid for (via state or localStorage), strictly prioritize it!
  const recentlyPaidBooking = recentlyPaidBookingId 
    ? bookings.find(b => b._id === recentlyPaidBookingId && b.paymentStatus === 'PAID' && !dismissedBookingIds.includes(b._id))
    : null;

  // If user explicitly selected another active paid booking
  const selectedBooking = selectedActiveBookingId 
    ? bookings.find(b => b._id === selectedActiveBookingId && b.paymentStatus === 'PAID' && !dismissedBookingIds.includes(b._id)) 
    : null;

  // Active booking strictly requires paymentStatus === 'PAID'
  const activeBooking = (recentlyPaidBooking && recentlyPaidBooking.status !== 'CANCELLED')
    ? recentlyPaidBooking
    : (selectedBooking || paidOngoingBookings[0] || null);

  // Active bookings list to pass to tracker: ONLY paid ongoing bookings + recently paid completed booking (if completed during session)
  const activeBookings = (
    activeBooking && activeBooking.status === 'COMPLETED' && !paidOngoingBookings.some(b => b._id === activeBooking._id)
      ? [activeBooking, ...paidOngoingBookings]
      : paidOngoingBookings
  );

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
          onBack={() => { 
            setSubView('HOME'); 
            setPreselectedService(null); 
            onClearPreselectedService?.();
          }}
          onSubmitBooking={onBookService}
          onPayBooking={onPayBooking}
          workers={workers}
          initialService={preselectedService}
          customerLocation={customerLocation}
          currentLanguage={currentLanguage}
          cart={cart}
          onAddToCart={onAddToCart}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem || onRemoveFromCart}
          onClearCart={onClearCart}
          onOpenCart={onOpenCart}
        />
      );
    }

    // Otherwise render standard category detail page
    return (
      <ServiceCategoryDetailPage
        categoryId={subView as ServiceCategoryId}
        onBack={() => setSubView('HOME')}
        onSubmitBooking={onBookService}
        onPayBooking={onPayBooking}
        workers={workers}
        cart={cart}
        onAddToCart={onAddToCart || (() => {})}
        onUpdateQuantity={onUpdateQuantity || (() => {})}
        onRemoveItem={onRemoveItem || onRemoveFromCart || (() => {})}
        onClearCart={onClearCart}
      />
    );
  }

  const searchResults = searchCatalog(searchQuery || '', 12);

  // Filter sectors by active domain, and refine when search is active
  const visibleSectors = MASTER_SECTORS.filter(s => {
    if (s.domain !== activeDomain) return false;
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return s.title.toLowerCase().includes(q) || 
           s.shortTitle.toLowerCase().includes(q) ||
           s.subTradesList.some(st => st.toLowerCase().includes(q)) ||
           s.subTrades.some(st => st.services.some(svc => svc.name.toLowerCase().includes(q) || svc.description.toLowerCase().includes(q)));
  });

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
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
            {activeDomain === 'HOME_SERVICES' ? t.portal.homeServicesHeadline : t.portal.contractorHeadline}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            {activeDomain === 'HOME_SERVICES' ? t.portal.homeServicesSubtitle : t.portal.contractorSubtitle}
          </p>

          {/* Unified Single Location Bar */}
          <div className="w-full max-w-xl mx-auto pt-1">
            <CustomerLocationBar
              currentLocation={customerLocation}
              onLocationChange={(newLoc) => {
                setCustomerLocation(newLoc);
              }}
              onOpenMap={() => setShowGoogleMapModal(true)}
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
                <span>{t.portal.homeServicesTab}</span>
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
                <span>{t.portal.projectsTab}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 1.1 LIVE ACTIVE SERVICE & DOORSTEP OTP TRACKER CARD */}
      {activeBooking && (
        <section ref={activeBookingRef} className="max-w-[1360px] mx-auto animate-fadeIn px-4 sm:px-6 my-4">
          <ActiveBookingTrackerCard
            booking={activeBooking}
            allActiveBookings={activeBookings}
            onSelectBooking={(b) => setSelectedActiveBookingId(b._id)}
            onDismiss={() => {
              if (activeBooking) {
                setDismissedBookingIds(prev => [...prev, activeBooking._id]);
                setSelectedActiveBookingId(null);
                if (recentlyPaidBookingId === activeBooking._id) {
                  setRecentlyPaidBookingId(null);
                  try {
                    localStorage.removeItem('karyasetu_last_paid_booking_id');
                  } catch {}
                }
              }
            }}
            workers={workers}
            onUpdateBookingStatus={async (id, status) => {
              setSelectedActiveBookingId(id);
              await onUpdateBookingStatus(id, status);
            }}
            onVerifyOtp={async (id, otp) => {
              setSelectedActiveBookingId(id);
              if (onVerifyOtp) {
                return await onVerifyOtp(id, otp);
              }
            }}
            onOpenPayment={(b) => {
              setPaymentBooking(b);
              setShowPaymentModal(true);
            }}
            onOpenInvoice={(b) => {
              setActiveViewingBooking(b);
              setShowInvoiceModal(true);
            }}
            onOpenRating={(b) => {
              setActiveViewingBooking(b);
              setShowRatingModal(true);
            }}
            currentLanguage={currentLanguage}
          />
        </section>
      )}

      {/* 1.2 SEARCH RESULTS SHELF (When search query is entered from Navbar) */}
      {searchQuery && searchQuery.trim().length > 0 && (
        <section className="max-w-[1360px] mx-auto space-y-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-orange-400/40 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-black flex-shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>{t.portal.searchResultsFor}</span>
                    <span className="text-orange-600">"{searchQuery}"</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t.portal.foundServices} {searchResults.totalMatches} {t.portal.verifiedServices}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>{t.portal.clearSearch}</span>
              </button>
            </div>

            {searchResults.services.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.services.map((item) => (
                  <div
                    key={item.service.id}
                    className="p-4 rounded-2xl bg-slate-50/80 hover:bg-white border border-slate-200 hover:border-orange-300 hover:shadow-lg transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                          {item.subTrade.title}
                        </span>
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{item.service.rating}</span>
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 group-hover:text-orange-600 transition leading-snug">
                        {item.service.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {item.service.description}
                      </p>
                      <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.service.duration}</span>
                        <span>•</span>
                        <span>{item.sector.shortTitle}</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-black text-slate-900">
                          ₹{item.service.price}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          {t.portal.gazettedRate}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onAddToCart && (
                          <button
                            type="button"
                            onClick={() => onAddToCart({
                              id: item.service.id,
                              name: item.service.name,
                              price: item.service.price,
                              category: item.sector.title,
                              quantity: 1,
                              duration: item.service.duration
                            })}
                            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer shadow-2xs"
                            title="Add to Booking Cart"
                          >
                            + Cart
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectService) {
                              onSelectService(item.sector.id, item.service);
                            } else {
                              setPreselectedService(item.service);
                              setSubView(item.sector.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-orange-600 text-white text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-slate-500 space-y-2">
                <p className="font-semibold text-slate-700">No cooperative services found matching "{searchQuery}".</p>
                <p className="text-[11px] text-slate-400">Try common searches: electrician, plumber, AC, cleaning, painting, carpentry.</p>
              </div>
            )}
          </div>
        </section>
      )}

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
                <span>Government-Certified Cooperative Service. Escrow payment released upon OTP verification.</span>
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
              {t.portal.allSectorsSubtitle}
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t.portal.gazettedWagesBadge}</span>
          </span>
        </div>

        {/* Services Listed One Below One (Each Sector as a Full-Width Section with Sub-Services and See All) */}
        <div className="space-y-6">
          {visibleSectors.map((sector) => (
            <div 
              key={sector.id}
              className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition"
            >
              <SectorShelfRow
                sector={sector}
                currentLanguage={currentLanguage}
                onSeeAll={(secId) => setSubView(secId)}
                onSelectService={(secId, service) => {
                  setPreselectedService(service);
                  setSubView(secId);
                  onSelectService?.(secId, service);
                }}
              />
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
                Karya SOS Priority Emergency Dispatch (&lt;15 Mins)
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
            <span>{t.portal.sosBtn}</span>
          </button>
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

      {showPaymentModal && paymentBooking && (
        <PaymentModal
          isOpen={showPaymentModal}
          booking={paymentBooking}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={() => {
            if (paymentBooking) {
              try {
                localStorage.setItem('karyasetu_last_paid_booking_id', paymentBooking._id);
              } catch {}
              setRecentlyPaidBookingId(paymentBooking._id);
              setSelectedActiveBookingId(paymentBooking._id);
            }
            onPayBooking(paymentBooking._id);
          }}
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
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 shrink-0 shadow-2xs">
                  <img src="/karyasetu-logo.png" alt="KaryaSetu Logo" className="w-full h-full object-contain rounded-md" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-none">National Cooperative Charter</h3>
                  <span className="text-[10px] text-emerald-700 font-bold">KaryaSetu Verified</span>
                </div>
              </div>
              <button onClick={() => setShowWelfareModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">✕</button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              KaryaSetu is built in compliance with the Ministry of Cooperation, Government of India. Every registered worker receives gazetted minimum wages, PM-JAY medical benefits, and verified digital identity through e-Shram.
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

      {/* Google Map Interactive Location Selector Modal */}
      {showGoogleMapModal && (
        <GoogleMapLocationModal
          isOpen={showGoogleMapModal}
          onClose={() => setShowGoogleMapModal(false)}
          currentLocation={customerLocation}
          onConfirmLocation={(newLoc) => {
            setCustomerLocation(newLoc);
          }}
        />
      )}

    </div>
  );
};
