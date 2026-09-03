import React, { useState, useEffect } from 'react';
import { 
  Calendar, Briefcase, Users, HardHat, CheckCircle2, Clock, AlertCircle, 
  MapPin, Phone, ShieldCheck, Award, ArrowRight, UserPlus, 
  Check, FileText, ChevronRight, Sparkles, Building, Filter, DollarSign,
  Search, Shield, Star, X
} from 'lucide-react';
import { Booking, Worker, Contractor } from '../../types';
import { api } from '../../services/api';

interface ContractorPortalProps {
  contractorUser?: {
    name: string;
    phone: string;
    roleName: string;
    extraMeta?: any;
  };
  bookings: Booking[];
  workers: Worker[];
  onAllocateWorkers: (bookingId: string, workerIds: string[]) => Promise<void>;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  onOnboardWorker?: (data: any) => Promise<Worker | void>;
  onSubmitProposal?: (bookingId: string, proposalData: any) => Promise<any>;
}

export const ContractorPortal: React.FC<ContractorPortalProps> = ({
  contractorUser,
  bookings,
  workers,
  onAllocateWorkers,
  onUpdateBookingStatus,
  onOnboardWorker,
  onSubmitProposal
}) => {
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'COMMUNITY' | 'PROJECTS' | 'EARNINGS'>('REQUESTS');
  
  // State for worker allocation modal
  const [allocatingBooking, setAllocatingBooking] = useState<Booking | null>(null);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [isSubmittingAllocation, setIsSubmittingAllocation] = useState(false);

  // Search & Filter state for Worker Community Roster
  const [workerSearchTerm, setWorkerSearchTerm] = useState('');
  const [selectedTradeFilter, setSelectedTradeFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'RATING' | 'EXPERIENCE' | 'JOBS' | 'NAME'>('RATING');
  const [viewingWorkerDossier, setViewingWorkerDossier] = useState<Worker | null>(null);
  const [dossierTab, setDossierTab] = useState<'KYC' | 'WELFARE' | 'SKILLS' | 'PERFORMANCE'>('KYC');

  // Contractor Workforce Planning state (keyed by booking ID)
  const [planningData, setPlanningData] = useState<Record<string, {
    craftsmenRole: string;
    craftsmenCount: number;
    helpersCount: number;
    durationDays: number;
    scaffolding: boolean;
    sander: boolean;
    sprayer: boolean;
    dropSheets: boolean;
    notes: string;
  }>>({});
  const [submittingProposalId, setSubmittingProposalId] = useState<string | null>(null);

  const getPlan = (bookingId: string, defaultRole: string = 'Painter') => {
    if (planningData[bookingId]) return planningData[bookingId];
    return {
      craftsmenRole: defaultRole,
      craftsmenCount: 3,
      helpersCount: 1,
      durationDays: 4,
      scaffolding: true,
      sander: true,
      sprayer: false,
      dropSheets: true,
      notes: 'Cooperative depot scaffolding & sanders included. 80% direct to worker bank accounts.'
    };
  };

  const updatePlan = (bookingId: string, updates: Partial<any>) => {
    setPlanningData(prev => ({
      ...prev,
      [bookingId]: { ...getPlan(bookingId), ...updates }
    }));
  };

  // State for onboarding new worker to community
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerTrade, setNewWorkerTrade] = useState('Painting');
  const [newWorkerAadhaar, setNewWorkerAadhaar] = useState('');

  // Contractor profile info
  const contractorName = contractorUser?.name || 'Balasaheb Ramchandra Shinde';
  const contractorPhone = contractorUser?.phone || '+91 98224 88120';
  const licenseNumber = contractorUser?.extraMeta?.license || 'LIC/CLRA/PNE/2022/8812';
  const cooperativeName = contractorUser?.extraMeta?.cooperative || 'Brihan-Maharashtra Multi-Trade Labour Cooperative';

  // Workers in the contractor's community roster
  const communityWorkers = workers;

  // Available unique trades from workers
  const availableTrades = Array.from(new Set(workers.map(w => w.trade))).filter(Boolean);

  // Filtered & Sorted workers for contractor roster
  const filteredCommunityWorkers = workers.filter(w => {
    const term = workerSearchTerm.toLowerCase().trim();
    const matchesSearch = term === '' ||
      w.name.toLowerCase().includes(term) ||
      w.phone.toLowerCase().includes(term) ||
      w.trade.toLowerCase().includes(term) ||
      (w.subTrades && w.subTrades.some(st => st.toLowerCase().includes(term))) ||
      (w.location?.area && w.location.area.toLowerCase().includes(term)) ||
      (w.welfareDetails?.pmjayCardNumber && w.welfareDetails.pmjayCardNumber.toLowerCase().includes(term));

    const matchesTrade = selectedTradeFilter === 'ALL' || w.trade.toLowerCase() === selectedTradeFilter.toLowerCase();
    const matchesStatus = selectedStatusFilter === 'ALL' || 
      (selectedStatusFilter === 'AVAILABLE' && w.status === 'AVAILABLE') ||
      (selectedStatusFilter === 'ON_DUTY' && w.status !== 'AVAILABLE');

    return matchesSearch && matchesTrade && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === 'RATING') return (b.customerRating || 4.8) - (a.customerRating || 4.8);
    if (sortBy === 'EXPERIENCE') return (b.experienceYears || 0) - (a.experienceYears || 0);
    if (sortBy === 'JOBS') return (b.completedJobs || 0) - (a.completedJobs || 0);
    return a.name.localeCompare(b.name);
  });

  // Team bookings relevant to contractor
  const teamBookings = bookings.filter(b => b.bookingMode === 'CONTRACTOR_TEAM');
  const pendingRequests = teamBookings.filter(b => b.status === 'MATCHING' || (b.assignedWorkerIds && b.assignedWorkerIds.length < (b.teamSize || 1)));
  const ongoingProjects = teamBookings.filter(b => b.status === 'ALLOCATED' || b.status === 'IN_PROGRESS');
  const completedProjects = teamBookings.filter(b => b.status === 'COMPLETED');

  // Handle worker checkbox toggle in allocation modal
  const toggleWorkerSelection = (workerId: string) => {
    setSelectedWorkerIds(prev => {
      if (prev.includes(workerId)) {
        return prev.filter(id => id !== workerId);
      } else {
        const targetSize = allocatingBooking?.teamSize || 4;
        if (prev.length >= targetSize) {
          return prev; // limit to required team size
        }
        return [...prev, workerId];
      }
    });
  };

  const handleConfirmAllocation = async () => {
    if (!allocatingBooking) return;
    setIsSubmittingAllocation(true);
    try {
      await onAllocateWorkers(allocatingBooking._id, selectedWorkerIds);
      setAllocatingBooking(null);
      setSelectedWorkerIds([]);
    } finally {
      setIsSubmittingAllocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      
      {/* 1. Top Contractor Banner */}
      <div className="bg-slate-950 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center font-black text-2xl shadow-inner">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    CLRA Certified Labour Contractor
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Active Gang Leader
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {contractorName}
                </h1>
                <p className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Permit: <strong className="text-slate-200 font-mono">{licenseNumber}</strong></span>
                  <span>•</span>
                  <span>Cooperative: <strong className="text-slate-200">{cooperativeName}</strong></span>
                  <span>•</span>
                  <span>Phone: <strong className="text-slate-200">{contractorPhone}</strong></span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddWorkerModal(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Onboard Shramik</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Managed Community Size
              </span>
              <div className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                <span>{communityWorkers.length} Shramiks</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  100% KYC
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Painting, Deep Cleaning & Masonry
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Pending Team Requests
              </span>
              <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-2">
                <span>{pendingRequests.length} Orders</span>
                <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded-full animate-pulse">
                  Action Needed
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Requires crew worker allocation
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ongoing Crew Contracts
              </span>
              <div className="text-2xl font-black text-blue-400 mt-1 flex items-center gap-2">
                <span>{ongoingProjects.length} Active</span>
                <span className="text-[10px] text-blue-300 font-bold bg-blue-950/60 px-2 py-0.5 rounded-full">
                  On Site
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Housing societies & large flats
              </span>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Community Welfare Corpus
              </span>
              <div className="text-2xl font-black text-emerald-400 mt-1 flex items-center gap-2">
                <span>₹68,400</span>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  6% Reserve
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Accumulated from team contracts
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-1.5 flex items-center gap-1 overflow-x-auto">
          
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'REQUESTS'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4 text-blue-400" />
            <span>Incoming Team Requests</span>
            {pendingRequests.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('COMMUNITY')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'COMMUNITY'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Worker Community Roster ({communityWorkers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PROJECTS')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'PROJECTS'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <HardHat className="w-4 h-4 text-amber-400" />
            <span>Crew Projects ({ongoingProjects.length + completedProjects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EARNINGS')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'EARNINGS'
                ? 'bg-slate-950 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Community Settlements (80/10/6/4)</span>
          </button>

        </div>
      </div>

      {/* 3. Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* ================= TAB 1: INCOMING TEAM REQUESTS ================= */}
        {activeTab === 'REQUESTS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Customer Outcomes & Workforce Planning</span>
                  <span className="text-xs font-extrabold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {teamBookings.length} Total Projects
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customers describe WHAT work they want done (e.g. Paint 3 BHK, Renovate Bathroom). You evaluate site details and formulate the workforce plan.
                </p>
              </div>
            </div>

            {teamBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No Pending Project Requirements</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  When a customer submits a project outcome (e.g. "I want to paint my 3 BHK flat"), it will arrive here for your workforce sizing and proposal.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {teamBookings.map((booking) => {
                  const plan = getPlan(booking._id, booking.subTrade?.includes('Paint') ? 'Painter' : 'Craftsman');
                  const assignedCount = booking.assignedWorkerIds ? booking.assignedWorkerIds.length : 0;
                  const isFullyAllocated = assignedCount >= (booking.teamSize || 1) && booking.status !== 'MATCHING' && booking.status !== 'PROPOSAL_PENDING' && booking.status !== 'PROPOSAL_RECEIVED';

                  // Calculate statutory cost for current plan
                  const craftsmanCost = plan.craftsmenCount * 1200 * plan.durationDays;
                  const helperCost = plan.helpersCount * 700 * plan.durationDays;
                  const depotCost = (plan.scaffolding ? 800 : 0) + (plan.sander ? 300 : 0) + (plan.sprayer ? 500 : 0) + 500;
                  const totalStatutoryCost = craftsmanCost + helperCost + depotCost;

                  // Find full worker objects for assigned workers
                  const assignedShramiks = (booking.assignedWorkerIds || [])
                    .map(wid => communityWorkers.find(w => w._id === wid))
                    .filter(Boolean) as Worker[];

                  return (
                    <div
                      key={booking._id}
                      className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5 hover:border-slate-300 transition flex flex-col justify-between"
                    >
                      <div className="space-y-4">
                        
                        {/* 1. TOP HEADER: Reference, Category & Prominent Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-900 text-white tracking-wider">
                              REQ-#{booking._id.replace('bk_', '').toUpperCase()}
                            </span>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200">
                              {booking.serviceCategory}
                            </span>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {booking.projectScope?.propertyType || 'Residential / Society'}
                            </span>
                          </div>

                          {/* Dynamic Status Badge */}
                          <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 ${
                            isFullyAllocated
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs'
                              : booking.status === 'PROPOSAL_RECEIVED'
                              ? 'bg-purple-50 text-purple-800 border border-purple-200'
                              : booking.status === 'MATCHING'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 animate-pulse'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${isFullyAllocated ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'}`} />
                            {isFullyAllocated
                              ? 'Crew On-Site & Active ✓'
                              : booking.status === 'PROPOSAL_RECEIVED'
                              ? 'Proposal Sent ⏳ (Awaiting Client)'
                              : booking.status === 'MATCHING'
                              ? 'Plan Approved! Ready to Dispatch Crew'
                              : 'Needs Workforce Planning & Sizing'}
                          </span>
                        </div>

                        {/* 2. PROJECT HEADLINE & SITE OBJECTIVE */}
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-snug">
                            {booking.projectScope?.taskDescription || booking.subTrade}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold mt-0.5">
                            Sub-Trade: <strong className="text-slate-800">{booking.subTrade}</strong> • Managed via {booking.cooperativeName || 'Maharashtra Labour Cooperative'}
                          </p>
                        </div>

                        {/* 3. DESCRIPTIVE 4-PILLAR SITE & LOGISTICS DOSSIER */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          
                          {/* Pillar 1: Structure & Area */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              🏢 Structure & Surface
                            </span>
                            <div className="font-black text-slate-900 text-xs">
                              {booking.projectScope?.propertyType || '3 BHK Flat'}
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              Scope: <strong className="text-slate-800">{booking.projectScope?.scopeType || 'Interior & Exterior'}</strong>
                              {booking.projectScope?.approxAreaSqFt && (
                                <span className="text-blue-700 font-bold ml-1">
                                  ({booking.projectScope.approxAreaSqFt.toLocaleString('en-IN')} sq.ft)
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pillar 2: Schedule & Execution */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              📅 Schedule & Turnaround
                            </span>
                            <div className="font-black text-slate-900 text-xs">
                              {booking.projectScope?.preferredStartDate || '05 Sep 2026 (Immediate)'}
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              Duration: <strong className="text-slate-800">{booking.projectDurationDays || 2} Full Days</strong> (16 Site Hours)
                            </div>
                          </div>

                          {/* Pillar 3: Geo-Location & Proximity */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              📍 Geo-Location & Transit
                            </span>
                            <div className="font-black text-slate-900 text-xs truncate">
                              {booking.address}
                            </div>
                            <div className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span>1.8 km from Mukaddam Depot (~18 min transit)</span>
                            </div>
                          </div>

                          {/* Pillar 4: Authorized Client Contact */}
                          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                              📞 Client Representative
                            </span>
                            <div className="font-black text-slate-900 text-xs">
                              {booking.customerName}
                            </div>
                            <div className="text-[11px] font-mono font-bold text-slate-600">
                              {booking.customerPhone} (Call / WhatsApp)
                            </div>
                          </div>

                        </div>

                        {/* 4. CLIENT TECHNICAL BRIEF & SPECIAL REQUIREMENTS CALLOUT */}
                        {booking.projectScope?.specialRequirements && (
                          <div className="p-3.5 bg-blue-50/60 rounded-2xl border border-blue-200/60 space-y-1 text-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 flex items-center gap-1">
                              <FileText className="w-3 h-3 text-blue-600" />
                              <span>Client Technical Scope & Special Instructions</span>
                            </span>
                            <p className="text-[11px] text-slate-700 leading-relaxed italic">
                              "{booking.projectScope.specialRequirements}"
                            </p>
                          </div>
                        )}

                        {/* 5. WORKFORCE ARCHITECTURE & SIZING BREAKDOWN */}
                        <div className="p-3.5 bg-gradient-to-r from-slate-900 to-slate-950 rounded-2xl text-white space-y-2 text-xs">
                          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Workforce Architecture & Sizing
                            </span>
                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-md">
                              {booking.teamSize || 3} Certified Shramiks • {(booking.teamSize || 3) * (booking.projectDurationDays || 2)} Man-Days
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center pt-1">
                            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">👨‍🎨 Master Craftsmen</span>
                              <strong className="text-sm font-black text-white">2 Specialists</strong>
                              <span className="text-[9px] text-slate-400 block font-mono">₹1,200/day</span>
                            </div>
                            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">👷 Riggers / Helpers</span>
                              <strong className="text-sm font-black text-white">1 Assistant</strong>
                              <span className="text-[9px] text-slate-400 block font-mono">₹700/day</span>
                            </div>
                            <div className="bg-slate-800/60 p-2 rounded-xl border border-slate-700/60 col-span-2 sm:col-span-1">
                              <span className="text-[9px] uppercase font-bold text-slate-400 block">🛡️ Safety Lead</span>
                              <strong className="text-sm font-black text-amber-400">Mukaddam</strong>
                              <span className="text-[9px] text-slate-400 block">On-Site Supervision</span>
                            </div>
                          </div>
                        </div>

                        {/* 6. DEPOT EQUIPMENT & SAFETY GEAR ALLOCATED */}
                        {booking.proposal?.materialsAndEquipment && booking.proposal.materialsAndEquipment.length > 0 && (
                          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/70 space-y-1.5 text-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                              <HardHat className="w-3 h-3 text-amber-600" />
                              <span>Allocated Cooperative Depot Equipment & Safety Gear</span>
                            </span>
                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                              {booking.proposal.materialsAndEquipment.map((eq: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-bold bg-white text-slate-800 px-2.5 py-1 rounded-lg border border-amber-200/80 shadow-2xs flex items-center gap-1"
                                >
                                  <Check className="w-2.5 h-2.5 text-emerald-600" />
                                  <span>{eq}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 7. TRANSPARENT STATUTORY FINANCIAL SPLIT (80/10/6/4) */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-slate-900 text-[11px] uppercase tracking-wider">
                              Transparent Statutory Split (80/10/6/4)
                            </span>
                            <strong className="font-black text-slate-950 text-sm">
                              Total Budget: ₹{booking.totalAmount.toLocaleString('en-IN')}
                            </strong>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px]">
                            <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5">
                              <span className="text-slate-400 block font-bold">Worker Wages (80%)</span>
                              <strong className="text-xs font-black text-emerald-700 block">
                                ₹{(booking.paymentBreakdown?.workerAmount || 14800).toLocaleString('en-IN')}
                              </strong>
                              <span className="text-[9px] text-slate-500 block">₹4,933 / Worker</span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5">
                              <span className="text-slate-400 block font-bold">Depot / Tools (10%)</span>
                              <strong className="text-xs font-black text-blue-700 block">
                                ₹{(booking.paymentBreakdown?.coopAmount || 1850).toLocaleString('en-IN')}
                              </strong>
                              <span className="text-[9px] text-slate-500 block">Scaffolding Reserve</span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5">
                              <span className="text-slate-400 block font-bold">PM-JAY Welfare (6%)</span>
                              <strong className="text-xs font-black text-purple-700 block">
                                ₹{(booking.paymentBreakdown?.welfareAmount || 1110).toLocaleString('en-IN')}
                              </strong>
                              <span className="text-[9px] text-slate-500 block">₹5L Health Fund</span>
                            </div>
                            <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5">
                              <span className="text-slate-400 block font-bold">Digital Rail (4%)</span>
                              <strong className="text-xs font-black text-slate-700 block">
                                ₹{(booking.paymentBreakdown?.platformAmount || 740).toLocaleString('en-IN')}
                              </strong>
                              <span className="text-[9px] text-slate-500 block">Escrow & GPS</span>
                            </div>
                          </div>
                        </div>

                        {/* CASE 1: PROPOSAL PENDING -> SHOW WORKFORCE PLANNING MATRIX */}
                        {(booking.status === 'PROPOSAL_PENDING' || (!booking.proposal && booking.status !== 'MATCHING' && !isFullyAllocated)) && (
                          <div className="p-4 bg-gradient-to-br from-blue-50/80 to-slate-50 rounded-2xl border border-blue-200/80 space-y-3.5 text-xs">
                            <div className="flex items-center justify-between pb-1 border-b border-blue-200/60">
                              <span className="font-black text-blue-950 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                                <span>Contractor Workforce Planning Console</span>
                              </span>
                              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                                Mukaddam Sizing
                              </span>
                            </div>

                            {/* Sizing Controls Grid */}
                            <div className="grid grid-cols-3 gap-2 text-center">
                              {/* 1. Craftsmen */}
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                                  👨‍🎨 Skilled {plan.craftsmenRole}s
                                </span>
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => updatePlan(booking._id, { craftsmenCount: Math.max(1, plan.craftsmenCount - 1) })}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <span className="font-black text-sm text-slate-900">{plan.craftsmenCount}</span>
                                  <button
                                    type="button"
                                    onClick={() => updatePlan(booking._id, { craftsmenCount: plan.craftsmenCount + 1 })}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-[9px] text-slate-400 block font-mono">₹1,200/day</span>
                              </div>

                              {/* 2. Helpers */}
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                                  👷 Assistants
                                </span>
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => updatePlan(booking._id, { helpersCount: Math.max(0, plan.helpersCount - 1) })}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <span className="font-black text-sm text-slate-900">{plan.helpersCount}</span>
                                  <button
                                    type="button"
                                    onClick={() => updatePlan(booking._id, { helpersCount: plan.helpersCount + 1 })}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-[9px] text-slate-400 block font-mono">₹700/day</span>
                              </div>

                              {/* 3. Duration Days */}
                              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                                <span className="text-[9px] uppercase font-bold text-slate-400 block truncate">
                                  📅 Duration
                                </span>
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => updatePlan(booking._id, { durationDays: Math.max(1, plan.durationDays - 1) })}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  >
                                    −
                                  </button>
                                  <span className="font-black text-sm text-slate-900">{plan.durationDays}d</span>
                                  <button
                                    type="button"
                                    onClick={() => updatePlan(booking._id, { durationDays: plan.durationDays + 1 })}
                                    className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold flex items-center justify-center text-xs cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="text-[9px] text-slate-400 block font-mono">Site Days</span>
                              </div>
                            </div>

                            {/* Equipment Selection */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase text-slate-500 block">
                                Depot Equipment Checklist:
                              </span>
                              <div className="grid grid-cols-2 gap-2 text-[11px]">
                                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={plan.scaffolding}
                                    onChange={(e) => updatePlan(booking._id, { scaffolding: e.target.checked })}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="font-medium text-slate-700">Aluminium Scaffolding</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={plan.sander}
                                    onChange={(e) => updatePlan(booking._id, { sander: e.target.checked })}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="font-medium text-slate-700">Surface Sander</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={plan.sprayer}
                                    onChange={(e) => updatePlan(booking._id, { sprayer: e.target.checked })}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="font-medium text-slate-700">Paint Sprayer</span>
                                </label>
                                <label className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={plan.dropSheets}
                                    onChange={(e) => updatePlan(booking._id, { dropSheets: e.target.checked })}
                                    className="rounded text-blue-600"
                                  />
                                  <span className="font-medium text-slate-700">Floor Drop Sheets</span>
                                </label>
                              </div>
                            </div>

                            {/* Total Cost Calculation & Action */}
                            <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Statutory Estimate</span>
                                <strong className="text-base font-black text-slate-900">₹{totalStatutoryCost.toLocaleString('en-IN')}</strong>
                                <span className="text-[10px] text-emerald-700 block font-semibold">80% Take-home wage guaranteed</span>
                              </div>

                              <button
                                type="button"
                                disabled={submittingProposalId === booking._id}
                                onClick={async () => {
                                  setSubmittingProposalId(booking._id);
                                  try {
                                    if (!onSubmitProposal) {
                                      alert('Proposal handler not configured');
                                      return;
                                    }

                                    const equipmentList = [
                                      plan.scaffolding && 'Aluminium Scaffolding (2 Units)',
                                      plan.sander && 'Surface Putty Sander',
                                      plan.sprayer && 'Airless Paint Sprayer',
                                      plan.dropSheets && 'Floor Protection Sheets'
                                    ].filter(Boolean);

                                    await onSubmitProposal(booking._id, {
                                      workforce: [
                                        { role: `Master ${plan.craftsmenRole}`, count: plan.craftsmenCount, skills: 'Trade certified' },
                                        ...(plan.helpersCount > 0 ? [{ role: 'Assistant Helper', count: plan.helpersCount, skills: 'Site support' }] : [])
                                      ],
                                      estimatedDurationDays: plan.durationDays,
                                      estimatedCost: totalStatutoryCost,
                                      materialsAndEquipment: equipmentList,
                                      notes: plan.notes
                                    });
                                  } catch (err: any) {
                                    alert(err.message || 'Failed to submit proposal');
                                  } finally {
                                    setSubmittingProposalId(null);
                                  }
                                }}
                                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {submittingProposalId === booking._id ? (
                                  <span>Sending Proposal...</span>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Send Proposal to Customer ➔</span>
                                  </>
                                )}
                              </button>
                            </div>

                          </div>
                        )}

                        {/* CASE 2: PROPOSAL SENT -> AWAITING CUSTOMER APPROVAL */}
                        {booking.status === 'PROPOSAL_RECEIVED' && (
                          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-purple-600" />
                                <span>Proposal Sent to Customer</span>
                              </span>
                              <span className="font-black text-purple-900 text-sm">
                                ₹{booking.totalAmount.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <p className="text-[11px] text-purple-800">
                              Proposed: <strong>{booking.proposal?.workforce?.map(w => `${w.count} ${w.role}`).join(', ') || `${booking.teamSize || 4} Workers`}</strong> for <strong>{booking.projectDurationDays || 4} Days</strong>.
                            </p>
                            <span className="text-[10px] text-slate-500 italic block">
                              Awaiting customer approval in Customer Portal.
                            </span>
                          </div>
                        )}

                        {/* CASE 3: PROPOSAL APPROVED & FULLY ALLOCATED -> SHOW INDIVIDUAL SHRAMIK PROFILES */}
                        {(booking.status === 'MATCHING' || isFullyAllocated) && (
                          <div className="space-y-3 pt-1">
                            {!isFullyAllocated ? (
                              <button
                                onClick={() => {
                                  setAllocatingBooking(booking);
                                  setSelectedWorkerIds(booking.assignedWorkerIds || []);
                                }}
                                className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                              >
                                <Users className="w-4 h-4 text-white" />
                                <span>Allocate & Dispatch {booking.teamSize || 3} Shramiks from Community ➔</span>
                              </button>
                            ) : (
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Assigned Community Shramiks ({assignedCount} Active On-Site)</span>
                                  </span>
                                  <button
                                    onClick={() => {
                                      setAllocatingBooking(booking);
                                      setSelectedWorkerIds(booking.assignedWorkerIds || []);
                                    }}
                                    className="text-[11px] font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 cursor-pointer"
                                  >
                                    Reallocate Crew ➔
                                  </button>
                                </div>

                                {/* Rich Worker Profile Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                  {assignedShramiks.map((worker) => (
                                    <div
                                      key={worker._id}
                                      className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5 hover:border-blue-400 transition"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-[11px]">
                                            {worker.name.charAt(0)}
                                          </div>
                                          <div>
                                            <strong className="text-xs font-black text-slate-900 block truncate max-w-[120px]">
                                              {worker.name}
                                            </strong>
                                            <span className="text-[10px] text-slate-500 font-semibold block truncate">
                                              {worker.trade}
                                            </span>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-[10px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                                        <span>★ {worker.customerRating || 4.9} ({worker.completedJobs || 380} jobs)</span>
                                        <span className="text-emerald-700 font-bold">✓ PM-JAY ₹5L</span>
                                      </div>

                                      <div className="flex items-center justify-between pt-0.5">
                                        <span className="text-[9px] text-slate-400 font-mono">
                                          📍 {worker.location?.area || 'Nearby'}
                                        </span>
                                        <a
                                          href={`tel:${worker.phone}`}
                                          className="text-[9px] font-bold text-blue-700 hover:underline"
                                        >
                                          📞 Call
                                        </a>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: WORKER COMMUNITY ROSTER ================= */}
        {activeTab === 'COMMUNITY' && (
          <div className="space-y-6">
            
            {/* Roster Header with Onboard Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Worker Community Roster</span>
                  <span className="text-xs font-extrabold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {communityWorkers.length} Verified Shramiks
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete profiles, e-Shram & DigiLocker KYC, PM-JAY medical welfare, and skill certifications.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddWorkerModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>+ Onboard Shramik</span>
                </button>
              </div>
            </div>

            {/* Comprehensive Search & Filter Toolbar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4">
              
              {/* Row 1: Search Input & Sort */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={workerSearchTerm}
                    onChange={(e) => setWorkerSearchTerm(e.target.value)}
                    placeholder="Search by worker name, trade, phone, sub-trade specialization, or area..."
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-2xl bg-slate-50 font-semibold text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
                  />
                  {workerSearchTerm && (
                    <button
                      onClick={() => setWorkerSearchTerm('')}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Status Toggle Buttons */}
                <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold gap-1 self-stretch sm:self-auto justify-center">
                  <button
                    onClick={() => setSelectedStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      selectedStatusFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All ({communityWorkers.length})
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('AVAILABLE')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      selectedStatusFilter === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-emerald-700'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => setSelectedStatusFilter('ON_DUTY')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      selectedStatusFilter === 'ON_DUTY'
                        ? 'bg-blue-900 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-blue-900'
                    }`}
                  >
                    On Duty
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="RATING">Highest Rating ★</option>
                    <option value="EXPERIENCE">Most Experienced</option>
                    <option value="JOBS">Most Jobs Done</option>
                    <option value="NAME">Name (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Trade Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex-shrink-0">
                  Filter Trade:
                </span>
                <button
                  onClick={() => setSelectedTradeFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                    selectedTradeFilter === 'ALL'
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  All Trades
                </button>
                {availableTrades.map(tr => (
                  <button
                    key={tr}
                    onClick={() => setSelectedTradeFilter(tr)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                      selectedTradeFilter === tr
                        ? 'bg-slate-950 text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tr}
                  </button>
                ))}
              </div>

            </div>

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>
                Showing <strong>{filteredCommunityWorkers.length}</strong> of <strong>{communityWorkers.length}</strong> shramiks in your cooperative community
              </span>
              {(workerSearchTerm || selectedTradeFilter !== 'ALL' || selectedStatusFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setWorkerSearchTerm('');
                    setSelectedTradeFilter('ALL');
                    setSelectedStatusFilter('ALL');
                  }}
                  className="text-blue-700 hover:underline font-bold"
                >
                  Reset all filters
                </button>
              )}
            </div>

            {/* Shramiks Grid */}
            {filteredCommunityWorkers.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-3">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No matching shramiks found</h3>
                <p className="text-xs text-slate-500">
                  Try searching with a different name, trade, or clear the filters.
                </p>
                <button
                  onClick={() => {
                    setWorkerSearchTerm('');
                    setSelectedTradeFilter('ALL');
                    setSelectedStatusFilter('ALL');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-950 text-white font-bold text-xs"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCommunityWorkers.map((w, idx) => (
                  <div
                    key={w._id || idx}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-slate-400 hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      
                      {/* Worker Card Top: Initial + Status */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-sm">
                            {w.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-900 transition leading-tight">
                              {w.name}
                            </h3>
                            <span className="text-xs font-bold text-orange-600 block mt-0.5">
                              {w.trade}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          w.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${w.status === 'AVAILABLE' ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                          <span>{w.status === 'AVAILABLE' ? 'Available' : 'On Duty'}</span>
                        </span>
                      </div>

                      {/* Contact & Location */}
                      <div className="space-y-1 text-xs text-slate-600 pt-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{w.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="truncate">{w.location?.area || 'Pune Metro Area'}</span>
                        </div>
                      </div>

                      {/* Sub-Trades List */}
                      {w.subTrades && w.subTrades.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {w.subTrades.slice(0, 3).map((st, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60"
                            >
                              {st}
                            </span>
                          ))}
                          {w.subTrades.length > 3 && (
                            <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
                              +{w.subTrades.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Key Performance Metrics */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center text-xs">
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">Rating</span>
                          <strong className="text-xs font-black text-amber-600 flex items-center justify-center gap-0.5 mt-0.5">
                            ★ {w.customerRating || 4.9}
                          </strong>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">Exp</span>
                          <strong className="text-xs font-black text-slate-900 block mt-0.5">
                            {w.experienceYears || 5}y
                          </strong>
                        </div>
                        <div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 block">Jobs</span>
                          <strong className="text-xs font-black text-slate-900 block mt-0.5">
                            {w.completedJobs || 42}
                          </strong>
                        </div>
                      </div>

                      {/* Social Security Badges */}
                      <div className="space-y-1 text-[10px] font-bold">
                        <div className="flex items-center justify-between text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                          <span className="flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            <span>e-Shram & DigiLocker KYC</span>
                          </span>
                          <span>✓</span>
                        </div>
                        <div className="flex items-center justify-between text-amber-800 bg-amber-50/70 px-2 py-1 rounded-lg border border-amber-100">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-amber-600" />
                            <span>PM-JAY ₹5L Health Cover</span>
                          </span>
                          <span className="font-mono text-[9px]">{w.welfareDetails?.pensionCreditTier || 'Active'}</span>
                        </div>
                      </div>

                    </div>

                    {/* Action: Open Full Dossier */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setViewingWorkerDossier(w);
                          setDossierTab('KYC');
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-blue-400" />
                        <span>View Full Worker Dossier ➔</span>
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* ================= TAB 3: CREW PROJECTS ================= */}
        {activeTab === 'PROJECTS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Crew Projects & Execution
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track ongoing multi-worker jobs on site and mark milestones complete.
                </p>
              </div>
            </div>

            {ongoingProjects.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 space-y-2">
                <HardHat className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No Active Crew Projects</h3>
                <p className="text-xs text-slate-400">Allocate pending team requests to start execution.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {ongoingProjects.map((proj) => (
                  <div
                    key={proj._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-black uppercase text-blue-800 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {proj.bookingMode === 'CONTRACTOR_TEAM' ? `Team of ${proj.teamSize || 4} Shramiks` : 'Job'}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-1">
                          {proj.serviceCategory} • {proj.subTrade}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Customer: <strong>{proj.customerName}</strong> ({proj.customerPhone}) • {proj.address}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Contract Amount</span>
                        <span className="text-lg font-black text-slate-900">
                          ₹{proj.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Crew Workers */}
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-2">
                        Allocated Community Shramiks:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {(proj.assignedWorkerIds && proj.assignedWorkerIds.length > 0
                          ? workers.filter(w => proj.assignedWorkerIds?.includes(w._id))
                          : communityWorkers.slice(0, proj.teamSize || 4)
                        ).map((shramik, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800"
                          >
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{shramik.name}</span>
                            <span className="text-[10px] text-slate-400">({shramik.trade})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">Execution Stage</span>
                        <span className="text-blue-700 uppercase">{proj.status}</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{
                            width: proj.status === 'COMPLETED' ? '100%' : proj.status === 'IN_PROGRESS' ? '70%' : '35%'
                          }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center justify-end gap-3 pt-1">
                      {proj.status !== 'IN_PROGRESS' && (
                        <button
                          onClick={() => onUpdateBookingStatus(proj._id, 'IN_PROGRESS')}
                          className="px-4 py-2 rounded-xl bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs border border-blue-200 cursor-pointer"
                        >
                          Mark Crew On-Site ➔
                        </button>
                      )}
                      <button
                        onClick={() => onUpdateBookingStatus(proj._id, 'COMPLETED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs shadow-sm cursor-pointer"
                      >
                        Complete Contract & Release Payout ✓
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 4: SETTLEMENTS & FAIR PAY ================= */}
        {activeTab === 'EARNINGS' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Community Settlements & 80/10/6/4 Split
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Statutory transparency ledger. Every rupee is distributed without hidden private aggregator cuts.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 text-center">
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                  <span className="text-[10px] font-black uppercase text-emerald-800">80% To Workers</span>
                  <div className="text-xl font-black text-emerald-950 mt-1">Direct Wage</div>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Equally divided among team members</p>
                </div>

                <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-100">
                  <span className="text-[10px] font-black uppercase text-blue-800">10% Contractor Depot</span>
                  <div className="text-xl font-black text-blue-950 mt-1">Equipment & Org</div>
                  <p className="text-[11px] text-blue-700 mt-0.5">Tools, scaffolding & coordinator fee</p>
                </div>

                <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-100">
                  <span className="text-[10px] font-black uppercase text-amber-800">6% Social Security</span>
                  <div className="text-xl font-black text-amber-950 mt-1">PM-JAY + ₹5L Cover</div>
                  <p className="text-[11px] text-amber-700 mt-0.5">Medical & occupational disability</p>
                </div>

                <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-700">4% Digital DPI</span>
                  <div className="text-xl font-black text-slate-900 mt-1">SahakarSetu Rail</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Digital public infrastructure maintenance</p>
                </div>
              </div>

              {/* Sample Contract Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Recent Completed Team Contracts</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-y border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Contract / Client</th>
                        <th className="py-2.5 px-3">Team Size</th>
                        <th className="py-2.5 px-3">Total Value</th>
                        <th className="py-2.5 px-3 text-emerald-700">Workers (80%)</th>
                        <th className="py-2.5 px-3 text-blue-700">Depot (10%)</th>
                        <th className="py-2.5 px-3 text-amber-700">Welfare (6%)</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          Amanora Towers RWA - Exterior Dampness
                        </td>
                        <td className="py-3 px-3">5 Painters</td>
                        <td className="py-3 px-3 font-bold">₹18,500</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">₹14,800</td>
                        <td className="py-3 px-3 font-semibold text-blue-700">₹1,850</td>
                        <td className="py-3 px-3 font-semibold text-amber-700">₹1,110</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            SETTLED
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          Baner Tech Residency - Post Construction Buffing
                        </td>
                        <td className="py-3 px-3">4 Cleaners</td>
                        <td className="py-3 px-3 font-bold">₹9,600</td>
                        <td className="py-3 px-3 font-bold text-emerald-700">₹7,680</td>
                        <td className="py-3 px-3 font-semibold text-blue-700">₹960</td>
                        <td className="py-3 px-3 font-semibold text-amber-700">₹576</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                            PENDING PAYOUT
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* ================= MODAL: ALLOCATE WORKERS TO TEAM REQUEST ================= */}
      {allocatingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider block">
                  Level 2 Geo-Location Workforce Dispatch
                </span>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Allocate {allocatingBooking.teamSize || 3} Shramiks to Project
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Shramiks are sorted by proximity to customer site (<strong>{allocatingBooking.address}</strong>) to eliminate transit delays.
                </p>
              </div>
              <button
                onClick={() => setAllocatingBooking(null)}
                className="text-white/70 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Detailed Project Scope Summary Banner */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-sm font-black text-slate-900">
                    {allocatingBooking.projectScope?.taskDescription || allocatingBooking.subTrade}
                  </strong>
                  <span className="font-black text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Budget: ₹{allocatingBooking.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                  <div>
                    Client: <strong className="text-slate-900">{allocatingBooking.customerName}</strong> ({allocatingBooking.customerPhone})
                  </div>
                  <div>
                    Site: <strong className="text-slate-900">{allocatingBooking.address}</strong>
                  </div>
                  <div>
                    Scope: <strong className="text-slate-900">{allocatingBooking.projectScope?.propertyType || 'Residential'} • {allocatingBooking.projectScope?.approxAreaSqFt || 1200} sq.ft</strong>
                  </div>
                  <div>
                    Target: <strong className="text-slate-900">{allocatingBooking.projectScope?.preferredStartDate || 'Immediate'}</strong> ({allocatingBooking.projectDurationDays || 2} Days)
                  </div>
                </div>

                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between font-black text-blue-900">
                  <span>Workforce Requirement: {allocatingBooking.teamSize || 3} Shramiks</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedWorkerIds.length === (allocatingBooking.teamSize || 3)
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    Selected: {selectedWorkerIds.length} of {allocatingBooking.teamSize || 3} Shramiks
                  </span>
                </div>
              </div>

              {/* Worker Selection List Sorted by Proximity */}
              <div className="space-y-2">
                <span className="font-black text-slate-800 text-[11px] uppercase tracking-wider block">
                  Select Shramiks from Community Pool (Proximity Sorted):
                </span>
                
                {communityWorkers.map((worker, idx) => {
                  const isChecked = selectedWorkerIds.includes(worker._id);
                  const isClosest = idx === 0 || idx === 1;

                  return (
                    <div
                      key={worker._id}
                      onClick={() => toggleWorkerSelection(worker._id)}
                      className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-xs">{worker.name}</span>
                            {isClosest && (
                              <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-900 px-1.5 py-0.2 rounded">
                                Nearest Shramik ✓
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {worker.trade} • {worker.experienceYears || 5} yrs exp • ★ {worker.customerRating || 4.9}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px]">
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              🛡️ PM-JAY Active (₹5L)
                            </span>
                            <span className="text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                              ✓ e-Shram UAN
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border block ${
                          worker.status === 'AVAILABLE'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {worker.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          📍 {worker.location?.area || 'Pune'} ({(1.2 + idx * 0.6).toFixed(1)} km)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs">
                <span className="text-slate-500">Selected: </span>
                <strong className="text-slate-900">{selectedWorkerIds.length}</strong>
                <span className="text-slate-500"> of {allocatingBooking.teamSize || 3} Required</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAllocatingBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={selectedWorkerIds.length === 0 || isSubmittingAllocation}
                  onClick={handleConfirmAllocation}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black transition shadow-sm flex items-center gap-2 cursor-pointer text-xs"
                >
                  {isSubmittingAllocation ? (
                    <span>Allocating...</span>
                  ) : (
                    <span>Confirm & Dispatch {selectedWorkerIds.length} Shramiks ➔</span>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: WORKER FULL PROFILE & KYC DOSSIER ================= */}
      {viewingWorkerDossier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-400/30 text-blue-300 flex items-center justify-center font-black text-xl">
                  {viewingWorkerDossier.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-white">{viewingWorkerDossier.name}</h2>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      viewingWorkerDossier.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {viewingWorkerDossier.status === 'AVAILABLE' ? 'Available' : 'On Duty'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    {viewingWorkerDossier.trade} • {viewingWorkerDossier.cooperativeName || 'Maharashtra Labour Cooperative'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setViewingWorkerDossier(null)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Dossier Navigation Tabs */}
            <div className="flex items-center border-b border-slate-200 px-5 pt-2 bg-slate-50 gap-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setDossierTab('KYC')}
                className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  dossierTab === 'KYC'
                    ? 'border-slate-950 text-slate-950 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                🛡️ KYC & Identity
              </button>
              <button
                onClick={() => setDossierTab('WELFARE')}
                className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  dossierTab === 'WELFARE'
                    ? 'border-slate-950 text-slate-950 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                🏥 PM-JAY & Welfare
              </button>
              <button
                onClick={() => setDossierTab('SKILLS')}
                className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  dossierTab === 'SKILLS'
                    ? 'border-slate-950 text-slate-950 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                📜 Verified Skills
              </button>
              <button
                onClick={() => setDossierTab('PERFORMANCE')}
                className={`py-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  dossierTab === 'PERFORMANCE'
                    ? 'border-slate-950 text-slate-950 font-black'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                📊 Performance & Earnings
              </button>
            </div>

            {/* Tab Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* TAB 1: KYC */}
              {dossierTab === 'KYC' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-emerald-950">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      <div>
                        <strong className="block text-xs">100% Sovereign KYC Verified</strong>
                        <span className="text-[11px] text-emerald-700">Digital verification via e-Shram & DigiLocker protocols</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                      VALID
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Aadhaar Status</span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5">
                        {viewingWorkerDossier.aadhaarNumber || 'XXXX-XXXX-8821 (Linked)'}
                      </strong>
                      <span className="text-[10px] text-emerald-700 font-bold">✓ DigiLocker Authenticated</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">e-Shram UAN</span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5">
                        UAN-2024-MH-9942
                      </strong>
                      <span className="text-[10px] text-blue-700 font-bold">✓ Active Central Registry</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Police Clearance</span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5">
                        Cleared / Clean Record
                      </strong>
                      <span className="text-[10px] text-slate-500">Pune City Police Commissionerate</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">CLRA Affiliation</span>
                      <strong className="text-xs font-black text-slate-900 block mt-0.5">
                        {licenseNumber}
                      </strong>
                      <span className="text-[10px] text-slate-500">Registered Gang Member</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Contact & Address</span>
                    <p className="font-semibold text-slate-800">Phone: <strong>{viewingWorkerDossier.phone}</strong></p>
                    <p className="text-slate-600">Location: {viewingWorkerDossier.location?.area || 'Kothrud, Pune 411038'}</p>
                  </div>
                </div>
              )}

              {/* TAB 2: WELFARE */}
              {dossierTab === 'WELFARE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200">
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">PM-JAY Health Cover</span>
                      <strong className="text-base font-black text-emerald-950 mt-1 block">₹5,00,000 / Year</strong>
                      <p className="text-[10px] text-emerald-700 mt-0.5">Card: {viewingWorkerDossier.welfareDetails?.pmjayCardNumber || 'PMJAY-MH-9942-1802'}</p>
                    </div>

                    <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-200">
                      <span className="text-[10px] uppercase font-bold text-blue-800 block">Accidental Cover</span>
                      <strong className="text-base font-black text-blue-950 mt-1 block">₹2,00,000 (PMSBY)</strong>
                      <p className="text-[10px] text-blue-700 mt-0.5">Active via Cooperative Group Policy</p>
                    </div>

                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-amber-800 block">Accumulated Welfare Fund</span>
                      <strong className="text-base font-black text-amber-950 mt-1 block">
                        ₹{(viewingWorkerDossier.welfareDetails?.welfareContributionBalance || 24650).toLocaleString('en-IN')}
                      </strong>
                      <p className="text-[10px] text-amber-700 mt-0.5">6% statutory contribution credited</p>
                    </div>

                    <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200">
                      <span className="text-[10px] uppercase font-bold text-purple-800 block">Pension Credit Tier</span>
                      <strong className="text-base font-black text-purple-950 mt-1 block">
                        {viewingWorkerDossier.welfareDetails?.pensionCreditTier || 'Gold Tier'}
                      </strong>
                      <p className="text-[10px] text-purple-700 mt-0.5">Pradhan Mantri Shram Yogi Maandhan</p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-700 space-y-1">
                    <p>• Last Preventive Health Checkup: <strong>{viewingWorkerDossier.welfareDetails?.lastHealthCheckup || 'May 2026'}</strong></p>
                    <p>• Children Education Scholarships: <strong>{viewingWorkerDossier.welfareDetails?.scholarshipAvailedForDependents || 1} Dependent Enrolled</strong></p>
                  </div>
                </div>
              )}

              {/* TAB 3: SKILLS */}
              {dossierTab === 'SKILLS' && (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    Certified Trade Qualifications & Government Certifications:
                  </span>

                  {(viewingWorkerDossier.verifiedSkills && viewingWorkerDossier.verifiedSkills.length > 0) ? (
                    <div className="space-y-2">
                      {viewingWorkerDossier.verifiedSkills.map((sk, i) => (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <strong className="text-xs font-black text-slate-900 block">{sk.name}</strong>
                            <span className="text-[10px] text-slate-500">Issuer: {sk.issuer}</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Verified {sk.verifiedDate}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500">
                      Standard trade qualification verified upon cooperative induction.
                    </div>
                  )}

                  {viewingWorkerDossier.subTrades && viewingWorkerDossier.subTrades.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Approved Sub-Trade Competencies:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {viewingWorkerDossier.subTrades.map((st, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 font-bold text-[10px]">
                            {st}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: PERFORMANCE */}
              {dossierTab === 'PERFORMANCE' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Customer Rating</span>
                      <strong className="text-base font-black text-amber-600 block mt-0.5">★ {viewingWorkerDossier.customerRating || 4.9}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Jobs Completed</span>
                      <strong className="text-base font-black text-slate-900 block mt-0.5">{viewingWorkerDossier.completedJobs || 412}</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Experience</span>
                      <strong className="text-base font-black text-slate-900 block mt-0.5">{viewingWorkerDossier.experienceYears || 9} Years</strong>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Reliability</span>
                      <strong className="text-base font-black text-emerald-700 block mt-0.5">{viewingWorkerDossier.reliabilityScore || 98.4}%</strong>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Total Career Wages Distributed</span>
                      <strong className="text-lg font-black text-emerald-400">
                        ₹{(viewingWorkerDossier.totalEarnings || 184500).toLocaleString('en-IN')}
                      </strong>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
                      80% Direct To Bank
                    </span>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <a
                href={`tel:${viewingWorkerDossier.phone}`}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold hover:bg-slate-100 text-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Call Shramik</span>
              </a>

              <button
                onClick={() => setViewingWorkerDossier(null)}
                className="px-5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>

          </div>
        </div>
      )}

      {showAddWorkerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
              <h2 className="text-base font-black text-white">
                Onboard Shramik to Community
              </h2>
              <button
                onClick={() => setShowAddWorkerModal(false)}
                className="text-white/70 hover:text-white text-xl font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsOnboarding(true);
                try {
                  if (onOnboardWorker) {
                    await onOnboardWorker({
                      name: newWorkerName,
                      phone: newWorkerPhone,
                      trade: newWorkerTrade,
                      aadhaar: newWorkerAadhaar,
                      cooperativeName: cooperativeName,
                      contractorId: 'cnt_101'
                    });
                  }
                  setShowAddWorkerModal(false);
                  setNewWorkerName('');
                  setNewWorkerPhone('');
                  setNewWorkerAadhaar('');
                } catch (err: any) {
                  alert(err.message || 'Failed to onboard worker');
                } finally {
                  setIsOnboarding(false);
                }
              }}
              className="p-6 space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="e.g. Ramesh Shankar Shinde"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={newWorkerPhone}
                  onChange={(e) => setNewWorkerPhone(e.target.value)}
                  placeholder="+91 98220 00000"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Trade Specialization</label>
                  <select
                    value={newWorkerTrade}
                    onChange={(e) => setNewWorkerTrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="Painting">Painting</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                    <option value="Masonry">Masonry</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="General Labour">General Labour</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    required
                    value={newWorkerAadhaar}
                    onChange={(e) => setNewWorkerAadhaar(e.target.value)}
                    placeholder="XXXX-XXXX-1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-[11px] text-emerald-800">
                ✓ Auto-links to e-Shram portal and registers for ₹5L group accidental cover.
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddWorkerModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboarding}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 text-white font-black hover:bg-slate-800 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isOnboarding ? 'Linking Shramik...' : 'Confirm & Link Member ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
