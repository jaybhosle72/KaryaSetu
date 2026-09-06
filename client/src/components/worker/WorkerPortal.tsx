import React, { useState, useEffect } from 'react';
import { Worker, Booking, WelfareClaim } from '../../types';
import { WorkerNavigationModal } from './WorkerNavigationModal';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  ShieldCheck, Award, HeartHandshake, Phone, MapPin, 
  CheckCircle2, AlertTriangle, Wallet, Check, Star, 
  Navigation, Clock, ChevronRight, PlusCircle, ArrowUpRight, HardHat,
  GraduationCap, ExternalLink, Sparkles, KeyRound
} from 'lucide-react';
import { isTradeMatch, resolveCanonicalTrade, getTradeBadgeStyle } from '../../utils/tradeUtils';

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

export interface GovtSkillCourse {
  id: string;
  name: string;
  fullTitle: string;
  shortCode: string;
  council: string;
  ministry: string;
  portalUrl: string;
  duration: string;
  stipendOrIncentive: string;
  badgeLevel: string;
  tradesCovered: string[];
  description: string;
  keyBenefits: string[];
}

export const GOVT_SKILL_COURSES: GovtSkillCourse[] = [
  {
    id: 'pmkvy',
    name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
    fullTitle: 'PMKVY – Pradhan Mantri Kaushal Vikas Yojana',
    shortCode: 'PMKVY',
    council: 'Skill India Digital / NSDC',
    ministry: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    portalUrl: 'https://www.skillindiadigital.gov.in/',
    duration: '1 - 3 Months (Full / Part Time)',
    stipendOrIncentive: '₹8,000 Direct Benefit Stipend + Official QR Kaushal Certificate',
    badgeLevel: 'NSQF Level 3-5',
    tradesCovered: ['Multi-Trade Vocational', 'Solar PV & Green Energy', 'Electronics Repair', 'RPL Certification'],
    description: 'Flagship government skill initiative providing 100% free industry training, skill assessment, and direct monetary rewards to shramiks for career progression and certified wages.',
    keyBenefits: [
      'Govt. of India certified QR Kaushal badge on Sahakar Seva profile',
      'Direct monetary incentive & free accidental insurance coverage (₹2 Lakhs)',
      'Free NSQF assessment & high-priority cooperative booking allocation'
    ]
  },
  {
    id: 'csdci',
    name: 'Construction Skill Development Council of India',
    fullTitle: 'Construction Skill Development Council of India (CSDCI)',
    shortCode: 'CSDCI',
    council: 'CSDCI',
    ministry: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    portalUrl: 'https://www.csdcindia.org/',
    duration: '30 - 45 Days (Practical & Safety)',
    stipendOrIncentive: 'Government RPL Certification + Free Safety Tool Kit Support',
    badgeLevel: 'NSQF Level 3/4',
    tradesCovered: ['Masonry', 'Bar Bending', 'Plumbing', 'Shuttering Carpentry', 'Construction Painting'],
    description: 'Industry-recognized national certification for construction labours, masons, bar-benders, and painters qualifying workers for higher contractor wage slabs and supervisor roles.',
    keyBenefits: [
      'Certified Contractor Grade badge for high-value builder tenders',
      'Comprehensive on-site occupational safety & hazard mitigation training',
      'Recognition of Prior Learning (RPL) assessment for experienced shramiks'
    ]
  },
  {
    id: 'essci',
    name: 'Electronics Sector Skills Council of India',
    fullTitle: 'Electronics Sector Skills Council of India (ESSCI)',
    shortCode: 'ESSCI',
    council: 'ESSCI',
    ministry: 'Ministry of Electronics & IT / MSDE',
    portalUrl: 'https://essc-india.org/',
    duration: '45 - 60 Days (Hands-on Lab)',
    stipendOrIncentive: 'State Wireman License Assistance + Tool Kits & Apprenticeships',
    badgeLevel: 'NSQF Level 4',
    tradesCovered: ['Electrician & Domestic Wireman', 'Solar Panel Installation', 'Inverter & UPS Servicing', 'Home Appliances'],
    description: 'Specialized national electronics and electrical curriculum for technicians, solar installers, and electrical maintenance professionals with state licensing support.',
    keyBenefits: [
      'Eligibility for official state government wireman licensing',
      'High-demand green energy (Rooftop Solar) skill credentials',
      'Free hands-on lab training with modern diagnostic & safety tools'
    ]
  },
  {
    id: 'dwssc',
    name: 'Domestic Workers Sector Skill Council',
    fullTitle: 'Domestic Workers Sector Skill Council (DWSSC)',
    shortCode: 'DWSSC',
    council: 'DWSSC',
    ministry: 'Ministry of Skill Development & Entrepreneurship (MSDE)',
    portalUrl: 'https://dwsscindia.in/',
    duration: '2 - 4 Weeks (Flexible Timings)',
    stipendOrIncentive: 'Official Shramik ID Card + Guaranteed Minimum Wage Protection',
    badgeLevel: 'NSQF Level 2/3',
    tradesCovered: ['Housekeeping & Deep Cleaning', 'Commercial Facility Care', 'Cook & Kitchen Assistant', 'Elderly & Child Care'],
    description: 'Empowers domestic, hygiene, and facility service workers with professional certification, dignified employment standards, and verified safety credentials.',
    keyBenefits: [
      'Verified Trust badge ensuring safe residential and gated society access',
      'Professional hygiene, chemical handling & first-aid training',
      'Access to cooperative healthcare and welfare scheme benefits'
    ]
  },
  {
    id: 'parivahan',
    name: 'Commercial & LMV Driving Skill Certification',
    fullTitle: 'Commercial/Light Motor Vehicle Driving Skill Certification (Parivahan Sewa)',
    shortCode: 'Parivahan Sewa',
    council: 'Parivahan Sewa / ASDC',
    ministry: 'Ministry of Road Transport and Highways (MoRTH)',
    portalUrl: 'https://parivahan.gov.in/',
    duration: '3 - 4 Weeks (Accredited Driving Centers)',
    stipendOrIncentive: 'Commercial Driver Badge Endorsement + Fleet Job Linkage',
    badgeLevel: 'MoRTH Certified',
    tradesCovered: ['Commercial Light Motor Vehicle (LMV)', 'EV Logistics Driving', 'Defensive Driving', 'Route & GPS Navigation'],
    description: 'Authorized MoRTH and ASDC driver training program offering certified commercial driving endorsements, defensive driving, and transport fleet linkages.',
    keyBenefits: [
      'Official Commercial Transport Badge endorsement on Sarathi portal',
      'Fuel efficiency, defensive driving & emergency accident protocol training',
      'Direct linkage to cooperative transport and logistics job dispatch'
    ]
  }
];

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
  const { language, t, getSectorTitle, getServiceName } = useLanguage();
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
  const [acceptedJobIds, setAcceptedJobIds] = useState<string[]>([]);

  // Check all bookings assigned to this worker
  const myBookings = bookings.filter(b => b.assignedWorkerId === currentWorker?._id);
  const completedJobs = myBookings.filter(b => b.status === 'COMPLETED');

  // Strict trade matching: electrical requests go strictly to electricians, plumbing to plumbers
  const isJobMatchingWorkerTrade = (b: Booking, worker: Worker | undefined): boolean => {
    if (!worker) return false;
    return isTradeMatch(worker.trade, b, worker.subTrades);
  };

  const allUnassignedJobs = bookings.filter(b => 
    b.bookingMode !== 'CONTRACTOR_TEAM' && 
    b.status === 'MATCHING' && 
    !b.assignedWorkerId
  );

  // Available jobs strictly matched to worker's certified trade
  const availableMatchingJobs = allUnassignedJobs.filter(b => isJobMatchingWorkerTrade(b, currentWorker));

  const activeAssignedJob = myBookings.find(b => b.status !== 'COMPLETED') || null;
  const activeJob = activeAssignedJob || (availableMatchingJobs.length > 0 ? availableMatchingJobs[0] : null);

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

  // Govt Skill India Courses state
  const [selectedGovtCourseId, setSelectedGovtCourseId] = useState<string>('pmkvy');
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`karyasetu_courses_${currentWorker?._id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isApplyingCourse, setIsApplyingCourse] = useState(false);
  const [courseSuccessMsg, setCourseSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorker?._id) {
      try {
        const saved = localStorage.getItem(`karyasetu_courses_${currentWorker._id}`);
        if (saved) {
          setEnrolledCourseIds(JSON.parse(saved));
        } else {
          setEnrolledCourseIds([]);
        }
      } catch {
        setEnrolledCourseIds([]);
      }
    }
  }, [currentWorker?._id]);

  const selectedCourse = GOVT_SKILL_COURSES.find(c => c.id === selectedGovtCourseId) || GOVT_SKILL_COURSES[0];

  const handleApplyGovtCourse = async (course: GovtSkillCourse) => {
    if (!currentWorker || isApplyingCourse) return;
    setIsApplyingCourse(true);
    try {
      const updated = Array.from(new Set([...enrolledCourseIds, course.id]));
      setEnrolledCourseIds(updated);
      localStorage.setItem(`karyasetu_courses_${currentWorker._id}`, JSON.stringify(updated));

      const skillName = `${course.shortCode} Certified`;
      if (onAddSkill) {
        await onAddSkill(currentWorker._id, skillName);
      } else {
        if (!currentWorker.verifiedSkills) currentWorker.verifiedSkills = [];
        const existing = currentWorker.verifiedSkills.some(s => s.name.toLowerCase() === skillName.toLowerCase());
        if (!existing) {
          currentWorker.verifiedSkills.push({
            name: skillName,
            issuer: course.council,
            verifiedDate: new Date().toISOString().split('T')[0]
          });
        }
      }
      setCourseSuccessMsg(`Application active for ${course.shortCode}! Verified badge added to your profile.`);
      setTimeout(() => setCourseSuccessMsg(null), 6000);
    } catch (err: any) {
      console.error(err);
      setCourseSuccessMsg(`Application recorded for ${course.shortCode}.`);
      setTimeout(() => setCourseSuccessMsg(null), 6000);
    } finally {
      setIsApplyingCourse(false);
    }
  };

  if (!currentWorker) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <HardHat className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">{t.worker.noWorkerFound}</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            {t.worker.registerPrompt}
          </p>
        </div>
      </div>
    );
  }

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
            Trade: <strong className="text-slate-800">{getServiceName(currentWorker.trade)}</strong> • Member of <strong className="text-slate-800">{currentWorker.cooperativeName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Worker Switcher if multiple workers */}
          {workers.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase hidden sm:inline">{t.worker.switchWorker}</span>
              <select
                value={currentWorker._id}
                onChange={(e) => onSelectWorker(e.target.value)}
                className="text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {workers.map(w => {
                  const hasJob = bookings.some(b => b.assignedWorkerId === w._id && b.status !== 'COMPLETED');
                  return (
                    <option key={w._id} value={w._id}>
                      {hasJob ? '🟢 ' : ''}{w.name} ({getServiceName(w.trade)}){hasJob ? ' • [ACTIVE JOB]' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

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
            <span>{isAvailable ? t.worker.statusOnline : t.worker.statusOffline}</span>
          </button>
        </div>
      </div>

      {/* Real Available Job Requests in Worker's Certified Trade Pool */}
      {availableMatchingJobs.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-wider text-emerald-900">
                Incoming Real Job Dispatches For {currentWorker?.trade || 'Certified'} Specialist ({availableMatchingJobs.length})
              </h2>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Certified {currentWorker?.trade || 'Specialist'} Queue Only</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMatchingJobs.map(job => {
              const jobTrade = job.trade || resolveCanonicalTrade(job);
              const badgeStyle = getTradeBadgeStyle(jobTrade);
              return (
                <div 
                  key={job._id}
                  className="p-5 rounded-3xl bg-white border-2 border-emerald-500 shadow-md flex flex-col justify-between gap-4 transition hover:shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                          ⚡ {t.portal?.instant || 'Immediate'} Dispatch
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
                          {jobTrade}
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-700">
                        ₹{Math.round(job.totalAmount * 0.8)} <span className="text-[10px] text-slate-500 font-normal">({t.worker.directEscrowRate})</span>
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900">
                        {getSectorTitle(job.serviceCategory, job.serviceCategory)} • {getServiceName(job.subTrade)}
                      </h4>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{job.address}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t.worker.customerLabel} <strong>{job.customerName}</strong> ({job.customerPhone})
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
                    <span>{isAcceptingJobId === job._id ? t.common.loading : `${t.worker.acceptBtn} ➔`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center space-y-1 shadow-2xs">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{currentWorker?.trade || 'Trade'} Cooperative Radar Active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Listening for live customer bookings requiring verified {currentWorker?.trade ? `${currentWorker.trade}` : 'trade'} specialists in Pune. Service requests for other trades are strictly routed to their respective certified workers.
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
                <span className="text-xs font-black text-amber-950">
                  {currentWorker.customerRating ? `${currentWorker.customerRating} ⭐` : 'New ⭐'}
                </span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Experience</span>
                <span className="text-sm font-black text-slate-900">{currentWorker.experienceYears || 0} Years</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Jobs Done</span>
                <span className="text-sm font-black text-slate-900">{currentWorker.completedJobs || completedJobs.length || 0}</span>
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
                  <span className="text-[11px] text-slate-400 italic py-1">
                    No extra skill badges added yet. Click "+ Add Skill" to record verified skills.
                  </span>
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

          {/* Govt. Skill India & Certification Courses Card (Official Govt. of India Benefits) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shadow-2xs">
                  <GraduationCap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Govt. Skill India Courses
                  </h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Free Govt. of India training & certification for labours
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3 text-amber-600" />
                100% Free
              </span>
            </div>

            {/* Drop Box (Dropdown to select course) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <label htmlFor="govt-course-select" className="cursor-pointer">
                  Select Course / Skill Council:
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  5 Popular Courses
                </span>
              </div>
              <select
                id="govt-course-select"
                value={selectedGovtCourseId}
                onChange={(e) => setSelectedGovtCourseId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all cursor-pointer shadow-2xs"
              >
                {GOVT_SKILL_COURSES.map((course) => (
                  <option key={course.id} value={course.id}>
                    [{course.shortCode}] {course.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Course Overview Card */}
            {selectedCourse && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-amber-50/40 border border-slate-200/90 space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                      {selectedCourse.badgeLevel}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {selectedCourse.duration}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 leading-snug pt-1">
                    {selectedCourse.fullTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {selectedCourse.council} • {selectedCourse.ministry}
                  </p>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedCourse.description}
                </p>

                {/* Direct Incentive / Stipend Banner */}
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center gap-2 shadow-2xs">
                  <Award className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="text-[11px] font-bold text-emerald-900 leading-tight">
                    {selectedCourse.stipendOrIncentive}
                  </span>
                </div>

                {/* Trades Covered */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 block">Skills & Trades Covered:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCourse.tradesCovered.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs"
                      >
                        • {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Key Benefits List */}
                <div className="space-y-1 pt-1.5 border-t border-slate-200/70">
                  <span className="text-[11px] font-bold text-slate-700 block">Labour Benefits & Protection:</span>
                  <ul className="space-y-1">
                    {selectedCourse.keyBenefits.map((benefit, idx) => (
                      <li key={idx} className="text-[11px] text-slate-600 flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Application Feedback Banner */}
                {courseSuccessMsg && (
                  <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{courseSuccessMsg}</span>
                  </div>
                )}

                {/* Action Buttons: Apply for Course & Visit Official Portal */}
                <div className="pt-2 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isApplyingCourse}
                      onClick={() => handleApplyGovtCourse(selectedCourse)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
                        enrolledCourseIds.includes(selectedCourse.id)
                          ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                          : 'bg-amber-600 hover:bg-amber-700 text-white active:scale-95'
                      }`}
                    >
                      {enrolledCourseIds.includes(selectedCourse.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>✓ Application Active</span>
                        </>
                      ) : (
                        <>
                          <Award className="w-3.5 h-3.5" />
                          <span>{isApplyingCourse ? 'Registering...' : 'Apply for Course ➔'}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={selectedCourse.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 font-bold text-xs text-slate-800 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer hover:text-amber-700"
                    >
                      <span>Visit Portal</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    </a>
                  </div>

                  {enrolledCourseIds.includes(selectedCourse.id) && (
                    <div className="p-2 rounded-xl bg-slate-100/90 border border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                      <span>Registration ID:</span>
                      <span className="font-mono font-bold text-slate-900">
                        KS-GOV-2026-{selectedCourse.shortCode.replace(/\s+/g, '')}-{currentWorker._id?.slice(-4) || '8841'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
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
                  ₹{(currentWorker.welfareDetails?.welfareContributionBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Monthly Earnings & Jobs completed summary */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-slate-900 text-white rounded-2xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Earnings</span>
                <span className="text-lg font-black text-emerald-400">
                  ₹{(currentWorker.totalEarnings || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Jobs Completed</span>
                <span className="text-lg font-black text-slate-900">
                  {currentWorker.completedJobs || completedJobs.length || 0}
                </span>
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
                <h3 className="text-lg font-black text-slate-900">{t.worker.activeJobTitle}</h3>
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
                        {t.worker.incomingAlert}
                      </span>
                      <p className="text-xs font-bold text-white">
                        {t.worker.customerLabel} <strong>{activeJob.customerName}</strong> ({getSectorTitle(activeJob.serviceCategory, activeJob.serviceCategory)})
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isAcceptingJobId === activeJob._id}
                      onClick={async () => {
                        setIsAcceptingJobId(activeJob._id);
                        try {
                          if (onAcceptJob) {
                            await onAcceptJob(activeJob._id, currentWorker._id);
                          }
                          setAcceptedJobIds(prev => [...prev, activeJob._id]);
                        } catch (err: any) {
                          setAcceptedJobIds(prev => [...prev, activeJob._id]);
                        } finally {
                          setIsAcceptingJobId(null);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 shadow-2xs whitespace-nowrap cursor-pointer ${
                        acceptedJobIds.includes(activeJob._id)
                          ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                          : 'bg-white text-emerald-950 hover:bg-emerald-50'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{acceptedJobIds.includes(activeJob._id) ? `✓ ${t.common.confirm}` : `✓ ${t.worker.acceptBtn}`}</span>
                    </button>
                    <a
                      href={`tel:${activeJob.customerPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-white text-emerald-950 hover:bg-emerald-50 text-xs font-black transition flex items-center gap-1 shadow-2xs whitespace-nowrap cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Call Customer</span>
                    </a>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Exact Service Booked</span>
                    <h4 className="text-base font-black text-slate-900 mt-0.5">
                      {getSectorTitle(activeJob.serviceCategory, activeJob.serviceCategory)} • {getServiceName(activeJob.subTrade)}
                    </h4>
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{activeJob.address}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.worker.customerLabel} <strong>{activeJob.customerName}</strong> ({activeJob.customerPhone})
                    </p>
                    {activeJob.notes && (
                      <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <strong className="text-slate-900">Job Scope / Instructions:</strong> {activeJob.notes}
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.worker.estPayoutLabel}</span>
                    <span className="text-2xl font-black text-emerald-700">
                      ₹{Math.round(activeJob.totalAmount * 0.8)}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-bold block">{t.worker.directEscrowRate}</span>
                  </div>
                </div>

                {/* Milestone Progression Buttons & Doorstep OTP Verification */}
                <div className="pt-3 border-t border-slate-200 space-y-3">
                  
                  {/* Status: MATCHING (Incoming Broadcast Dispatch) */}
                  {activeJob.status === 'MATCHING' && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isAcceptingJobId === activeJob._id}
                        onClick={async () => {
                          setIsAcceptingJobId(activeJob._id);
                          try {
                            if (onAcceptJob) {
                              await onAcceptJob(activeJob._id, currentWorker._id);
                            }
                            setAcceptedJobIds(prev => [...prev, activeJob._id]);
                          } catch (err: any) {
                            console.error(err);
                          } finally {
                            setIsAcceptingJobId(null);
                          }
                        }}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer animate-pulse"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAcceptingJobId === activeJob._id ? t.common.loading : `✓ ${t.worker.acceptBtn} ➔`}</span>
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

                  {/* Status: ALLOCATED */}
                  {activeJob.status === 'ALLOCATED' && (
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        disabled={isAcceptingJobId === activeJob._id}
                        onClick={async () => {
                          setIsAcceptingJobId(activeJob._id);
                          try {
                            if (onAcceptJob) {
                              await onAcceptJob(activeJob._id, currentWorker._id);
                            }
                            setAcceptedJobIds(prev => [...prev, activeJob._id]);
                          } catch (err: any) {
                            setAcceptedJobIds(prev => [...prev, activeJob._id]);
                          } finally {
                            setIsAcceptingJobId(null);
                          }
                        }}
                        className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md transition cursor-pointer ${
                          acceptedJobIds.includes(activeJob._id)
                            ? 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {acceptedJobIds.includes(activeJob._id)
                            ? `✓ ${t.common.confirm}`
                            : (isAcceptingJobId === activeJob._id ? t.common.loading : `✓ ${t.worker.acceptBtn}`)}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onUpdateBookingStatus(activeJob._id, 'EN_ROUTE');
                          setShowNavigationModal(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                      >
                        <Navigation className="w-4 h-4 text-emerald-400" />
                        <span>1. {t.worker.tripStartBtn} ➔</span>
                      </button>
                      <button
                        onClick={() => {
                          onUpdateBookingStatus(activeJob._id, 'EN_ROUTE');
                          setIsArrivedAtDoorstep(true);
                        }}
                        className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-white" />
                        <span>2. {t.worker.arrivedBtn} ➔</span>
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
                          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition cursor-pointer ${
                            isArrivedAtDoorstep 
                              ? 'bg-emerald-700 text-white border border-emerald-500' 
                              : 'bg-amber-600 hover:bg-amber-700 text-white'
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-white" />
                          <span>{isArrivedAtDoorstep ? (language === 'mr' ? '✓ ग्राहकाच्या दारात पोहोचलो' : language === 'hi' ? '✓ ग्राहक के दरवाजे पर पहुंचे' : '✓ At Customer Doorstep') : `2. ${t.worker.arrivedBtn} ➔`}</span>
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
                      <div className={`p-4 rounded-2xl border-2 space-y-3 transition-all ${
                        isArrivedAtDoorstep 
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300/60 shadow-md' 
                          : 'bg-amber-50/70 border-amber-300'
                      }`}>
                        <div>
                          <strong className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <KeyRound className="w-4 h-4 text-amber-600" />
                            <span>🔐 {t.worker.verifyOtpTitle}</span>
                          </strong>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {t.worker.otpPrompt}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <input
                            type="text"
                            maxLength={4}
                            value={workerOtpInput}
                            onChange={(e) => {
                              setWorkerOtpInput(e.target.value.replace(/[^0-9]/g, ''));
                              setWorkerOtpError('');
                            }}
                            placeholder="4-digit OTP"
                            className="px-3.5 py-2.5 rounded-xl bg-white border-2 border-amber-400 text-slate-900 font-mono font-black text-center tracking-widest text-lg w-36 shadow-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={isVerifyingOtp}
                            onClick={async () => {
                              const code = workerOtpInput.trim();
                              if (!code || code.length < 4) {
                                setWorkerOtpError(
                                  language === 'mr'
                                    ? 'कृपया ग्राहकाने दिलेला ४-अंकी ओटीपी प्रविष्ट करा.'
                                    : language === 'hi'
                                    ? 'कृपया ग्राहक द्वारा प्रदान किया गया 4-अंकों का ओटीपी दर्ज करें।'
                                    : 'Please enter the 4-digit OTP provided by the customer.'
                                );
                                return;
                              }
                              setIsVerifyingOtp(true);
                              setWorkerOtpError('');
                              try {
                                if (onVerifyOtp) {
                                  await onVerifyOtp(activeJob._id, code);
                                } else {
                                  const expected = activeJob.otp;
                                  if (expected && code !== expected) {
                                    throw new Error(
                                      language === 'mr'
                                        ? 'अवैध ओटीपी. कृपया ग्राहकाकडून अचूक ४-अंकी कोड तपासा.'
                                        : language === 'hi'
                                        ? 'अमान्य ओटीपी। कृपया ग्राहक से सही 4-अंकों का कोड पूछें।'
                                        : 'Invalid OTP. Please ask customer for the correct 4-digit code.'
                                    );
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
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{isVerifyingOtp ? t.common.loading : `${t.worker.verifyAndReleaseBtn} ➔`}</span>
                          </button>
                        </div>

                        {workerOtpError && (
                          <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{workerOtpError}</span>
                          </p>
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
                <p className="font-bold text-slate-700 text-sm">{t.worker.noCompletedJobs}</p>
              </div>
            )}
          </div>

          {/* Worker Earnings & Payment History */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{t.worker.completedLedgerTitle}</h3>
                <p className="text-xs text-slate-500">Verified direct bank deposits and OTP-settled service compensations</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.worker.earningsCard}</span>
                <span className="text-xl font-black text-emerald-700">
                  ₹{(currentWorker.totalEarnings || 0).toLocaleString('en-IN')}
                </span>
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
                  <span className="text-sm font-black text-blue-950">{completedJobs.length} Jobs</span>
                  <span className="text-[10px] text-blue-700 block mt-0.5">100% verified payout</span>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-purple-800 font-bold uppercase block">Cooperative Standing</span>
                  <span className="text-sm font-black text-purple-950">A-Grade Verified</span>
                  <span className="text-[10px] text-purple-700 block mt-0.5">Active Pune Ward</span>
                </div>
              </div>
            </div>

            {/* Recent Completed Jobs Table */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Recent Completed Jobs & Settlements:
              </h4>
              {completedJobs.length > 0 ? (
                <div className="divide-y divide-slate-100 text-xs">
                  {completedJobs.slice(0, 5).map((job) => (
                    <div key={job._id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{getSectorTitle(job.serviceCategory, job.serviceCategory)} - {getServiceName(job.subTrade)}</p>
                        <p className="text-slate-400 text-[11px]">{job.address} • {t.worker.customerLabel} {job.customerName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-emerald-700">+₹{Math.round(job.totalAmount * 0.8)}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block">PAID VIA UPI ✓</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 italic bg-slate-50/50 rounded-xl p-3 border border-dashed border-slate-200 text-center">
                  {t.worker.noCompletedJobs}
                </p>
              )}
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
