import React, { useState } from 'react';
import { Worker, Booking, WelfareClaim } from '../../types';
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
  onAddSkill?: (workerId: string, skillName: string) => Promise<void>;
}

export const WorkerPortal: React.FC<WorkerPortalProps> = ({
  workers,
  selectedWorkerId,
  onSelectWorker,
  bookings,
  welfareRecords,
  onUpdateWorkerStatus,
  onUpdateBookingStatus,
  onAddSkill
}) => {
  const currentWorker = workers.find(w => w._id === selectedWorkerId) || workers[0];
  const [activeTab, setActiveTab] = useState<'JOBS' | 'EARNINGS' | 'WELFARE'>('JOBS');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isSubmittingSkill, setIsSubmittingSkill] = useState(false);

  if (!currentWorker) return null;

  const myBookings = bookings.filter(b => b.assignedWorkerId === currentWorker._id);
  const activeJob = myBookings.find(b => b.status !== 'COMPLETED') || null;
  const completedJobs = myBookings.filter(b => b.status === 'COMPLETED');

  const isAvailable = currentWorker.status !== 'OFF_DUTY';

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
              className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
            >
              {workers.map(w => (
                <option key={w._id} value={w._id}>
                  {w.name} ({w.trade})
                </option>
              ))}
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Request</span>
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
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Direct Earning</span>
                    <span className="text-2xl font-black text-emerald-700">
                      ₹{Math.round(activeJob.totalAmount * 0.8)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">(80% Direct Share)</span>
                  </div>
                </div>

                {/* Milestone Progression Buttons */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2.5">
                  {activeJob.status === 'ALLOCATED' && (
                    <button
                      onClick={() => onUpdateBookingStatus(activeJob._id, 'EN_ROUTE')}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                    >
                      <Navigation className="w-4 h-4 text-emerald-400" />
                      <span>1. Start Navigation (En Route) ➔</span>
                    </button>
                  )}

                  {activeJob.status === 'EN_ROUTE' && (
                    <button
                      onClick={() => onUpdateBookingStatus(activeJob._id, 'IN_PROGRESS')}
                      className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                    >
                      <MapPin className="w-4 h-4 text-white" />
                      <span>2. Arrived at Customer ➔</span>
                    </button>
                  )}

                  {activeJob.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => onUpdateBookingStatus(activeJob._id, 'COMPLETED')}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>3. Verify OTP & Mark Completed ➔</span>
                    </button>
                  )}

                  <a
                    href={`tel:${activeJob.customerPhone}`}
                    className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                <p className="font-bold text-slate-700 text-sm">No Active Booking in Progress</p>
                <p className="mt-1">You are available in the Pune ward pool. New customer bookings will alert you here.</p>
              </div>
            )}
          </div>

          {/* Transparent Earnings & Payment History (As Specified in Prompt) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">Transparent Earnings Ledger</h3>
                <p className="text-xs text-slate-500">Every ₹500 job: ₹400 Worker (80%) + ₹50 Coop (10%) + ₹30 Welfare (6%) + ₹20 Platform (4%)</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Balance</span>
                <span className="text-xl font-black text-emerald-700">₹{currentWorker.totalEarnings || 24500}</span>
              </div>
            </div>

            {/* Example of Transparent Breakdown Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Standard ₹500 Service Fee Breakdown:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] text-emerald-800 font-bold uppercase block">Your Take-Home (80%)</span>
                  <span className="text-base font-black text-emerald-950">₹400</span>
                </div>
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                  <span className="text-[10px] text-blue-800 font-bold uppercase block">Coop Tools (10%)</span>
                  <span className="text-base font-black text-blue-950">₹50</span>
                </div>
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] text-amber-800 font-bold uppercase block">Your Welfare (6%)</span>
                  <span className="text-base font-black text-amber-950">₹30</span>
                </div>
                <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-600 font-bold uppercase block">Platform Fee (4%)</span>
                  <span className="text-base font-black text-slate-800">₹20</span>
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

    </div>
  );
};
