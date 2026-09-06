import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, HeartHandshake, MapPin, Calendar, Clock, Sparkles, 
  Users, Briefcase, User, Award, CheckCircle2, ChevronDown, Wrench, 
  Zap, Hammer, Paintbrush, Tv, Heart, Car, Star, Layers
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCategory: string;
  subTrade: string;
  defaultPrice: number;
  currentUser?: { name: string; phone: string; address?: string } | null;
  onSubmitBooking: (data: {
    customerName: string;
    customerPhone: string;
    serviceCategory: string;
    subTrade: string;
    address: string;
    estimatedAmount: number;
    bookingMode?: 'SOLO_WORKER' | 'CONTRACTOR_TEAM';
    teamSize?: number;
    projectDurationDays?: number;
    workerType?: string;
    workerTier?: 'STANDARD' | 'MASTER' | 'HELPER';
    projectScope?: {
      taskDescription?: string;
      propertyType?: string;
      scopeType?: string;
      approxAreaSqFt?: number;
      specialRequirements?: string;
    };
  }) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  serviceCategory,
  subTrade,
  defaultPrice,
  currentUser,
  onSubmitBooking
}) => {
  const { t, getSectorTitle, getServiceName } = useLanguage();
  const [bookingMode, setBookingMode] = useState<'SOLO_WORKER' | 'CONTRACTOR_TEAM'>('SOLO_WORKER');
  
  // Customer site scope details (Customer does NOT guess worker count)
  const [propertyType, setPropertyType] = useState<string>('3 BHK');
  const [scopeType, setScopeType] = useState<string>('Interior');
  const [approxArea, setApproxArea] = useState<string>('1,200 sq.ft');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');

  // Worker Type and Skill Tier States
  const [selectedWorkerType, setSelectedWorkerType] = useState<string>(() => {
    if (serviceCategory.toLowerCase().includes('elec')) return 'Electrician & Wireman';
    if (serviceCategory.toLowerCase().includes('plumb')) return 'Plumber & Pipeline Specialist';
    if (serviceCategory.toLowerCase().includes('paint')) return 'Painter & Waterproofing Artisan';
    if (serviceCategory.toLowerCase().includes('clean')) return 'Deep Cleaner & Sanitization Shramik';
    if (serviceCategory.toLowerCase().includes('carp')) return 'Carpenter & Locksmith';
    if (serviceCategory.toLowerCase().includes('maid')) return 'House Maid & Home Cook';
    if (serviceCategory.toLowerCase().includes('care')) return 'Caregiver & Nursing Assistant';
    if (serviceCategory.toLowerCase().includes('driv')) return 'Driver on Demand';
    return 'Certified Skilled Technician';
  });

  const [selectedWorkerTier, setSelectedWorkerTier] = useState<'STANDARD' | 'MASTER' | 'HELPER'>('STANDARD');

  const [customerName, setCustomerName] = useState(currentUser?.name || 'Registered Customer');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '+91 98224 00000');
  const [address, setAddress] = useState(currentUser?.address || 'Kothrud, Pune 411038');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setCustomerName(currentUser.name);
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

  // Sync worker type if serviceCategory prop changes
  useEffect(() => {
    if (serviceCategory.toLowerCase().includes('elec')) setSelectedWorkerType('Electrician & Wireman');
    else if (serviceCategory.toLowerCase().includes('plumb')) setSelectedWorkerType('Plumber & Pipeline Specialist');
    else if (serviceCategory.toLowerCase().includes('paint')) setSelectedWorkerType('Painter & Waterproofing Artisan');
    else if (serviceCategory.toLowerCase().includes('clean')) setSelectedWorkerType('Deep Cleaner & Sanitization Shramik');
    else if (serviceCategory.toLowerCase().includes('carp')) setSelectedWorkerType('Carpenter & Locksmith');
    else if (serviceCategory.toLowerCase().includes('maid')) setSelectedWorkerType('House Maid & Home Cook');
    else if (serviceCategory.toLowerCase().includes('care')) setSelectedWorkerType('Caregiver & Nursing Assistant');
    else if (serviceCategory.toLowerCase().includes('driv')) setSelectedWorkerType('Driver on Demand');
  }, [serviceCategory]);

  if (!isOpen) return null;

  // Base calculation
  let basePrice = defaultPrice || 500;
  if (selectedWorkerTier === 'MASTER') basePrice += 150; // Master Craftsman gazetted rate
  if (selectedWorkerTier === 'HELPER') basePrice = Math.max(250, basePrice - 100);

  const contractorBenchmarkAmount = propertyType === '1 BHK' ? 4500
    : propertyType === '2 BHK' ? 7500
    : propertyType === '3 BHK' ? 12000
    : propertyType === '4+ BHK / Villa' ? 18000
    : propertyType === 'Office' ? 15000
    : 35000;

  const estimatedAmount = bookingMode === 'SOLO_WORKER'
    ? basePrice
    : contractorBenchmarkAmount;

  // Real-time split calculations
  const workerAmount = Math.round(estimatedAmount * 0.80);
  const coopAmount = Math.round(estimatedAmount * 0.10);
  const welfareAmount = Math.round(estimatedAmount * 0.06);
  const platformAmount = estimatedAmount - (workerAmount + coopAmount + welfareAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitBooking({
        customerName,
        customerPhone,
        serviceCategory,
        subTrade: bookingMode === 'CONTRACTOR_TEAM' 
          ? `${selectedWorkerType} Project (${propertyType})`
          : subTrade,
        address,
        estimatedAmount,
        bookingMode,
        teamSize: 0, // Customer does NOT guess worker count! Contractor plans and sizes the crew.
        projectDurationDays: 0,
        workerType: selectedWorkerType,
        workerTier: selectedWorkerTier,
        projectScope: bookingMode === 'CONTRACTOR_TEAM' ? {
          taskDescription: `${selectedWorkerType} for ${propertyType} (${scopeType})`,
          propertyType,
          scopeType,
          approxAreaSqFt: parseInt(approxArea.replace(/[^0-9]/g, '')) || (propertyType.includes('1') ? 550 : propertyType.includes('2') ? 850 : 1200),
          specialRequirements
        } : undefined
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[90dvh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block">
              {t.modals?.booking?.title || 'Cooperative Workforce Dispatch'}
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              {t.bookService || 'Book'} {getSectorTitle(serviceCategory, serviceCategory)} ({subTrade})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto flex-1">
          
          {/* 1. SELECT TYPE OF WORKER (Primary Requested Feature) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-orange-600" />
                <span>{t.modals?.booking?.workerType || 'Select Type of Worker (Trade Role)'}</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{t.sectorDetail?.verifiedRail || 'Accredited Roster'}</span>
            </div>

            <select
              value={selectedWorkerType}
              onChange={(e) => setSelectedWorkerType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white font-bold text-slate-900 focus:ring-2 focus:ring-slate-900"
            >
              <option value="Electrician & Wireman">⚡ Electrician & Wireman (Domestic, Inverter, MCB)</option>
              <option value="Plumber & Pipeline Specialist">💧 Plumber & Pipeline Specialist (Sanitary, RO, Valves)</option>
              <option value="Painter & Waterproofing Artisan">🎨 Painter & Waterproofing Artisan (Emulsion, Sealing)</option>
              <option value="Carpenter & Locksmith">🔨 Carpenter & Locksmith (Furniture, Smart Locks)</option>
              <option value="Deep Cleaner & Sanitization Shramik">🧹 Deep Cleaner & Floor Buffing Shramik</option>
              <option value="House Maid & Home Cook">🍳 House Maid & Home Cook (Daily/Monthly Support)</option>
              <option value="Caregiver & Nursing Assistant">🩺 Caregiver & Elderly Nursing Support</option>
              <option value="Driver on Demand">🚗 Driver on Demand (City & Outstation Trips)</option>
              <option value="AC & Appliance Repair Technician">❄️ AC & Appliance Repair Technician</option>
              <option value="Mason & Civil Craftsman">🧱 Mason & Civil Craftsman (Plastering & Tiling)</option>
            </select>
          </div>

          {/* Service Delivery Model: Solo Worker vs Contractor Community */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {t.sectorDetail?.serviceDeliveryModel || 'Service Delivery Model'}
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setBookingMode('SOLO_WORKER')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  bookingMode === 'SOLO_WORKER'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  bookingMode === 'SOLO_WORKER' ? 'bg-slate-800 text-emerald-400' : 'bg-white text-slate-700'
                }`}>
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-xs block">{t.sectorDetail?.soloWorker || 'Solo Worker'}</span>
                  <span className={`text-[10px] ${bookingMode === 'SOLO_WORKER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    {t.sectorDetail?.soloWorkerDesc || '1 Dedicated Shramik'}
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBookingMode('CONTRACTOR_TEAM')}
                className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 cursor-pointer ${
                  bookingMode === 'CONTRACTOR_TEAM'
                    ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  bookingMode === 'CONTRACTOR_TEAM' ? 'bg-blue-800 text-blue-300' : 'bg-white text-blue-700'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-black text-xs block">{t.sectorDetail?.contractorTeam || 'Contractor Team'}</span>
                  <span className={`text-[10px] ${bookingMode === 'CONTRACTOR_TEAM' ? 'text-blue-200' : 'text-slate-500'}`}>
                    {t.sectorDetail?.contractorTeamDesc || 'Community gang of workers'}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Contractor Team Specific Config (Outcome & Property Based - No Worker Guessing) */}
          {bookingMode === 'CONTRACTOR_TEAM' && (
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-blue-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t.modals?.booking?.siteScopeHeading || 'Site Scope & Property Details'}</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  {t.modals?.booking?.contractorWorkforceSizing || 'Contractor Workforce Sizing'}
                </span>
              </div>

              {/* Property / Site Type */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.modals?.booking?.propertySiteType || 'Property / Site Type'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['1 BHK', '2 BHK', '3 BHK', '4+ BHK / Villa', 'Office', 'Housing Society'].map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setPropertyType(pt)}
                      className={`py-1.5 px-2 rounded-xl text-[10px] font-black transition text-center border cursor-pointer ${
                        propertyType === pt
                          ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.modals?.booking?.workScope || 'Work Scope'}
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Interior', 'Exterior', 'Both'] as const).map((sc) => (
                      <button
                        key={sc}
                        type="button"
                        onClick={() => setScopeType(sc)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold transition text-center border cursor-pointer ${
                          scopeType === sc
                            ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {sc}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.modals?.booking?.approxAreaRooms || 'Approx Area / Rooms'}
                  </label>
                  <input
                    type="text"
                    value={approxArea}
                    onChange={(e) => setApproxArea(e.target.value)}
                    placeholder={t.modals?.booking?.approxAreaPlaceholder || 'e.g. 1,200 sq.ft or 3 rooms'}
                    className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-bold text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Special Instructions & Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t.modals?.booking?.specificInstructions || 'Specific Work Instructions (Optional)'}
                </label>
                <input
                  type="text"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder={t.modals?.booking?.instructionsPlaceholder || 'e.g. Waterproofing on ceiling, pastel colors, scaffolding needed...'}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl bg-white font-medium text-xs focus:outline-none"
                />
              </div>

              {/* Explanation Banner */}
              <div className="p-2.5 bg-blue-100/70 rounded-xl border border-blue-200/80 text-[11px] text-blue-950 space-y-1">
                <div className="flex items-center gap-1.5 font-black text-blue-900">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700 flex-shrink-0" />
                  <span>{t.modals?.booking?.noEstimateNeededTitle || 'Customer Does Not Need to Estimate Workers'}</span>
                </div>
                <p className="text-[10px] text-blue-800 leading-snug">
                  {t.modals?.booking?.noEstimateNeededDesc || "You don't need to guess how many painters or labourers are required. A licensed Mukaddam evaluates your site details, determines the exact crew (skilled craftsmen + helpers) and days, and provides an itemized proposal with transparent statutory rates."}
                </p>
              </div>
            </div>
          )}


          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">{t.modals?.booking?.customerName || 'Customer Name'}</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">{t.modals?.booking?.customerPhone || 'Phone Number'}</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Service Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">{t.modals?.booking?.address || 'Service Address'}</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Customer Service Protection & Pricing Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {t.modals?.booking?.servicePricingInclusions || 'Service Pricing & Inclusions'}
              </span>
              <span className="text-base font-black text-slate-900">
                ₹{estimatedAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>{t.modals?.booking?.doorstepOtpVerification || 'Doorstep OTP Verification'}</span>
                </span>
                <span className="font-bold text-emerald-700">{t.modals?.booking?.included || 'Included'}</span>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  <span>{t.modals?.booking?.govtAccreditedShramik || 'Government-Accredited Shramik'}</span>
                </span>
                <span className="font-bold text-blue-700">{t.modals?.booking?.certified || 'Certified'}</span>
              </div>

              <div className="flex items-center justify-between px-1">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>{t.modals?.booking?.coopServiceWarranty || 'Cooperative Service Warranty'}</span>
                </span>
                <span className="font-bold text-purple-700">{t.modals?.booking?.warrantyDays || '30 Days'}</span>
              </div>
            </div>
          </div>

          {/* Allocation Details */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
            <HeartHandshake className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {bookingMode === 'CONTRACTOR_TEAM'
                ? (t.modals?.booking?.dispatchedToMukaddam || 'Dispatched to licensed Mukaddam to evaluate site scope and calculate optimal workforce.')
                : `${t.modals?.booking?.dispatchingAccredited || 'Dispatching accredited'} ${selectedWorkerType} (${selectedWorkerTier} tier) ${t.modals?.booking?.tierFromCoop || 'from nearest cooperative.'}`
              }
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition cursor-pointer flex-shrink-0"
          >
            {isSubmitting ? (
              <span>{t.modals?.booking?.submitting || 'Submitting Request...'}</span>
            ) : (
              <span>
                {bookingMode === 'CONTRACTOR_TEAM'
                  ? (t.modals?.booking?.requestContractorProposalBtn || 'Request Contractor Proposal (Mukaddam Sizing) ➔')
                  : `${t.modals?.booking?.requestWorkerBtn || 'Request'} ${selectedWorkerType} (${selectedWorkerTier}) ➔`
                }
              </span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

