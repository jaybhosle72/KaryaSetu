import React, { useState, useEffect } from 'react';
import { Worker, Booking, WelfareClaim } from '../../types';
import { WorkerNavigationModal } from './WorkerNavigationModal';
import { 
  ShieldCheck, Award, HeartHandshake, Phone, MapPin, 
  CheckCircle2, AlertTriangle, Wallet, Check, Star, 
  Navigation, Clock, ChevronRight, PlusCircle, ArrowUpRight
} from 'lucide-react';

interface WorkerPortalProps {
  workers: Worker[];
  selectedWorkerId: string;
  onSelectWorker: (id: string) => void;
  bookings: Booking[];
  welfareRecords: WelfareClaim[];
  onUpdateWorkerStatus: (id: string, status: string, isEmergencyDuty?: boolean) => Promise<void>;
  onUpdateBookingStatus: (id: string, status: string) => Promise<void>;
  onVerifyOtp?: (id: string, otp: string) => Promise<any>;
  onAddSkill?: (workerId: string, skillName: string) => Promise<void>;
  onAcceptJob?: (bookingId: string, workerId: string) => Promise<any>;
  currentUser?: any;
}

export const WorkerPortal: React.FC<WorkerPortalProps> = ({
  workers,
  selectedWorkerId,
  onSelectWorker,
  bookings,
  welfareRecords,
  onUpdateWorkerStatus,
  onUpdateBookingStatus,
  onVerifyOtp,
  onAddSkill,
  onAcceptJob,
  currentUser
}) => {
  const currentWorker = workers.find(w => 
    (currentUser?.extraMeta?.workerId && w._id === currentUser.extraMeta.workerId) ||
    (currentUser?.phone && w.phone === currentUser.phone) ||
    w._id === selectedWorkerId
  ) || workers[0];
  const [activeTab, setActiveTab] = useState<'JOBS' | 'EARNINGS' | 'WELFARE'>('JOBS');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);
  const [showNavigationModal, setShowNavigationModal] = useState(false);
  const [workerOtpInput, setWorkerOtpInput] = useState('');
  const [workerOtpError, setWorkerOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isArrivedAtDoorstep, setIsArrivedAtDoorstep] = useState(false);
  const [isAcceptingJobId, setIsAcceptingJobId] = useState<string | null>(null);

  // Check all bookings assigned to this worker
  const myBookings = bookings.filter(b => b.assignedWorkerId === currentWorker?._id);
  const activeJob = myBookings.find(b => b.status !== 'COMPLETED') || null;
  const completedJobs = myBookings.filter(b => b.status === 'COMPLETED');

  // Available matching jobs in worker's trade awaiting acceptance
  const [filterTradeMode, setFilterTradeMode] = useState<'MATCHING' | 'ALL'>('MATCHING');

  const isJobMatchingWorkerTrade = (b: Booking, worker: Worker | undefined): boolean => {
    if (!worker) return true;
    const wTrade = (worker.trade || '').toLowerCase();
    const cat = (b.serviceCategory || '').toLowerCase();
    const sub = (b.subTrade || '').toLowerCase();
    const notes = (b.notes || '').toLowerCase();
    const combined = `${cat} ${sub} ${notes}`;

    // Direct substring matches
    if (combined.includes(wTrade) || wTrade.includes(cat) || wTrade.includes(sub)) {
      return true;
    }

    // Worker subtrades match
    if (worker.subTrades && Array.isArray(worker.subTrades)) {
      if (worker.subTrades.some(st => combined.includes(st.toLowerCase()) || st.toLowerCase().includes(sub))) {
        return true;
      }
    }

    // Trade Synonyms / Keywords dictionary
    const tradeSynonyms: Record<string, string[]> = {
      'electrical': ['elec', 'wire', 'wiring', 'switch', 'socket', 'mcb', 'light', 'fan', 'ac', 'appliance', 'circuit', 'inverter', 'motor', 'installation', 'geyser', 'repair'],
      'plumbing': ['plumb', 'pipe', 'leak', 'drain', 'tap', 'faucet', 'sanitary', 'water', 'sewage', 'tank', 'flush', 'basin', 'motor', 'pump'],
      'carpentry': ['carp', 'wood', 'furniture', 'door', 'lock', 'latch', 'hinge', 'cabinet', 'cupboard', 'table', 'chair', 'drill', 'shelf'],
      'deep cleaning': ['clean', 'sanitiz', 'sweep', 'mop', 'wash', 'pest', 'disinfect', 'housekeeping', 'dust', 'maid'],
      'appliance repair': ['appliance', 'ac', 'refrigerat', 'fridge', 'washing', 'microwave', 'oven', 'geyser', 'chimney', 'heater', 'cooler', 'electrical', 'repair'],
      'painting': ['paint', 'color', 'whitewash', 'distemper', 'waterproof', 'wall', 'primer', 'polish'],
      'maid': ['maid', 'cook', 'clean', 'domestic', 'household', 'shramik', 'helper'],
      'driver': ['driver', 'driving', 'car', 'vehicle', 'chauffeur'],
      'gardening': ['garden', 'lawn', 'plant', 'grass', 'tree', 'landscape'],
      'caregiver': ['care', 'nurse', 'elderly', 'patient', 'baby', 'attendant']
    };

    for (const [key, keywords] of Object.entries(tradeSynonyms)) {
      if (wTrade.includes(key) || key.includes(wTrade)) {
        if (keywords.some(kw => combined.includes(kw))) {
          return true;
        }
      }
    }

    // Broad household sector match
    if (cat.includes('home maintenance') || cat.includes('household') || cat.includes('general')) {
      return true;
    }

    return false;
  };

  const allUnassignedJobs = bookings.filter(b => 
    b.bookingMode !== 'CONTRACTOR_TEAM' && 
    b.status === 'MATCHING' && 
    !b.assignedWorkerId
  );

  const tradeMatchingJobs = allUnassignedJobs.filter(b => isJobMatchingWorkerTrade(b, currentWorker));
  const availableMatchingJobs = filterTradeMode === 'ALL'
    ? allUnassignedJobs
    : (tradeMatchingJobs.length > 0 ? tradeMatchingJobs : allUnassignedJobs);

  const isAvailable = currentWorker?.status !== 'OFF_DUTY';

  const handleToggleAvailability = () => {
    const nextStatus = isAvailable ? 'OFF_DUTY' : 'AVAILABLE';
    onUpdateWorkerStatus(currentWorker._id, nextStatus, currentWorker.isEmergencyDuty);
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim() || isSubmittingSkill) return;
    try {
      setIsSubmittingSkill(true);
      if (onAddSkill) {
        await onAddSkill(currentWorker._id, newSkillInput.trim());
      } else {
        currentWorker.verifiedSkills.push({
          name: newSkillInput.trim(),
          issuer: currentWorker.cooperativeName,
          verifiedDate: new Date().toISOString().split('T')[0]
        });
      }
      setNewSkillInput('');
      setIsAddingSkill(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingSkill(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 font-sans max-w-[1280px] mx-auto">
      
      {/* 1. Sleek Top Bar with Worker Switcher & Availability Toggle */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Cooperative Member Professional
            </span>
            <span className="text-xs text-slate-400 font-mono">ID: {currentWorker._id}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {currentWorker.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trade: <strong className="text-slate-800">{currentWorker.trade}</strong> • Member of <strong className="text-slate-800">{currentWorker.cooperativeName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Worker Switcher for demo */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase hidden sm:inline">Switch Worker:</span>
            <select
              value={currentWorker._id}
              onChange={(e) => onSelectWorker(e.target.value)}
              className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {workers.map(w => {
                const hasJob = bookings.some(b => b.assignedWorkerId === w._id && b.status !== 'COMPLETED');
                return (
                  <option key={w._id} value={w._id}>
                    {hasJob ? '🟢 ' : ''}{w.name} ({w.trade}){hasJob ? ' • [ACTIVE JOB]' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Minimal Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm ${
              isAvailable 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-200 animate-pulse' : 'bg-slate-400'}`} />
            <span>{isAvailable ? 'Available for Jobs' : 'Offline / On Break'}</span>
          </button>
        </div>
      </div>

      {/* Real Available Job Requests in Worker's Trade / Cooperative Pool */}
      {availableMatchingJobs.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-900">
                {tradeMatchingJobs.length > 0 && filterTradeMode !== 'ALL'
                  ? `Incoming Real Job Dispatches In Your Trade (${tradeMatchingJobs.length})`
                  : `Incoming Real Job Dispatches Across Pune (${availableMatchingJobs.length})`}
              </h2>
            </div>

            {/* Filter Toggle Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setFilterTradeMode('MATCHING')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterTradeMode === 'MATCHING'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Your Trade ({tradeMatchingJobs.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterTradeMode('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  filterTradeMode === 'ALL'
                    ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Open ({allUnassignedJobs.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMatchingJobs.map(job => (
              <div 
                key={job._id}
                className="p-5 rounded-3xl bg-white border-2 border-emerald-500 shadow-md flex flex-col justify-between gap-4 transition hover:shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                      ⚡ Immediate Dispatch Ready
                    </span>
                    <span className="text-sm font-black text-emerald-700">
                      ₹{Math.round(job.totalAmount * 0.8)} <span className="text-[10px] text-slate-500 font-normal">(80% Escrow)</span>
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-black text-slate-900">
                      {job.serviceCategory} • {job.subTrade}
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{job.address}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong>{job.customerName}</strong> ({job.customerPhone})
                    </p>
                    {job.notes && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2 rounded-xl mt-1.5 border border-slate-100 italic">
                        "{job.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isAcceptingJobId === job._id}
                  onClick={async () => {
                    if (onAcceptJob) {
                      setIsAcceptingJobId(job._id);
                      try {
                        await onAcceptJob(job._id, currentWorker._id);
                      } catch (err: any) {
                        alert(err.message || 'Failed to accept job');
                      } finally {
                        setIsAcceptingJobId(null);
                      }
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAcceptingJobId === job._id ? 'Accepting & Assigning...' : 'Accept Job & Start Navigation ➔'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cooperative Dispatch Radar Active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Listening for live customer bookings in Pune. When a customer books, the job dispatch will appear here immediately.
          </p>
        </div>
      )}

      {/* 2. Grid Layout: Left Column (Profile & Welfare) | Right Column (Jobs & Earnings) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (5 Cols): Worker Profile Card & Worker Welfare Card */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Worker Profile Card (As Specified in Prompt) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-sm">
                  {currentWorker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">{currentWorker.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{currentWorker.trade}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Location: Pune, Maharashtra</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black text-amber-950">{currentWorker.customerRating || 4.8} ⭐</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Experience</span>
                <span className="text-sm font-black text-slate-900">{currentWorker.experienceYears} Years</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Jobs Done</span>
                <span className="text-sm font-black text-slate-900">{currentWorker.completedJobs || 62}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Certification</span>
                <span className="text-xs font-black text-emerald-700 block mt-0.5">Verified ✓</span>
              </div>
            </div>

            {/* Verified Skills Section */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Verified Skills & Badges
                </span>
                <button
                  onClick={() => setIsAddingSkill(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentWorker.verifiedSkills && currentWorker.verifiedSkills.length > 0 ? (
                  currentWorker.verifiedSkills.map((s, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{s.name}</span>
                    </span>
                  ))
                ) : (
                  <>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Wiring
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Fan installation
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Switch repair
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> AC connection
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Add Skill Modal/Inline Form */}
            {isAddingSkill && (
              <form onSubmit={handleAddSkill} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <input
                  type="text"
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  placeholder="e.g. Solar Inverter Setup or Motor Rewinding"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none"
                  required
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAddingSkill(false)}
                    className="px-3 py-1 text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                  >
                    Save Skill
                  </button>
                </div>
              </form>
            )}

          </div>

          {/* Worker Welfare Card (Exact format from prompt) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900 uppercase tracking-wide">
                  Worker Welfare
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                100% Protected
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Insurance</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active (₹5L Cover)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Health Scheme</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active (PM-JAY)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="font-semibold text-slate-700">Accident Cover</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <div>
                  <span className="font-bold text-amber-950 block">Cooperative Welfare Balance</span>
                  <span className="text-[10px] text-amber-800">Auto-funded by 6% client split</span>
                </div>
                <span className="text-sm font-black text-amber-900">
                  ₹{currentWorker.welfareDetails?.welfareContributionBalance?.toLocaleString('en-IN') || '24,650'}
                </span>
              </div>
            </div>

            {/* Monthly Earnings & Jobs completed summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-900 text-white rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly Earnings</span>
                <span className="text-lg font-black text-emerald-400">₹24,500</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Jobs Completed</span>
                <span className="text-lg font-black text-slate-900">{currentWorker.completedJobs || 62}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (7 Cols): Today's Jobs, Navigation, Transparent Earnings */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active / Assigned Job Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Assigned Jobs & Workflow</h3>
                <p className="text-xs text-slate-500">Live booking dispatch, customer navigation, and status milestones</p>
              </div>
              {activeJob && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-800 animate-pulse">
                  {activeJob.status}
                </span>
              )}
            </div>

            {activeJob ? (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                {/* 1. High-Visibility Dispatch Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">⚡</span>
                    <div>
                      <span className="text-[10px] uppercase font-black tracking-wider text-emerald-200 block">
                        Incoming Customer Job Dispatched to You
                      </span>
                      <p className="text-xs font-bold text-white">
                        Customer <strong>{activeJob.customerName}</strong> booked <strong>{activeJob.serviceCategory}</strong>
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${activeJob.customerPhone}`}
                    className="px-3 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-black transition flex items-center gap-1 shadow-2xs whitespace-nowrap cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Call Customer</span>
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exact Service Booked</span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      {activeJob.serviceCategory} • {activeJob.subTrade}
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{activeJob.address}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong>{activeJob.customerName}</strong> ({activeJob.customerPhone})
                    </p>
                    {activeJob.notes && (
                      <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <strong className="text-slate-900">Job Scope / Instructions:</strong> {activeJob.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Earning</span>
                    <span className="text-2xl font-black text-emerald-700">
                      ₹{Math.round(activeJob.totalAmount * 0.8)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">Direct Escrow Payout</span>
                  </div>
                </div>

                {/* Milestone Progression Buttons & Doorstep OTP Verification */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  
                  {/* Status: ALLOCATED */}
                  {activeJob.status === 'ALLOCATED' && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        onClick={() => {
                          onUpdateBookingStatus(activeJob._id, 'EN_ROUTE');
                          setShowNavigationModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 text-emerald-400 animate-pulse" />
                        <span>1. Start Navigation (En Route) ➔</span>
                      </button>
                      <a
                        href={`tel:${activeJob.customerPhone}`}
                        className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        <span>Call Customer</span>
                      </a>
                    </div>
                  )}

                  {/* Status: EN_ROUTE or Arrived at Doorstep */}
                  {activeJob.status === 'EN_ROUTE' && (
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => setShowNavigationModal(true)}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer animate-pulse"
                          title="View live GPS route and turn-by-turn directions"
                        >
                          <Navigation className="w-4 h-4 text-white" />
                          <span>🛰️ Live Navigation Active (ETA: ~12m)</span>
                        </button>

                        <button
                          onClick={() => setIsArrivedAtDoorstep(true)}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                        >
                          <MapPin className="w-4 h-4 text-white" />
                          <span>2. Arrived at Customer Doorstep ➔</span>
                        </button>

                        <a
                          href={`tel:${activeJob.customerPhone}`}
                          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>Call Customer</span>
                        </a>
                      </div>

                      {/* Doorstep OTP Verification Form */}
                      <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-300 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <strong className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                              <span>🔐 Customer Doorstep OTP Required to Start Work</span>
                            </strong>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              Ask customer <strong>{activeJob.customerName}</strong> for the 4-digit code displayed on their screen.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setWorkerOtpInput(activeJob.otp || '4821');
                              setWorkerOtpError('');
                            }}
                            className="text-[10px] font-black text-amber-900 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded-lg transition self-start sm:self-auto cursor-pointer"
                          >
                            Autofill OTP ({activeJob.otp || '4821'})
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={workerOtpInput}
                            onChange={(e) => {
                              setWorkerOtpInput(e.target.value);
                              setWorkerOtpError('');
                            }}
                            placeholder="4-digit OTP"
                            className="px-3 py-2 rounded-xl bg-white border border-amber-400 text-slate-900 font-mono font-bold text-center tracking-widest text-base w-36 shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={isVerifyingOtp}
                            onClick={async () => {
                              const code = workerOtpInput.trim();
                              if (!code) {
                                setWorkerOtpError('Please enter the 4-digit OTP provided by the customer.');
                                return;
                              }
                              setIsVerifyingOtp(true);
                              setWorkerOtpError('');
                              try {
                                if (onVerifyOtp) {
                                  await onVerifyOtp(activeJob._id, code);
                                } else {
                                  const expected = activeJob.otp || '4821';
                                  if (code !== expected) {
                                    throw new Error(`Invalid OTP. Customer's code is ${expected}`);
                                  }
                                  await onUpdateBookingStatus(activeJob._id, 'IN_PROGRESS');
                                }
                                setWorkerOtpInput('');
                              } catch (err: any) {
                                setWorkerOtpError(err.message || 'OTP verification failed');
                              } finally {
                                setIsVerifyingOtp(false);
                              }
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isVerifyingOtp ? 'Verifying...' : 'Confirm OTP & Start Work ➔'}</span>
                          </button>
                        </div>

                        {workerOtpError && (
                          <p className="text-xs text-rose-600 font-bold">{workerOtpError}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Status: IN_PROGRESS */}
                  {activeJob.status === 'IN_PROGRESS' && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                          <div>
                            <strong className="text-xs font-black text-emerald-950 block">
                              ✓ Doorstep OTP Verified — Work In-Progress
                            </strong>
                            <p className="text-[11px] text-emerald-800">
                              Service timer active. Escrow payout of ₹{Math.round(activeJob.totalAmount * 0.8)} locked for release upon completion.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onUpdateBookingStatus(activeJob._id, 'COMPLETED')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer whitespace-nowrap"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Mark Work Done & Release Payout ➔</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                <p className="font-bold text-slate-700 text-sm">No Active Booking in Progress</p>
                <p className="mt-1">You are available in the Pune ward pool. New customer bookings will alert you here.</p>
              </div>
            )}
          </div>

          {/* Worker Earnings & Payment History */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Worker Earnings & Payout Ledger</h3>
                <p className="text-xs text-slate-500">Verified direct bank deposits and OTP-settled service compensations</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Balance</span>
                <span className="text-xl font-black text-emerald-700">₹{currentWorker.totalEarnings || 24500}</span>
              </div>
            </div>

            {/* Worker Summary Cards */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Payout & Account Status:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Settlement Mode</span>
                  <span className="text-sm font-black text-emerald-950">Direct Bank / UPI</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Instant upon completion</span>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Completed Bookings</span>
                  <span className="text-sm font-black text-blue-950">{completedJobs.length || 38} Jobs</span>
                  <span className="text-[10px] text-blue-700 block mt-0.5">100% verified payout</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-purple-800 font-bold uppercase block">Cooperative Standing</span>
                  <span className="text-sm font-black text-purple-950">A-Grade Verified</span>
                  <span className="text-[10px] text-purple-700 block mt-0.5">Primary Pune Ward</span>
                </div>
              </div>
            </div>

            {/* Recent Completed Jobs Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Recent Completed Jobs & Settlements:
              </h4>
              <div className="divide-y divide-slate-100 text-xs">
                {completedJobs.slice(0, 3).map((job) => (
                  <div key={job._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{job.serviceCategory} - {job.subTrade}</p>
                      <p className="text-slate-400 text-[11px]">{job.address} • Customer: {job.customerName}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700">+₹{Math.round(job.totalAmount * 0.8)}</span>
                      <span className="text-[10px] text-emerald-600 font-bold block">PAID VIA UPI ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Live Turn-by-Turn GPS Navigation Modal */}
      {showNavigationModal && activeJob && (
        <WorkerNavigationModal
          isOpen={showNavigationModal}
          onClose={() => setShowNavigationModal(false)}
          booking={activeJob}
          worker={currentWorker}
          onMarkArrived={() => {
            onUpdateBookingStatus(activeJob._id, 'IN_PROGRESS');
            setShowNavigationModal(false);
          }}
        />
      )}

    </div>
  );
};
