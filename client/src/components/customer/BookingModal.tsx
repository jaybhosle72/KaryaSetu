import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, HeartHandshake, MapPin, Calendar, Clock, Sparkles, 
  Users, Briefcase, User, Award, CheckCircle2, ChevronDown, Wrench, 
  Zap, Hammer, Paintbrush, Tv, Heart, Car, Star, Layers
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCategory: string;
  subTrade: string;
  defaultPrice: number;
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
  }) => Promise<void>;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  serviceCategory,
  subTrade,
  defaultPrice,
  onSubmitBooking
}) => {
  const [bookingMode, setBookingMode] = useState<'SOLO_WORKER' | 'CONTRACTOR_TEAM'>('SOLO_WORKER');
  const [teamSize, setTeamSize] = useState<number>(4);
  const [projectDurationDays, setProjectDurationDays] = useState<number>(2);

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

  const [customerName, setCustomerName] = useState('Pooja Nair');
  const [customerPhone, setCustomerPhone] = useState('+91 98224 55667');
  const [address, setAddress] = useState('Flat 504, Windsor Park, Kothrud, Pune 411038');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const estimatedAmount = bookingMode === 'SOLO_WORKER'
    ? basePrice
    : Math.round(basePrice * teamSize * 0.9 * projectDurationDays);

  // Real-time 4-way split calculations
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
        subTrade,
        address,
        estimatedAmount,
        bookingMode,
        teamSize: bookingMode === 'CONTRACTOR_TEAM' ? teamSize : 1,
        projectDurationDays: bookingMode === 'CONTRACTOR_TEAM' ? projectDurationDays : 1,
        workerType: selectedWorkerType,
        workerTier: selectedWorkerTier
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-slate-950 text-white p-5 flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 block">
              Cooperative Workforce Dispatch
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
              Book {serviceCategory} ({subTrade})
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
                <span>Select Type of Worker (Trade Role)</span>
              </label>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Accredited Roster</span>
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
              Service Delivery Model
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
                  <span className="font-black text-xs block">Solo Worker</span>
                  <span className={`text-[10px] ${bookingMode === 'SOLO_WORKER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    1 Dedicated Shramik
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
                  <span className="font-black text-xs block">Contractor Team</span>
                  <span className={`text-[10px] ${bookingMode === 'CONTRACTOR_TEAM' ? 'text-blue-200' : 'text-slate-500'}`}>
                    Community gang of workers
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Contractor Team Specific Config */}
          {bookingMode === 'CONTRACTOR_TEAM' && (
            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-blue-800">
                  Worker Community Team Configuration
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Contractor Allocation Flow
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Number of Workers Required
                  </label>
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-900"
                  >
                    <option value={2}>Team of 2 Shramiks</option>
                    <option value={3}>Team of 3 Shramiks</option>
                    <option value={4}>Team of 4 Shramiks</option>
                    <option value={5}>Gang of 5 Shramiks (Recommended)</option>
                    <option value={8}>Crew of 8 Shramiks</option>
                    <option value={10}>Full Squad of 10 Shramiks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Project Duration (Days)
                  </label>
                  <select
                    value={projectDurationDays}
                    onChange={(e) => setProjectDurationDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-bold text-slate-900"
                  >
                    <option value={1}>1 Day (Express Service)</option>
                    <option value={2}>2 Days</option>
                    <option value={3}>3 Days (Standard Project)</option>
                    <option value={5}>5 Days (Multi-Room / Deep)</option>
                    <option value={7}>1 Week (Full Renovation)</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-blue-800">
                ⚡ Dispatched to <strong>Balasaheb Shinde (Accredited Mukaddam)</strong> to allocate <strong>{teamSize} certified {selectedWorkerType}s</strong> from the cooperative roster.
              </p>
            </div>
          )}

          {/* Customer info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Customer Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
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
            <label className="block text-[11px] font-bold text-slate-700 mb-1">Service Address</label>
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

          {/* Transparent 4-Way Earnings Breakdown Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Transparent Cooperative Split Preview
              </span>
              <span className="text-base font-black text-slate-900">
                ₹{estimatedAmount.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  {bookingMode === 'CONTRACTOR_TEAM' ? `Team Worker Direct Share (80%)` : 'Worker Take-Home Pay (80%)'}
                </span>
                <span className="font-black text-sm">₹{workerAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 px-2 py-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  {bookingMode === 'CONTRACTOR_TEAM' ? 'Contractor Coordination & Depot (10%)' : 'Cooperative Tool Depot (10%)'}
                </span>
                <span className="font-semibold">₹{coopAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-amber-900 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" />
                  Worker Welfare & Healthcare Fund (6%)
                </span>
                <span className="font-bold">₹{welfareAmount.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 px-2 py-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Platform Infrastructure (4%)
                </span>
                <span>₹{platformAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Allocation Details */}
          <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
            <HeartHandshake className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>
              {bookingMode === 'CONTRACTOR_TEAM'
                ? `Contractor will allocate ${teamSize} verified ${selectedWorkerType}s from community roster.`
                : `Dispatching accredited ${selectedWorkerType} (${selectedWorkerTier} tier) from nearest cooperative.`
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
              <span>Submitting Request...</span>
            ) : (
              <span>
                {bookingMode === 'CONTRACTOR_TEAM'
                  ? `Submit Team Order (${teamSize} ${selectedWorkerType}s) ➔`
                  : `Request ${selectedWorkerType} (${selectedWorkerTier}) ➔`
                }
              </span>
            )}
          </button>

        </form>
      </div>
    </div>
  );
};
