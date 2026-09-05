import React, { useState } from 'react';
import { 
  Cooperative, Worker, InstitutionalContract, DemandForecast, 
  WelfareClaim, Dispute, Booking 
} from '../../types';
import { 
  Globe, ShieldCheck, Building2, Users, TrendingUp, Award, 
  CheckCircle2, AlertCircle, FileCheck, Layers, PieChart, 
  Sparkles, Sliders, ArrowUpRight, Check, HeartHandshake, 
  Phone, MapPin, Scale, RefreshCw, AlertTriangle, Shield, 
  Landmark, DollarSign, HardHat, Briefcase
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

interface CooperativeDashboardProps {
  cooperatives: Cooperative[];
  selectedCoopId?: string;
  onSelectCoop?: (id: string) => void;
  workers: Worker[];
  contracts: InstitutionalContract[];
  forecasts: DemandForecast[];
  welfareLedger: WelfareClaim[];
  disputes: Dispute[];
  bookings?: Booking[];
  onVerifySkill?: (workerId: string, skillName: string, issuer: string) => Promise<void>;
  onUpdateSplit?: (coopId: string, split: any) => Promise<void>;
  onDisburseWelfare?: (claimData: any) => Promise<void>;
  onResolveDispute?: (disputeId: string, resolution: string) => Promise<void>;
}

export const CooperativeDashboard: React.FC<CooperativeDashboardProps> = ({
  cooperatives,
  selectedCoopId,
  onSelectCoop,
  workers,
  contracts,
  forecasts,
  welfareLedger,
  disputes,
  bookings = [],
  onVerifySkill,
  onUpdateSplit,
  onDisburseWelfare,
  onResolveDispute
}) => {
  const [activeTab, setActiveTab] = useState<'SOCIETIES' | 'AI_BALANCING' | 'WORKFORCE_WAGE' | 'WELFARE_VAULT' | 'OPERATIONS_TRUST'>('AI_BALANCING');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [isRebalanced, setIsRebalanced] = useState(false);
  const [rebalanceSuccessMsg, setRebalanceSuccessMsg] = useState<string>('');

  // Selected Primary Cooperative context
  const currentCoop = cooperatives.find(c => c._id === selectedCoopId) || cooperatives[0];

  // Dispute Arbitration State
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionInput, setResolutionInput] = useState<string>('Cooperative Arbitrator verified complaint and issued warranty rectification with complimentary service voucher.');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Skill Verification State
  const [verifyWorkerId, setVerifyWorkerId] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState('High-Voltage Safety Certified (IS-732)');
  const [newSkillIssuer, setNewSkillIssuer] = useState(currentCoop?.name || 'Maharashtra State Labour Cooperative Federation');

  // Welfare Disbursement State
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseWorkerId, setDisburseWorkerId] = useState('');
  const [disburseTitle, setDisburseTitle] = useState('PM-JAY Outpatient Medical Aid Reimbursement');
  const [disburseType, setDisburseType] = useState('EMERGENCY_MEDICAL_AID');
  const [disburseAmount, setDisburseAmount] = useState(2500);
  const [disburseDesc, setDisburseDesc] = useState('Sanctioned under Federation Social Security Bylaw 14(B) for immediate medical and pharmacy cover.');

  // Fair-Pay Split Bylaw State
  const [workerShare, setWorkerShare] = useState(currentCoop?.splitConfig?.workerShare || 80);
  const [coopShare, setCoopShare] = useState(currentCoop?.splitConfig?.coopShare || 10);
  const [welfareShare, setWelfareShare] = useState(currentCoop?.splitConfig?.welfareShare || 6);
  const [platformShare, setPlatformShare] = useState(currentCoop?.splitConfig?.platformShare || 4);

  // Financial & Operational Aggregations
  const totalWelfareFund = cooperatives.reduce((acc, c) => acc + (c.welfareFundBalance || 0), 0);
  const totalWorkersCount = cooperatives.reduce((acc, c) => acc + (c.totalWorkers || 0), 0);
  const totalJobsCompleted = cooperatives.reduce((acc, c) => acc + (c.totalJobsCompleted || 0), 0);
  const totalBookingGross = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalWagesDistributed = bookings.reduce((acc, b) => acc + (b.paymentBreakdown?.workerAmount || Math.round((b.totalAmount || 0) * 0.8)), 0);

  // Trade breakdown across accredited workforce
  const tradeDistribution = workers.reduce<Record<string, number>>((acc, w) => {
    acc[w.trade] = (acc[w.trade] || 0) + 1;
    return acc;
  }, {});

  // Chart data for Demand Forecast
  const forecastChartData = forecasts.map(f => ({
    name: f.locality.split('&')[0].trim(),
    available: isRebalanced && f.locality.toLowerCase().includes('kothrud') ? f.currentAvailableInZone + 5 : f.currentAvailableInZone,
    recommended: f.recommendedWorkforceAllocation,
    shortfall: isRebalanced && f.locality.toLowerCase().includes('kothrud') ? Math.max(0, f.shortfall - 5) : f.shortfall,
    trade: f.trade
  }));

  // Rebalance Directive Action
  const handleAuthorizeRebalance = (locality: string, trade: string, count: number) => {
    setIsRebalanced(true);
    setRebalanceSuccessMsg(`✓ Federation Directive Issued: Authorized temporary inter-society deployment of ${count} ${trade} workers to ${locality} ward.`);
    setTimeout(() => setRebalanceSuccessMsg(''), 7000);
  };

  // Skill Verification Action
  const handleSkillVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyWorkerId || !onVerifySkill) return;
    await onVerifySkill(verifyWorkerId, newSkillName, newSkillIssuer);
    setVerifyWorkerId(null);
    setRebalanceSuccessMsg(`✓ Skill Verified: Issued official certificate badge '${newSkillName}' on state registry.`);
    setTimeout(() => setRebalanceSuccessMsg(''), 5000);
  };

  // Save Split Bylaw Action
  const handleSaveSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workerShare + coopShare + welfareShare + platformShare !== 100) {
      alert('Total percentage shares must sum up to exactly 100%');
      return;
    }
    if (onUpdateSplit && currentCoop) {
      await onUpdateSplit(currentCoop._id, {
        workerShare,
        coopShare,
        welfareShare,
        platformShare
      });
      setRebalanceSuccessMsg(`✓ Bylaw Updated: 80% statutory floor enforced for ${currentCoop.name}.`);
      setTimeout(() => setRebalanceSuccessMsg(''), 5000);
    }
  };

  // Resolve Dispute Action
  const handleConfirmResolve = async (disputeId: string) => {
    if (!onResolveDispute) return;
    setIsResolving(true);
    try {
      await onResolveDispute(disputeId, resolutionInput);
      setSelectedDispute(null);
      setRebalanceSuccessMsg('✓ Grievance Resolved: Official tripartite mediation order recorded.');
      setTimeout(() => setRebalanceSuccessMsg(''), 5000);
    } catch (e: any) {
      alert(e.message || 'Error resolving dispute');
    } finally {
      setIsResolving(false);
    }
  };

  // Disburse Benefit Action
  const handleDisburseBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onDisburseWelfare) return;
    const targetWorker = workers.find(w => w._id === disburseWorkerId) || workers[0];
    await onDisburseWelfare({
      workerId: targetWorker?._id || 'wrk_101',
      workerName: targetWorker?.name || 'Santosh Baburao Kadam',
      cooperativeName: currentCoop?.name || 'Maharashtra State Labour Cooperative Federation',
      type: disburseType,
      title: disburseTitle,
      amount: Number(disburseAmount),
      description: disburseDesc
    });
    setShowDisburseModal(false);
    setRebalanceSuccessMsg(`✓ Welfare Disbursed: ₹${disburseAmount} transferred under PM-JAY/Welfare pool to ${targetWorker?.name || 'Worker'}.`);
    setTimeout(() => setRebalanceSuccessMsg(''), 6000);
  };

  const filteredCooperatives = selectedDistrict === 'ALL' 
    ? cooperatives 
    : cooperatives.filter(c => c.district.toLowerCase().includes(selectedDistrict.toLowerCase()));

  return (
    <div className="space-y-6 pb-20 font-sans max-w-[1360px] mx-auto">
      
      {/* 1. Header with Cooperative Federation & Society Governance */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/30">
              <Globe className="w-3.5 h-3.5 text-purple-400" /> Cooperative Federation Administration Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Maharashtra State Labour Cooperative Federation (MSLCF)
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Apex regulatory governance, statutory 80% fair-wage enforcement, pooled social security fund administration, and AI-driven inter-cooperative workforce rebalancing across affiliated primary labour societies.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-purple-300">
              <span>Active Society: <strong className="text-white">{currentCoop?.name}</strong></span>
              <span>• District: <strong className="text-white">{currentCoop?.district || 'Pune'}</strong></span>
              <span>• President: <strong className="text-white">{currentCoop?.contact?.president || 'Suresh Patil'}</strong></span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-400/30 text-purple-200 font-mono text-[11px]">
              MSCS Reg: <strong>MSCS/CR/2018/MH-4421</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Statutory Bylaw Compliant (80/10/6/4)</span>
            </div>

            {/* Quick Primary Cooperative Switcher */}
            <div className="flex items-center gap-1.5 mt-1 bg-purple-900/40 p-1.5 rounded-xl border border-purple-700/50">
              <span className="text-[10px] text-purple-300 font-bold uppercase whitespace-nowrap">Switch Society:</span>
              <select
                value={currentCoop?._id}
                onChange={(e) => onSelectCoop?.(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1 bg-slate-900 text-white border border-purple-500/40 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 cursor-pointer"
              >
                {cooperatives.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.shortName} ({c.district})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Directive Success Notification */}
      {rebalanceSuccessMsg && (
        <div className="bg-emerald-600 text-white text-xs font-black py-3 px-5 rounded-2xl shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{rebalanceSuccessMsg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setRebalanceSuccessMsg('')} 
            className="text-white hover:text-emerald-100 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Top Executive Metric Strip (5 Core Indicators as per approved SIH plan) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Member Cooperatives */}
        <div 
          onClick={() => setActiveTab('SOCIETIES')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-purple-400 shadow-2xs space-y-1 cursor-pointer transition"
          title="Click to view Member Societies"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Member Societies</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{cooperatives.length} Primary Coops</p>
          <p className="text-[11px] text-purple-700 font-semibold">100% MSCS Compliant</p>
        </div>

        {/* KPI 2: Total Accredited Workforce */}
        <div 
          onClick={() => setActiveTab('WORKFORCE_WAGE')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-blue-400 shadow-2xs space-y-1 cursor-pointer transition"
          title="Click to view Accredited Workforce"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Accredited Shramiks</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalWorkersCount || 1250} Certified</p>
          <p className="text-[11px] text-emerald-700 font-semibold">100% Verified Skill Badges</p>
        </div>

        {/* KPI 3: Federation Welfare Corpus */}
        <div 
          onClick={() => setActiveTab('WELFARE_VAULT')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-amber-400 shadow-2xs space-y-1 cursor-pointer transition"
          title="Click to view Social Security Vault"
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-black uppercase tracking-wider">Pooled Welfare Vault</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">₹{(totalWelfareFund || 482500).toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-amber-800 font-semibold">PM-JAY & Accidental Pool</p>
        </div>

        {/* KPI 4: Direct Worker Wages Disbursed */}
        <div 
          onClick={() => setActiveTab('WORKFORCE_WAGE')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-emerald-400 shadow-2xs space-y-1 cursor-pointer transition"
          title="Click to view 80% Fair-Wage Audit"
        >
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-black uppercase tracking-wider">Wages Disbursed</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">
            ₹{(totalWagesDistributed || 1845000).toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-800 font-semibold">80% Statutory Floor Enforced</p>
        </div>

        {/* KPI 5: Emergency Response Speed */}
        <div 
          onClick={() => setActiveTab('OPERATIONS_TRUST')}
          className="bg-white p-5 rounded-3xl border border-slate-200/90 hover:border-indigo-400 shadow-2xs space-y-1 col-span-2 lg:col-span-1 cursor-pointer transition"
          title="Click to view Emergency Response"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Emergency Response</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">~14 Mins</p>
          <p className="text-[11px] text-indigo-700 font-semibold">Average SOS Doorstep ETA</p>
        </div>

      </div>

      {/* 3. Five-Tab Navigation Bar (Approved SIH Modules) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5 shadow-2xs flex flex-wrap gap-1.5">
        
        <button
          onClick={() => setActiveTab('SOCIETIES')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'SOCIETIES'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Member Societies & Compliance Registry</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-purple-800 text-purple-200 text-[10px]">
            {cooperatives.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('AI_BALANCING')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'AI_BALANCING'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>2. AI Demand & Workforce Balancing</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
            Live AI
          </span>
        </button>

        <button
          onClick={() => setActiveTab('WORKFORCE_WAGE')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'WORKFORCE_WAGE'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>3. Accredited Workforce & 80% Fair-Wage Audit</span>
        </button>

        <button
          onClick={() => setActiveTab('WELFARE_VAULT')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'WELFARE_VAULT'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          <span>4. Social Security & PM-JAY Insurance Vault</span>
        </button>

        <button
          onClick={() => setActiveTab('OPERATIONS_TRUST')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'OPERATIONS_TRUST'
              ? 'bg-purple-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>5. Operations, SLAs & Dispute Arbitration</span>
          {disputes.filter(d => d.status !== 'RESOLVED').length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">
              {disputes.filter(d => d.status !== 'RESOLVED').length}
            </span>
          )}
        </button>

      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MEMBER SOCIETIES & STATUTORY COMPLIANCE REGISTRY                    */}
      {/* ========================================================================= */}
      {activeTab === 'SOCIETIES' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Affiliated Primary Labour Cooperative Societies</h3>
                <p className="text-xs text-slate-500">
                  Statutory verification under Multi-State / Maharashtra Cooperative Societies Act (MSCS) & annual compliance audits.
                </p>
              </div>

              {/* District Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">Filter District:</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                >
                  <option value="ALL">All Districts ({cooperatives.length})</option>
                  <option value="Pune">Pune District</option>
                  <option value="PCMC">PCMC Region</option>
                  <option value="Mumbai">Mumbai Metro</option>
                </select>
              </div>
            </div>

            {/* Societies Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3 px-3">Cooperative Society</th>
                    <th className="py-3 px-3">Registration & District</th>
                    <th className="py-3 px-3">Board President</th>
                    <th className="py-3 px-3">Active Trades</th>
                    <th className="py-3 px-3">Accredited Workforce</th>
                    <th className="py-3 px-3">Compliance & Audit</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCooperatives.map((coop) => (
                    <tr key={coop._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 flex items-center justify-center font-black text-xs shrink-0">
                            {coop.shortName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{coop.name}</p>
                            <p className="text-[11px] text-slate-400">{coop.shortName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-800">{coop.regNumber}</span>
                        <p className="text-[10px] text-slate-400">{coop.district}, {coop.state}</p>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{coop.contact?.president || 'Suresh Patil'}</p>
                        <p className="text-[10px] text-slate-400">{coop.contact?.phone || '+91 98220 99887'}</p>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {coop.serviceCategories.slice(0, 3).map((cat, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">{coop.totalWorkers || 120} Workers</span>
                        <p className="text-[10px] text-emerald-600 font-semibold">{coop.activeWorkers || 85} on duty</p>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified & Audited
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">80% Wage Compliant</p>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => onSelectCoop?.(coop._id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                            currentCoop?._id === coop._id
                              ? 'bg-purple-900 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-900 border border-slate-200'
                          }`}
                        >
                          {currentCoop?._id === coop._id ? '✓ Selected' : 'Select'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Federation Institutional Registration Protocol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-2xl bg-purple-50 text-purple-800 flex items-center justify-center font-black">
                1
              </div>
              <h4 className="text-sm font-black text-slate-900">Cooperative Society Registration</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Verification of registration bylaws under Maharashtra Co-operative Societies Act 1960 or Multi-State Cooperative Act.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center font-black">
                2
              </div>
              <h4 className="text-sm font-black text-slate-900">NSDC Skill Profiling & KYC</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                All affiliated shramiks undergo skill profiling, trade certification (IS-732/NSDC Level-4), e-Shram UAN and Aadhaar KYC.
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="w-9 h-9 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                3
              </div>
              <h4 className="text-sm font-black text-slate-900">Tripartite Fair-Wage Accord</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Mandatory signing of the 80% statutory direct payout agreement, 6% welfare fund pooling, and zero platform commission cut.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI DEMAND FORECASTING & INTER-COOPERATIVE WORKFORCE BALANCING       */}
      {/* ========================================================================= */}
      {activeTab === 'AI_BALANCING' && (
        <div className="space-y-6">
          
          {/* AI Prediction & Inter-Cooperative Workforce Allocation Card */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-4 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-black tracking-tight">
                  AI Demand Prediction & Workforce Allocation Model
                </h3>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                Federation Algorithmic Balancing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs pt-1">
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Surge Area / Ward</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Pune (Kothrud & Baner)
                </span>
              </div>
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Trade in High Demand</span>
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  Electrician (Domestic & HVAC)
                </span>
              </div>
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Demand Tomorrow</span>
                <span className="text-base font-black text-amber-400">35 Jobs (+175% surge)</span>
              </div>
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Workers</span>
                <span className="text-base font-black text-emerald-400">
                  {isRebalanced ? '25 Workers (+5 Rebalanced)' : '20 Workers in Zone'}
                </span>
              </div>
            </div>

            {/* Warning & Interactive Rebalance Directive Action */}
            <div className={`p-4 sm:p-5 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
              isRebalanced 
                ? 'bg-emerald-500/15 border border-emerald-500/30' 
                : 'bg-amber-500/15 border border-amber-500/30'
            }`}>
              <div className="space-y-1">
                <p className={`font-extrabold flex items-center gap-2 ${isRebalanced ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isRebalanced ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>✓ Shortage Resolved: 10 Workers Remaining • 100% Demand Met</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>⚠ Shortage Alert: 15 Workers Deficit in Kothrud & Baner</span>
                    </>
                  )}
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {isRebalanced ? (
                    <span><strong>Directive Issued:</strong> 5 available certified electricians from Hadapsar & PCMC societies have been temporarily reassigned to Kothrud & Baner wards.</span>
                  ) : (
                    <span><strong>AI System Recommendation:</strong> "Issue inter-cooperative directive to rotate 5 available electricians from nearby Hadapsar & PCMC wards to avoid customer wait times."</span>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isRebalanced) {
                    setIsRebalanced(false);
                  } else {
                    handleAuthorizeRebalance('Kothrud & Baner', 'Electricians', 5);
                  }
                }}
                className={`px-5 py-2.5 rounded-xl font-black text-xs transition shadow-md whitespace-nowrap cursor-pointer shrink-0 ${
                  isRebalanced 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950' 
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                }`}
              >
                {isRebalanced ? '✓ Rebalanced (Click to Reset)' : 'Apply AI Recommendation ➔'}
              </button>
            </div>
          </div>

          {/* Recharts Ward Demand vs Available Graph */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Predicted Demand vs Available Workforce by Ward
                </h3>
                <p className="text-xs text-slate-500">
                  Green: Available Workers • Amber: Predicted Demand • Red: Shortfall / Deficit
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Demand
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Shortfall
                </span>
              </div>
            </div>

            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="available" name="Available Workers" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recommended" name="Predicted Demand" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shortfall" name="Shortfall" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inter-Cooperative Workforce Allocation Directives Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900">Inter-Cooperative Workforce Allocation Directives</h3>
                <p className="text-xs text-slate-500">Autonomous reallocation across member societies to guarantee fair earnings & prevent worker underutilization</p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                Federation Protocol
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3 px-3">Trade & Sector</th>
                    <th className="py-3 px-3">Surplus Origin Society</th>
                    <th className="py-3 px-3">Deficit Destination Ward</th>
                    <th className="py-3 px-3">Rebalance Volume</th>
                    <th className="py-3 px-3">Directive Status</th>
                    <th className="py-3 px-3 text-right">Federation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">Electrician (Domestic)</td>
                    <td className="py-3 px-3 text-slate-600">PCMC Industrial Labour Coop</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">Kothrud & Baner (Pune)</td>
                    <td className="py-3 px-3 font-bold text-amber-600">5 Shramiks</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isRebalanced 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isRebalanced ? 'DIRECTIVE_DEPLOYED' : 'PENDING_AUTHORIZATION'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleAuthorizeRebalance('Kothrud & Baner', 'Electricians', 5)}
                        className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs transition shadow-2xs cursor-pointer"
                      >
                        {isRebalanced ? 'Re-issue' : 'Authorize Directive'}
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">Plumber & Sanitation</td>
                    <td className="py-3 px-3 text-slate-600">Pune Shramik Plumbing Sanstha</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">Hinjewadi Tech Park Phase 1</td>
                    <td className="py-3 px-3 font-bold text-amber-600">3 Shramiks</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        SCHEDULED_TOMORROW
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleAuthorizeRebalance('Hinjewadi Tech Park', 'Plumbers', 3)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-900 font-bold text-xs transition border border-slate-200 cursor-pointer"
                      >
                        Adjust Crew
                      </button>
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-slate-900">Caregiver & Elderly Assistance</td>
                    <td className="py-3 px-3 text-slate-600">Sahyadri Multi-Trade Coop</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">Aundh & Model Colony</td>
                    <td className="py-3 px-3 font-bold text-emerald-600">2 Caregivers</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ACTIVE_SLA
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleAuthorizeRebalance('Aundh & Model Colony', 'Caregivers', 2)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-900 font-bold text-xs transition border border-slate-200 cursor-pointer"
                      >
                        Audit Deployment
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACCREDITED WORKFORCE & 80% STATUTORY FAIR-WAGE AUDIT               */}
      {/* ========================================================================= */}
      {activeTab === 'WORKFORCE_WAGE' && (
        <div className="space-y-6">
          
          {/* Trade Distribution Cards across 9 Problem Statement Trades */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Accredited Trade Distribution</h3>
                <p className="text-xs text-slate-500">Skilled labour across 9 household & community trades certified under NSDC / Skill India</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                1,250 Total Accredited Shramiks
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { name: 'Electricians', count: 320, code: 'IS-732' },
                { name: 'Plumbers', count: 245, code: 'UPC-I' },
                { name: 'Carpenters', count: 180, code: 'NSDC-L4' },
                { name: 'Painters', count: 150, code: 'ISO-12944' },
                { name: 'Domestic Helpers', count: 110, code: 'DWSSC' },
                { name: 'Caregivers', count: 85, code: 'HSSC' },
                { name: 'Drivers', count: 65, code: 'MV-REG' },
                { name: 'Cleaners', count: 55, code: 'C&FW' },
                { name: 'Technicians', count: 40, code: 'HVAC-R' }
              ].map((trade, i) => (
                <div key={i} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">{trade.code}</span>
                  <p className="text-sm font-black text-slate-900">{trade.name}</p>
                  <p className="text-xs text-purple-700 font-bold">{trade.count} Active</p>
                </div>
              ))}
            </div>
          </div>

          {/* 80% Statutory Fair-Wage Audit & Bylaw Split Editor */}
          <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Statutory Fair Wage Mandate
                </span>
                <h3 className="text-lg font-black tracking-tight mt-1.5">
                  80% Direct Worker Payout Audit vs Aggregator Exploitation
                </h3>
                <p className="text-xs text-purple-200/80 mt-1 max-w-2xl leading-relaxed">
                  Private gig aggregators deduct 25%–35% commission without social security. KaryaSetu legally binds 80% directly to the shramik, 6% to the pooled welfare vault, 10% to primary society operations, and 4% to platform DPI maintenance.
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="text-3xl font-black text-emerald-400">80.0%</span>
                <span className="block text-[10px] font-bold text-purple-300 uppercase">Statutory Shramik Share</span>
              </div>
            </div>

            {/* Visual Split Breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <span className="text-[10px] text-emerald-300 uppercase font-bold block">Worker Payout</span>
                <p className="text-xl font-black text-white">{workerShare}%</p>
                <span className="text-[10px] text-slate-300 block">Direct DBT bank transfer</span>
              </div>
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <span className="text-[10px] text-blue-300 uppercase font-bold block">Primary Society</span>
                <p className="text-xl font-black text-white">{coopShare}%</p>
                <span className="text-[10px] text-slate-300 block">Local society operations</span>
              </div>
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <span className="text-[10px] text-amber-300 uppercase font-bold block">Welfare Corpus</span>
                <p className="text-xl font-black text-white">{welfareShare}%</p>
                <span className="text-[10px] text-slate-300 block">PM-JAY & insurance pool</span>
              </div>
              <div className="bg-white/10 p-3.5 rounded-2xl border border-white/15 space-y-1">
                <span className="text-[10px] text-purple-300 uppercase font-bold block">Platform DPI</span>
                <p className="text-xl font-black text-white">{platformShare}%</p>
                <span className="text-[10px] text-slate-300 block">Hosting, GPS & dispatch</span>
              </div>
            </div>

            {/* Interactive Bylaw Split Configuration Form */}
            <form onSubmit={handleSaveSplit} className="bg-slate-900/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-purple-200">Adjust Statutory Bylaw Split for {currentCoop?.name}</h4>
                <span className="text-[10px] text-slate-400 font-mono">Total: {workerShare + coopShare + welfareShare + platformShare}%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-300 block mb-1">Worker Share (%)</label>
                  <input
                    type="number"
                    min="75"
                    max="90"
                    value={workerShare}
                    onChange={(e) => setWorkerShare(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-300 block mb-1">Cooperative Share (%)</label>
                  <input
                    type="number"
                    min="5"
                    max="15"
                    value={coopShare}
                    onChange={(e) => setCoopShare(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-300 block mb-1">Welfare Corpus (%)</label>
                  <input
                    type="number"
                    min="4"
                    max="10"
                    value={welfareShare}
                    onChange={(e) => setWelfareShare(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-300 block mb-1">Platform DPI (%)</label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={platformShare}
                    onChange={(e) => setPlatformShare(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-sm cursor-pointer"
                >
                  Save Statutory Split Bylaw
                </button>
              </div>
            </form>
          </div>

          {/* Member Worker Roster with Skill Verification */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Accredited Shramik Roster</h3>
                <p className="text-xs text-slate-500">Skill certifications, performance ratings, and verified digital skill badges</p>
              </div>
              <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                {workers.length} Registered in Zone
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3 px-3">Shramik Name</th>
                    <th className="py-3 px-3">Trade & Experience</th>
                    <th className="py-3 px-3">Cooperative Society</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Verified Skill Badges</th>
                    <th className="py-3 px-3 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map((w) => (
                    <tr key={w._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{w.name}</p>
                        <p className="text-[11px] text-slate-400">{w.phone}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{w.trade}</span>
                        <p className="text-[10px] text-slate-400">{w.experienceYears} yrs • {w.completedJobs} jobs</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-800">{w.cooperativeName}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-600">
                        {w.customerRating || 4.8} ⭐
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {w.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {w.verifiedSkills?.map((s, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200">
                              ✓ {s.name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setVerifyWorkerId(w._id)}
                          className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs transition border border-purple-300 cursor-pointer"
                        >
                          + Issue Skill Badge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: CENTRAL SOCIAL SECURITY & PM-JAY INSURANCE VAULT                   */}
      {/* ========================================================================= */}
      {activeTab === 'WELFARE_VAULT' && (
        <div className="space-y-6">
          
          {/* Top Welfare Corpus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white p-6 rounded-3xl shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-100">Federation Pooled Corpus</span>
                <Landmark className="w-5 h-5 text-amber-200" />
              </div>
              <p className="text-3xl font-black">₹{(totalWelfareFund || 482500).toLocaleString('en-IN')}</p>
              <p className="text-xs text-amber-100 font-medium">Accumulated from 6% statutory split across 8,420 bookings</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-black uppercase tracking-wider">PM-JAY Health Coverage</span>
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">1,250 Shramiks</p>
              <p className="text-xs text-emerald-700 font-semibold">100% Active Ayushman Bharat Cards (₹5L Cover)</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-black uppercase tracking-wider">PMSBY Accidental Insurance</span>
                <HeartHandshake className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-black text-slate-900">₹2,00,000 / Worker</p>
              <p className="text-xs text-blue-700 font-semibold">Group Accidental & Disability Insurance Enrolled</p>
            </div>
          </div>

          {/* Social Security Benefits & Schemes Banner */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Worker Welfare & Social Security Programs</h3>
                <p className="text-xs text-slate-500">Integration with Government of India and Maharashtra Labour Welfare Board Schemes</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDisburseModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-xs transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <HeartHandshake className="w-4 h-4" />
                <span>+ Disburse Welfare Benefit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block">
                  Ayushman Bharat
                </span>
                <h4 className="text-sm font-black text-slate-900">PM-JAY Health Cover</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Cashless secondary & tertiary hospital treatment up to ₹5,00,000 per family per year across empaneled hospitals.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full inline-block">
                  Pradhan Mantri
                </span>
                <h4 className="text-sm font-black text-slate-900">PMSBY Accidental Cover</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Accidental death and full disability cover of ₹2,00,000 with zero deduction from worker pocket.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full inline-block">
                  e-Shram Portal
                </span>
                <h4 className="text-sm font-black text-slate-900">National Unorganized Registry</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  12-digit UAN linked to Aadhaar for Direct Benefit Transfer (DBT) and central social safety nets.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full inline-block">
                  Federation Corpus
                </span>
                <h4 className="text-sm font-black text-slate-900">Tool & Equipment Subsidy</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  50% matching grant for NSDC-certified electrical & plumbing safety gear, drills, and multi-meters.
                </p>
              </div>
            </div>
          </div>

          {/* Central Welfare Claims Disbursement Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Welfare Claims Disbursement Ledger</h3>
                <p className="text-xs text-slate-500">Audit trail of financial relief, medical claims, and educational grants paid out to shramiks</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                ₹1,42,000 Disbursed to Date
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3 px-3">Claim ID & Date</th>
                    <th className="py-3 px-3">Beneficiary Shramik</th>
                    <th className="py-3 px-3">Cooperative Society</th>
                    <th className="py-3 px-3">Benefit Type</th>
                    <th className="py-3 px-3">Disbursed Amount</th>
                    <th className="py-3 px-3">Disbursement Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {welfareLedger.map((claim) => (
                    <tr key={claim._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <p className="font-mono font-bold text-slate-900">{claim._id.slice(-8).toUpperCase()}</p>
                        <p className="text-[10px] text-slate-400">{new Date(claim.date).toLocaleDateString('en-IN')}</p>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {claim.workerName}
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        {claim.cooperativeName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">{claim.title}</span>
                        <span className="text-[10px] text-slate-400">{claim.type}</span>
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-700">
                        ₹{claim.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: OPERATIONS, CONSUMER TRUST & TRIPARTITE DISPUTE ARBITRATION        */}
      {/* ========================================================================= */}
      {activeTab === 'OPERATIONS_TRUST' && (
        <div className="space-y-6">
          
          {/* Operational Metrics & Consumer Trust Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Real-Time Bookings</span>
              <p className="text-3xl font-black text-slate-900">{bookings.length || 156} Active</p>
              <p className="text-xs text-purple-700 font-semibold">Household, SOS & Housing SLAs</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Emergency SOS Turnaround</span>
              <p className="text-3xl font-black text-indigo-700">~14 Mins</p>
              <p className="text-xs text-indigo-700 font-semibold">Geo-matched nearby shramik dispatch</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Consumer Trust Index</span>
              <p className="text-3xl font-black text-emerald-700">4.8 / 5.0 ⭐</p>
              <p className="text-xs text-emerald-700 font-semibold">Based on 8,420 citizen reviews</p>
            </div>
          </div>

          {/* Institutional SLAs & Housing Societies Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Institutional & Housing Society SLAs</h3>
                <p className="text-xs text-slate-500">Bulk maintenance contracts guaranteeing steady round-the-year wages for cooperative shramiks</p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {contracts.length} Active Housing Societies
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3 px-3">Housing Society / Institution</th>
                    <th className="py-3 px-3">Assigned Cooperative</th>
                    <th className="py-3 px-3">Trades & Scope</th>
                    <th className="py-3 px-3">Assigned Shramiks</th>
                    <th className="py-3 px-3">Monthly Value</th>
                    <th className="py-3 px-3">Contract Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contracts.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{c.clientName}</p>
                        <p className="text-[10px] text-slate-400">{c.address}</p>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-800">
                        {c.cooperativeName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 block">{c.contractTitle}</span>
                        <span className="text-[10px] text-slate-400">{c.durationMonths} Months Duration</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-purple-900">
                        {c.allocatedWorkers?.length || 4} Shramiks
                      </td>
                      <td className="py-3 px-3 font-black text-emerald-700">
                        ₹{c.monthlyValue.toLocaleString('en-IN')}/mo
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tripartite Grievance & Dispute Arbitration Queue */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Tripartite Grievance & Dispute Arbitration Queue</h3>
                <p className="text-xs text-slate-500">Federation mediation between Consumer, Worker, and Society ensuring swift resolution and consumer trust</p>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {disputes.filter(d => d.status !== 'RESOLVED').length} Unresolved Disputes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                  <tr>
                    <th className="py-3 px-3">Dispute ID</th>
                    <th className="py-3 px-3">Customer & Shramik</th>
                    <th className="py-3 px-3">Issue Description</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Arbitration Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disputes.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        {d._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{d.customerName}</p>
                        <p className="text-[11px] text-slate-500">Shramik: {d.workerName}</p>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-semibold text-slate-800">{d.description}</p>
                        {d.resolution && (
                          <p className="text-[10px] text-emerald-600 mt-0.5">RULING: {d.resolution}</p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        {d.status !== 'RESOLVED' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDispute(d);
                              setResolutionInput('Cooperative Technical Arbitrator verified the site, arranged free warranty repair, and issued a ₹200 voucher.');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs transition shadow-2xs cursor-pointer"
                          >
                            Arbitrate & Resolve
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">Closed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VERIFY WORKER SKILL BADGE                                          */}
      {/* ========================================================================= */}
      {verifyWorkerId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Issue Verified Skill Badge</h3>
              <button 
                type="button" 
                onClick={() => setVerifyWorkerId(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSkillVerification} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Certification Standard / Badge Name</label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                  placeholder="e.g. NSDC Level-4 Electrician (IS-732)"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Accrediting Authority / Issuer</label>
                <input
                  type="text"
                  value={newSkillIssuer}
                  onChange={(e) => setNewSkillIssuer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyWorkerId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-xs shadow-xs"
                >
                  Issue Certified Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DISBURSE WELFARE BENEFIT                                            */}
      {/* ========================================================================= */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Sanction Welfare Disbursement</h3>
              <button 
                type="button" 
                onClick={() => setShowDisburseModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleDisburseBenefit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Select Beneficiary Shramik</label>
                <select
                  value={disburseWorkerId}
                  onChange={(e) => setDisburseWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                >
                  {workers.map(w => (
                    <option key={w._id} value={w._id}>{w.name} ({w.trade} - {w.cooperativeName})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Scheme Category</label>
                <select
                  value={disburseType}
                  onChange={(e) => setDisburseType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                >
                  <option value="EMERGENCY_MEDICAL_AID">Emergency Medical Aid (PM-JAY Pool)</option>
                  <option value="ACCIDENTAL_RELIEF">Accidental Disability Relief (PMSBY)</option>
                  <option value="TOOL_EQUIPMENT_SUBSIDY">Tool & Safety Kit Subsidy (50% Grant)</option>
                  <option value="PENSION_CREDIT">Social Security Pension Credit Tier</option>
                </select>
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Grant / Reimbursement Amount (₹)</label>
                <input
                  type="number"
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-600 font-bold block mb-1">Sanction Order Description</label>
                <textarea
                  rows={2}
                  value={disburseDesc}
                  onChange={(e) => setDisburseDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-xs"
                >
                  Confirm & Disburse Funds
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ARBITRATE & RESOLVE DISPUTE                                        */}
      {/* ========================================================================= */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Arbitrate Consumer Grievance</h3>
              <button 
                type="button" 
                onClick={() => setSelectedDispute(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <p className="text-slate-500">Citizen: <strong className="text-slate-900">{selectedDispute.customerName}</strong></p>
              <p className="text-slate-500">Assigned Shramik: <strong className="text-slate-900">{selectedDispute.workerName}</strong></p>
              <p className="text-rose-600 font-bold mt-1">Issue: {selectedDispute.description}</p>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-700 font-bold block">Arbitration Order & Remedial Action</label>
              <textarea
                rows={3}
                value={resolutionInput}
                onChange={(e) => setResolutionInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-400"
                placeholder="Enter official resolution decision..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolving}
                onClick={() => handleConfirmResolve(selectedDispute._id)}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-xs shadow-xs"
              >
                {isResolving ? 'Recording Ruling...' : 'Issue Arbitration Ruling'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
