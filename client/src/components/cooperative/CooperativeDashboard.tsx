import React, { useState } from 'react';
import { Cooperative, Worker, InstitutionalContract, DemandForecast, WelfareClaim, Dispute } from '../../types';
import { 
  Building2, Users, TrendingUp, ShieldCheck, Award, Briefcase, 
  AlertTriangle, CheckCircle2, ChevronRight, Sliders, RefreshCw, 
  BarChart2, AlertCircle, FileCheck, ArrowUpRight, Check, HardHat, HeartHandshake
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

interface CooperativeDashboardProps {
  cooperatives: Cooperative[];
  selectedCoopId: string;
  onSelectCoop: (id: string) => void;
  workers: Worker[];
  contracts: InstitutionalContract[];
  forecasts: DemandForecast[];
  welfareLedger: WelfareClaim[];
  disputes: Dispute[];
  onVerifySkill: (workerId: string, skillName: string, issuer: string) => Promise<void>;
  onUpdateSplit: (coopId: string, split: any) => Promise<void>;
  onDisburseWelfare: (claimData: any) => Promise<void>;
  onResolveDispute: (disputeId: string, resolution: string) => Promise<void>;
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
  onVerifySkill,
  onUpdateSplit,
  onDisburseWelfare,
  onResolveDispute
}) => {
  const currentCoop = cooperatives.find(c => c._id === selectedCoopId) || cooperatives[0];
  const [activeTab, setActiveTab] = useState<'AI_ALLOCATION' | 'WORKERS' | 'CONTRACTS' | 'WELFARE' | 'COMPLAINTS' | 'SPLIT'>('AI_ALLOCATION');
  const [isRebalanced, setIsRebalanced] = useState(false);

  const [verifyWorkerId, setVerifyWorkerId] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState('High-Voltage Safety Certified (IS-732)');
  const [newSkillIssuer, setNewSkillIssuer] = useState(currentCoop?.name || 'Cooperative Board');

  const [resolveDisputeId, setResolveDisputeId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('Cooperative Technical Inspector verified the site and provided complimentary warranty rectification.');

  // Welfare Disbursement State
  const [showDisburseModal, setShowDisburseModal] = useState(false);
  const [disburseWorkerId, setDisburseWorkerId] = useState('');
  const [disburseTitle, setDisburseTitle] = useState('PM-JAY Outpatient Medical Reimbursement');
  const [disburseType, setDisburseType] = useState('EMERGENCY_MEDICAL_AID');
  const [disburseAmount, setDisburseAmount] = useState(1500);
  const [disburseDesc, setDisburseDesc] = useState('Approved by Cooperative Welfare Committee for prescription and diagnosis coverage.');

  const [workerShare, setWorkerShare] = useState(currentCoop?.splitConfig?.workerShare || 80);
  const [coopShare, setCoopShare] = useState(currentCoop?.splitConfig?.coopShare || 10);
  const [welfareShare, setWelfareShare] = useState(currentCoop?.splitConfig?.welfareShare || 6);
  const [platformShare, setPlatformShare] = useState(currentCoop?.splitConfig?.platformShare || 4);

  const coopWorkers = workers.filter(w => w.cooperativeId === currentCoop?._id);
  const coopContracts = contracts.filter(c => c.cooperativeId === currentCoop?._id);
  const coopWelfare = welfareLedger.filter(w => w.cooperativeName === currentCoop?.name || w.cooperativeName?.includes(currentCoop?.shortName || ''));
  const coopDisputes = disputes.filter(d => d.cooperativeId === currentCoop?._id || !d.cooperativeId);

  const forecastChartData = forecasts.map(f => ({
    name: f.locality.split('&')[0].trim(),
    current: f.currentAvailableInZone,
    recommended: f.recommendedWorkforceAllocation,
    shortfall: f.shortfall,
    trade: f.trade
  }));

  const handleSaveSplit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (workerShare + coopShare + welfareShare + platformShare !== 100) {
      alert('Total percentage shares must sum up to exactly 100%');
      return;
    }
    await onUpdateSplit(currentCoop._id, {
      workerShare,
      coopShare,
      welfareShare,
      platformShare
    });
    alert('Cooperative Bylaw Split updated successfully!');
  };

  const handleSkillVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyWorkerId) return;
    await onVerifySkill(verifyWorkerId, newSkillName, newSkillIssuer);
    setVerifyWorkerId(null);
    alert('Worker skill verified and badge issued on cooperative record!');
  };

  const handleResolveDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveDisputeId) return;
    await onResolveDispute(resolveDisputeId, resolutionText);
    setResolveDisputeId(null);
    alert('Dispute resolved by Cooperative Committee!');
  };

  const handleDisburseBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetWorker = coopWorkers.find(w => w._id === disburseWorkerId) || coopWorkers[0];
    await onDisburseWelfare({
      workerId: targetWorker?._id || 'wrk_101',
      workerName: targetWorker?.name || 'Santosh Baburao Kadam',
      cooperativeName: currentCoop.name,
      type: disburseType,
      title: disburseTitle,
      amount: Number(disburseAmount),
      description: disburseDesc
    });
    setShowDisburseModal(false);
    alert(`Welfare benefit of ₹${disburseAmount} successfully disbursed to ${targetWorker?.name || 'Worker'}!`);
  };

  if (!currentCoop) return null;

  return (
    <div className="space-y-6 pb-20 font-sans max-w-[1280px] mx-auto">
      
      {/* 1. Header with Cooperative Switcher */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              Cooperative Admin Dashboard
            </span>
            <span className="text-xs text-slate-400 font-mono">Reg: {currentCoop.regNumber}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {currentCoop.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            District: <strong className="text-slate-800">{currentCoop.district}</strong> • President: <strong className="text-slate-800">{currentCoop.contact?.president || 'Suresh Patil'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase whitespace-nowrap">Switch Cooperative:</span>
          <select
            value={currentCoop._id}
            onChange={(e) => onSelectCoop(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            {cooperatives.map(c => (
              <option key={c._id} value={c._id}>
                {c.shortName} ({c.district})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top Summary KPI Stats (Exact numbers specified in prompt) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        <div 
          onClick={() => setActiveTab('WORKERS')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-slate-400 shadow-sm cursor-pointer transition"
          title="Click to view Member Worker Roster"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Workers</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">1,250</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">100% Verified</span>
        </div>

        <div 
          onClick={() => setActiveTab('CONTRACTS')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-slate-400 shadow-sm cursor-pointer transition"
          title="Click to view Housing Society Contracts"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customers</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">4,820</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Pune Region</span>
        </div>

        <div 
          onClick={() => setActiveTab('CONTRACTS')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-amber-400 shadow-sm cursor-pointer transition"
          title="Click to view Active Bookings"
        >
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Active Bookings</span>
          <p className="text-2xl font-black text-amber-600 mt-0.5">156</p>
          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">In Progress</span>
        </div>

        <div 
          onClick={() => setActiveTab('AI_ALLOCATION')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-slate-400 shadow-sm cursor-pointer transition"
          title="Click to view AI Demand & Fulfillment"
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed Jobs</span>
          <p className="text-2xl font-black text-slate-900 mt-0.5">8,420</p>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">99.4% Fulfillment</span>
        </div>

        <div 
          onClick={() => setActiveTab('SPLIT')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-400 shadow-sm col-span-2 lg:col-span-1 cursor-pointer transition"
          title="Click to view Fair-Pay Split Bylaws"
        >
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Total Earnings</span>
          <p className="text-2xl font-black text-emerald-700 mt-0.5">₹18,45,000</p>
          <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">80% to Workers</span>
        </div>

      </div>

      {/* 3. Minimal Segmented Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-bold overflow-x-auto">
        {[
          { key: 'AI_ALLOCATION', label: '🤖 AI Demand & Workforce Allocation' },
          { key: 'WORKERS', label: '👷 Worker Approval & Roster', count: coopWorkers.length },
          { key: 'CONTRACTS', label: '🏢 Housing Society SLAs', count: coopContracts.length },
          { key: 'WELFARE', label: '🛡️ Welfare & Insurance Pool' },
          { key: 'COMPLAINTS', label: '⚖️ Complaints & Mediation', count: coopDisputes.length },
          { key: 'SPLIT', label: '⚙️ Fair-Pay Split Bylaws' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`pb-3 px-1 transition flex items-center gap-1.5 border-b-2 whitespace-nowrap ${
              activeTab === t.key
                ? 'border-slate-900 text-slate-900 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <span>{t.label}</span>
            {t.count !== undefined && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: AI DEMAND FORECASTING & WORKFORCE ALLOCATION (As Specified in Prompt) */}
      {activeTab === 'AI_ALLOCATION' && (
        <div className="space-y-6">
          
          {/* Exact AI Prediction Card from Prompt */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <h3 className="text-base font-black tracking-tight">
                  AI Prediction & Workforce Allocation
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Predictive Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Area</span>
                <span className="text-sm font-bold text-white">Pune (Kothrud & Baner)</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Service</span>
                <span className="text-sm font-bold text-white">Electrician</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected Demand Tomorrow</span>
                <span className="text-sm font-black text-amber-400">35 Jobs</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Available Workers</span>
                <span className="text-sm font-black text-emerald-400">
                  {isRebalanced ? '25 Workers (+5 Rebalanced)' : '20 Workers'}
                </span>
              </div>
            </div>

            {/* Warning & Action Recommendation from Prompt */}
            <div className={`p-4 rounded-2xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
              isRebalanced 
                ? 'bg-emerald-500/15 border border-emerald-500/30' 
                : 'bg-amber-500/10 border border-amber-500/20'
            }`}>
              <div className="space-y-1">
                <p className={`font-extrabold flex items-center gap-1.5 ${isRebalanced ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {isRebalanced ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>✓ Shortage Resolved: 10 Workers Remaining</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>⚠ Shortage Alert: 15 Workers</span>
                    </>
                  )}
                </p>
                <p className="text-slate-300">
                  {isRebalanced ? (
                    <span><strong>Action Executed:</strong> 5 available electricians from Hadapsar & PCMC wards have been pre-positioned to Kothrud & Baner.</span>
                  ) : (
                    <span><strong>AI System Recommendation:</strong> "Move/assign 5 available electricians from nearby Hadapsar & PCMC wards."</span>
                  )}
                </p>
              </div>

              <button
                onClick={() => setIsRebalanced(!isRebalanced)}
                className={`px-4 py-2 rounded-xl font-black text-xs transition shadow-sm whitespace-nowrap cursor-pointer ${
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
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Predicted Demand vs Available Workers by Pune Ward
              </h3>
              <p className="text-xs text-slate-500">
                Green: Available Workers • Amber: AI Recommended Allocation • Red: Predicted Shortfall
              </p>
            </div>

            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="current" name="Available Workers" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="recommended" name="Predicted Demand" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shortfall" name="Shortfall" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: WORKER APPROVAL & ROSTER */}
      {activeTab === 'WORKERS' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Member Worker Roster</h3>
              <p className="text-xs text-slate-500">Approve workers, verify skills/certificates, and monitor availability</p>
            </div>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {coopWorkers.length} Active Members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase">
                <tr>
                  <th className="py-3 px-3">Worker Name</th>
                  <th className="py-3 px-3">Trade & Exp</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Verified Skills</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coopWorkers.map((w) => (
                  <tr key={w._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{w.name}</p>
                      <p className="text-[11px] text-slate-400">{w.phone}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-800">{w.trade}</span>
                      <p className="text-[10px] text-slate-400">{w.experienceYears} yrs experience</p>
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
                        {w.verifiedSkills?.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            ✓ {s.name.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setVerifyWorkerId(w._id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-700 text-white font-bold text-[11px] transition"
                      >
                        + Certify Skill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: HOUSING SOCIETY SLAS */}
      {activeTab === 'CONTRACTS' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Housing Society & Institutional Contracts</h3>
            <p className="text-xs text-slate-500">Recurring maintenance retainers for apartments, schools, and hospitals</p>
          </div>

          <div className="space-y-3">
            {coopContracts.map((c) => (
              <div key={c._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {c.clientType}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-1">{c.clientName}</h4>
                  <p className="text-slate-500">{c.contractTitle} • {c.address}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-base font-black text-slate-900">₹{c.monthlyValue.toLocaleString('en-IN')}/mo</span>
                  <span className="text-[10px] font-bold text-emerald-600 block">SLA: {c.slaCompliance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WELFARE & INSURANCE MANAGEMENT */}
      {activeTab === 'WELFARE' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Worker Welfare & Insurance Management</h3>
              <p className="text-xs text-slate-500">6% client fee auto-allocated into healthcare, PM-JAY top-ups, and accidental insurance</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Welfare Fund Reserve</span>
                <span className="text-2xl font-black text-amber-600">₹{currentCoop.welfareFundBalance.toLocaleString('en-IN')}</span>
              </div>
              <button
                onClick={() => setShowDisburseModal(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer whitespace-nowrap"
              >
                <HeartHandshake className="w-4 h-4 text-emerald-400" />
                <span>+ Disburse Benefit / Insurance</span>
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {coopWelfare.map((w) => (
              <div key={w._id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{w.title}</p>
                  <p className="text-slate-500 text-[11px]">{w.description}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Recipient: {w.workerName} • Date: {w.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-amber-700">₹{w.amount.toLocaleString('en-IN')}</span>
                  <span className="block text-[10px] font-bold text-emerald-700">DISBURSED ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMPLAINTS & MEDIATION */}
      {activeTab === 'COMPLAINTS' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Manage Complaints & Disputes</h3>
              <p className="text-xs text-slate-500">Tripartite mediation: Customer + Cooperative Officer + Peer Worker</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
              {coopDisputes.filter(d => d.status !== 'RESOLVED').length} Active
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {coopDisputes.map((d) => (
              <div key={d._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      d.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {d.status}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">Issue: {d.issueType?.replace(/_/g, ' ')}</h4>
                    <p className="text-[11px] text-slate-500">Customer: {d.customerName} • Ref: #{d.bookingId}</p>
                  </div>
                  {d.status !== 'RESOLVED' && (
                    <button
                      onClick={() => setResolveDisputeId(d._id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
                    >
                      Resolve ➔
                    </button>
                  )}
                </div>
                <p className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700">
                  "{d.description}"
                </p>
                {d.resolution && (
                  <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <strong>Resolution:</strong> {d.resolution}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FAIR-PAY BYLAW SPLIT SLIDERS */}
      {activeTab === 'SPLIT' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm max-w-xl space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">Configure Fair-Pay Bylaw Split</h3>
            <p className="text-xs text-slate-500">Democratic member assembly sets the allocation of customer fees</p>
          </div>

          <form onSubmit={handleSaveSplit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span>Worker Take-Home (Fair Wage):</span>
                <span className="text-emerald-700 font-black">{workerShare}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={90}
                value={workerShare}
                onChange={(e) => setWorkerShare(Number(e.target.value))}
                className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span>Cooperative Tool Depot & Branch:</span>
                <span className="text-blue-700 font-black">{coopShare}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                value={coopShare}
                onChange={(e) => setCoopShare(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span>Worker Social Security & Healthcare:</span>
                <span className="text-amber-700 font-black">{welfareShare}%</span>
              </div>
              <input
                type="range"
                min={2}
                max={15}
                value={welfareShare}
                onChange={(e) => setWelfareShare(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-bold text-xs">
                <span>Platform Cloud Infrastructure:</span>
                <span className="text-slate-700 font-black">{platformShare}%</span>
              </div>
              <input
                type="range"
                min={2}
                max={10}
                value={platformShare}
                onChange={(e) => setPlatformShare(Number(e.target.value))}
                className="w-full accent-slate-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-bold">
              Total: {workerShare + coopShare + welfareShare + platformShare}% (Must sum to 100%)
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              Update Cooperative Bylaws
            </button>
          </form>
        </div>
      )}

      {/* Disburse Welfare Benefit & Insurance Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Disburse Welfare / Insurance</h3>
              </div>
              <button 
                onClick={() => setShowDisburseModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Available Cooperative Reserve</span>
              <span className="text-lg font-black text-amber-950">₹{currentCoop.welfareFundBalance.toLocaleString('en-IN')}</span>
            </div>

            <form onSubmit={handleDisburseBenefit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Beneficiary Worker</label>
                <select
                  value={disburseWorkerId}
                  onChange={(e) => setDisburseWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                  required
                >
                  <option value="">Select Worker Member...</option>
                  {coopWorkers.map(w => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.trade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Welfare Benefit Type</label>
                <select
                  value={disburseType}
                  onChange={(e) => setDisburseType(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="HEALTH_INSURANCE_REIMBURSEMENT">PM-JAY Health & Medical Reimbursement</option>
                  <option value="ACCIDENT_INSURANCE_PREMIUM">Accidental & Height Insurance Premium (₹5L)</option>
                  <option value="EQUIPMENT_GRANT">Tool & Mechanized Equipment Subsidy</option>
                  <option value="FAMILY_SUPPORT">Maternity & Family Healthcare Grant</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Benefit Purpose Title</label>
                <input
                  type="text"
                  value={disburseTitle}
                  onChange={(e) => setDisburseTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Amount to Disburse (₹)</label>
                <input
                  type="number"
                  min={100}
                  max={currentCoop.welfareFundBalance || 50000}
                  value={disburseAmount}
                  onChange={(e) => setDisburseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Approval Notes / Committee Resolution</label>
                <textarea
                  value={disburseDesc}
                  onChange={(e) => setDisburseDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2 border rounded-xl"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
                >
                  Confirm Disbursement ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verify Skill Modal */}
      {verifyWorkerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-black text-slate-900">Certify Worker Skill Badge</h3>
            <form onSubmit={handleSkillVerification} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Certification Title</label>
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">Issuing Authority</label>
                <input
                  type="text"
                  value={newSkillIssuer}
                  onChange={(e) => setNewSkillIssuer(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVerifyWorkerId(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded-xl text-slate-600 font-bold"
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >Issue Badge</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Dispute Modal */}
      {resolveDisputeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <h3 className="text-base font-black text-slate-900">Resolve Complaint</h3>
            <form onSubmit={handleResolveDispute} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Arbitration Resolution</label>
                <textarea
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolveDisputeId(null)}
                  className="px-3 py-1.5 bg-slate-100 rounded-xl text-slate-600 font-bold"
                >Cancel</button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                >Close Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disburse Welfare Benefit Modal */}
      {showDisburseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Disburse Welfare Benefit</h3>
                  <p className="text-[11px] text-slate-500">Funded from 6% statutory social security pool</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDisburseModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm px-2"
              >✕</button>
            </div>

            <form onSubmit={handleDisburseBenefit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Beneficiary Shramik</label>
                <select
                  value={disburseWorkerId || (coopWorkers[0]?._id || '')}
                  onChange={(e) => setDisburseWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold focus:bg-white text-xs"
                  required
                >
                  {coopWorkers.map(w => (
                    <option key={w._id} value={w._id}>
                      {w.name} ({w.trade}) — UAN: {w.welfareDetails?.eShramUAN || 'e-Shram Verified'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Benefit Category</label>
                  <select
                    value={disburseType}
                    onChange={(e) => setDisburseType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold focus:bg-white text-xs"
                    required
                  >
                    <option value="EMERGENCY_MEDICAL_AID">Medical Aid (PM-JAY Support)</option>
                    <option value="ACCIDENT_INSURANCE_PREMIUM">PMSBY Accident Premium</option>
                    <option value="CHILD_EDUCATION_SCHOLARSHIP">Child Education Scholarship</option>
                    <option value="PREVENTIVE_HEALTH_CAMP">Annual Health Camp Voucher</option>
                    <option value="UP_SKILLING_GRANT">NSDC Skill Upgrade Grant</option>
                    <option value="TOOL_SUBSIDY">Depot Safety Tool Subsidy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Grant Amount (₹)</label>
                  <input
                    type="number"
                    min={500}
                    max={25000}
                    step={100}
                    value={disburseAmount}
                    onChange={(e) => setDisburseAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-black focus:bg-white text-xs text-emerald-800"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Grant Title</label>
                <input
                  type="text"
                  value={disburseTitle}
                  onChange={(e) => setDisburseTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 font-semibold focus:bg-white text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 uppercase text-[10px]">Committee Resolution & Notes</label>
                <textarea
                  value={disburseDesc}
                  onChange={(e) => setDisburseDesc(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 font-semibold focus:bg-white text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDisburseModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold"
                >Cancel</button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-emerald-700 text-white font-black rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Disburse ₹{disburseAmount.toLocaleString('en-IN')} ➔</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
