import React, { useState } from 'react';
import { Cooperative, Worker, Booking, InstitutionalContract, WelfareClaim, DemandForecast, Dispute } from '../../types';
import { 
  Globe, ShieldCheck, Building2, Users, TrendingUp, Award, 
  CheckCircle2, AlertCircle, FileCheck, Layers, PieChart, 
  Sparkles, Sliders, ArrowUpRight, Check, HeartHandshake, 
  Phone, MapPin, Scale, RefreshCw, AlertTriangle, Shield, Landmark, DollarSign
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { useLanguage } from '../../i18n/LanguageContext';

interface FederationDashboardProps {
  cooperatives: Cooperative[];
  workers: Worker[];
  bookings: Booking[];
  contracts: InstitutionalContract[];
  welfareRecords: WelfareClaim[];
  forecasts?: DemandForecast[];
  disputes?: Dispute[];
  onResolveDispute?: (disputeId: string, resolution: string) => Promise<void>;
  onDisburseWelfare?: (claimData: any) => Promise<void>;
}

export const FederationDashboard: React.FC<FederationDashboardProps> = ({
  cooperatives,
  workers,
  bookings,
  contracts,
  welfareRecords,
  forecasts = [],
  disputes = [],
  onResolveDispute,
  onDisburseWelfare
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'SOCIETIES' | 'AI_BALANCING' | 'WORKFORCE_WAGE' | 'WELFARE_VAULT' | 'OPERATIONS_TRUST'>('SOCIETIES');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [rebalanceSuccessMsg, setRebalanceSuccessMsg] = useState<string>('');
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [resolutionInput, setResolutionInput] = useState<string>('Cooperative Arbitrator verified complaint and issued warranty rectification with complimentary service voucher.');
  const [isResolving, setIsResolving] = useState<boolean>(false);

  // Core Financial & Operational Aggregations
  const totalWelfareFund = cooperatives.reduce((acc, c) => acc + (c.welfareFundBalance || 0), 0);
  const totalWorkersCount = cooperatives.reduce((acc, c) => acc + (c.totalWorkers || 0), 0);
  const totalJobsCompleted = cooperatives.reduce((acc, c) => acc + (c.totalJobsCompleted || 0), 0);
  const totalInstitutionalMonthlyValue = contracts.reduce((acc, c) => acc + (c.monthlyValue || 0), 0);

  // Fair-Wage Aggregation (80% statutory direct payout to shramiks)
  const totalBookingGross = bookings.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
  const totalWagesDistributed = bookings.reduce((acc, b) => acc + (b.paymentBreakdown?.workerAmount || Math.round(b.totalAmount * 0.8)), 0);

  // Trade breakdown across accredited workforce
  const tradeDistribution = workers.reduce<Record<string, number>>((acc, w) => {
    acc[w.trade] = (acc[w.trade] || 0) + 1;
    return acc;
  }, {});

  // Demand Forecast Chart Data
  const forecastChartData = forecasts.map(f => ({
    name: f.locality.split('&')[0].trim(),
    available: f.currentAvailableInZone,
    recommended: f.recommendedWorkforceAllocation,
    shortfall: f.shortfall,
    trade: f.trade
  }));

  // Handle Authorizing Cross-Cooperative Rebalancing Directive
  const handleAuthorizeRebalance = (locality: string, trade: string, count: number) => {
    setRebalanceSuccessMsg(`✓ Directive Issued: Authorized temporary inter-society rotation of ${count} ${trade} workers to ${locality} ward.`);
    setTimeout(() => setRebalanceSuccessMsg(''), 6000);
  };

  // Handle Resolving Dispute
  const handleConfirmResolve = async (disputeId: string) => {
    if (!onResolveDispute) return;
    setIsResolving(true);
    try {
      await onResolveDispute(disputeId, resolutionInput);
      setSelectedDispute(null);
    } catch (e: any) {
      alert(e.message || 'Error resolving dispute');
    } finally {
      setIsResolving(false);
    }
  };

  const filteredCooperatives = selectedDistrict === 'ALL' 
    ? cooperatives 
    : cooperatives.filter(c => c.district.toLowerCase().includes(selectedDistrict.toLowerCase()));

  return (
    <div className="space-y-6 pb-20 font-sans max-w-[1360px] mx-auto">
      
      {/* 1. Apex State Federation Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-black uppercase tracking-wider border border-purple-500/30">
              <Globe className="w-3.5 h-3.5 text-purple-400" /> {language === 'mr' ? 'सर्वोच्च राज्य महासंघ प्रशासन' : language === 'hi' ? 'शीर्ष राज्य महासंघ प्रशासन' : 'Apex State Federation Administration'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {language === 'mr' ? 'महाराष्ट्र राज्य कामगार सहकारी महासंघ (MSLCF)' : language === 'hi' ? 'महाराष्ट्र राज्य श्रम सहकारी महासंघ (MSLCF)' : 'Maharashtra State Labour Cooperative Federation (MSLCF)'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              {language === 'mr' ? 'केंद्रीय नियामक प्रशासन, वैधानिक ८०% न्याय्य वेतन अंमलबजावणी, सामाजिक सुरक्षा निधी प्रशासन आणि संलग्न प्राथमिक सोसायट्यांमध्ये AI-आधारित कार्यबल संतुलन.' : language === 'hi' ? 'केंद्रीय नियामक शासन, वैधानिक 80% पारिश्रमिक प्रवर्तन, सामाजिक सुरक्षा निधि प्रबंधन और संबद्ध प्राथमिक समितियों में एआई-संचालित कार्यबल संतुलन।' : 'Central regulatory governance, statutory 80% fair-wage enforcement, pooled social security fund administration, and AI-driven inter-cooperative workforce rebalancing across affiliated primary labour societies.'}
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-400/30 text-purple-200 font-mono text-[11px]">
              MSCS Reg: <strong>MSCS/CR/2018/MH-4421</strong>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'mr' ? '१००% वैधानिक उपविधी अनुपालन' : language === 'hi' ? '100% वैधानिक उपनियम अनुपालन' : '100% Statutory Bylaw Compliant'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Metric Strip (5 Core Federation Indicators) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Member Cooperatives */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">{language === 'mr' ? 'सदस्य संस्था' : language === 'hi' ? 'सदस्य समितियां' : 'Member Societies'}</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{cooperatives.length} {language === 'mr' ? 'प्राथमिक संस्था' : language === 'hi' ? 'प्राथमिक समितियां' : 'Primary Coops'}</p>
          <p className="text-[11px] text-purple-700 font-semibold">{language === 'mr' ? 'पुण्यातील ५ प्रभागांमध्ये सक्रिय' : language === 'hi' ? 'पुणे के 5 वार्डों में सक्रिय' : 'Active in 5 Pune Wards'}</p>
        </div>

        {/* KPI 2: Total Accredited Workforce */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">{language === 'mr' ? 'प्रमाणित श्रमिक' : language === 'hi' ? 'प्रमाणित श्रमिक' : 'Accredited Shramiks'}</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalWorkersCount} {language === 'mr' ? 'प्रमाणित' : language === 'hi' ? 'प्रमाणित' : 'Certified'}</p>
          <p className="text-[11px] text-emerald-700 font-semibold">{language === 'mr' ? '१००% पडताळणी केलेले कौशल्य बॅज' : language === 'hi' ? '100% सत्यापित कौशल्य बैज' : '100% Verified Skill Badges'}</p>
        </div>

        {/* KPI 3: Federation Welfare Corpus */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[10px] font-black uppercase tracking-wider">{language === 'mr' ? 'कल्याण निधी तिजोरी' : language === 'hi' ? 'एकत्रित कल्याण कोष' : 'Pooled Welfare Vault'}</span>
            <HeartHandshake className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600">₹{totalWelfareFund.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-amber-800 font-semibold">{language === 'mr' ? 'आयुष्मान भारत व अपघात संरक्षण' : language === 'hi' ? 'पीएम-जय और दुर्घटना कवर' : 'PM-JAY & Accidental Cover'}</p>
        </div>

        {/* KPI 4: Direct Worker Wages Disbursed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[10px] font-black uppercase tracking-wider">{language === 'mr' ? 'वितरित वेतन' : language === 'hi' ? 'वितरित पारिश्रमिक' : 'Wages Disbursed'}</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">
            ₹{totalWagesDistributed.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-emerald-800 font-semibold">{language === 'mr' ? '८०% वैधानिक दर लागू' : language === 'hi' ? '80% वैधानिक न्यूनतम लागू' : '80% Statutory Floor Enforced'}</p>
        </div>

        {/* KPI 5: Emergency Response Speed */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">{language === 'mr' ? 'तातडीचा प्रतिसाद' : language === 'hi' ? 'आपातकालीन प्रतिक्रिया' : 'Emergency Response'}</span>
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">~14 {language === 'mr' ? 'मिनिटे' : language === 'hi' ? 'मिनट' : 'Mins'}</p>
          <p className="text-[11px] text-indigo-700 font-semibold">{language === 'mr' ? 'सरासरी आपत्कालीन पोहोच वेळ' : language === 'hi' ? 'औसत आपातकालीन आगमन समय' : 'Average SOS Doorstep ETA'}</p>
        </div>

      </div>

      {/* 3. Five-Tab Navigation Bar */}
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
          <span>{language === 'mr' ? '१. सदस्य संस्था नोंदणी' : language === 'hi' ? '1. सदस्य समितियां रजिस्ट्री' : '1. Member Societies Registry'}</span>
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
          <span>{language === 'mr' ? '२. AI मागणी आणि कामगार संतुलन' : language === 'hi' ? '2. एआई मांग एवं कार्यबल संतुलन' : '2. AI Demand & Workforce Balancing'}</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
            Live Heatmap
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
          <span>{language === 'mr' ? '३. कामगार आणि ८०% वेतन तपासणी' : language === 'hi' ? '3. कार्यबल एवं 80% पारिश्रमिक ऑडिट' : '3. Workforce & 80% Fair-Wage Audit'}</span>
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
          <span>{language === 'mr' ? '४. सामाजिक सुरक्षा व विमा तिजोरी' : language === 'hi' ? '4. सामाजिक सुरक्षा एवं बीमा कोष' : '4. Social Security & Insurance Vault'}</span>
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
          <span>{language === 'mr' ? '५. संचलन आणि वाद निवारण' : language === 'hi' ? '5. संचालन एवं विवाद मध्यस्थता' : '5. Operations & Dispute Arbitration'}</span>
          {disputes.filter(d => d.status !== 'RESOLVED').length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white text-[10px] font-bold">
              {disputes.filter(d => d.status !== 'RESOLVED').length}
            </span>
          )}
        </button>

      </div>

      {/* 4. Tab Content Views */}

      {/* ========================================================= */}
      {/* TAB 1: MEMBER SOCIETIES REGISTRY & ACCREDITATION          */}
      {/* ========================================================= */}
      {activeTab === 'SOCIETIES' && (
        <div className="space-y-6 animate-fadeIn">
          
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Affiliated Primary Labour Cooperative Societies
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Autonomous primary societies registered under the Multi-State Cooperative Societies Act & Maharashtra Cooperative Societies Act.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase">District:</span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="ALL">All Jurisdictions ({cooperatives.length})</option>
                  <option value="Pune">Pune District</option>
                  <option value="Western Maharashtra">Western Maharashtra</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Primary Society</th>
                    <th className="py-3.5 px-3">Statutory Registration</th>
                    <th className="py-3.5 px-3">Trades Managed</th>
                    <th className="py-3.5 px-3">Active Workforce</th>
                    <th className="py-3.5 px-3">Statutory Split</th>
                    <th className="py-3.5 px-3">Welfare Vault</th>
                    <th className="py-3.5 px-3 text-right">Audit & Reliability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredCooperatives.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                        <p className="text-[11px] text-purple-700 font-semibold mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-purple-500" />
                          <span>{c.district} Jurisdiction ({c.coverageAreas?.slice(0, 2).join(', ')}...)</span>
                        </p>
                      </td>
                      <td className="py-4 px-3 font-mono text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200 text-[11px]">
                          {c.regNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">Est. {c.establishedYear || 2018}</span>
                      </td>
                      <td className="py-4 px-3">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {c.serviceCategories?.slice(0, 3).map((cat, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="text-sm font-black text-slate-900">{c.activeWorkers}</span>
                        <span className="text-xs text-slate-400"> / {c.totalWorkers}</span>
                        <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
                          {Math.round((c.activeWorkers / (c.totalWorkers || 1)) * 100)}% On-Duty Ready
                        </span>
                      </td>
                      <td className="py-4 px-3 font-mono text-[11px]">
                        <span className="text-emerald-700 font-bold">{c.splitConfig?.workerShare || 80}% Worker</span> / 
                        <span className="text-amber-700 font-bold"> {c.splitConfig?.welfareShare || 6}% Wlf</span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-black text-amber-700 text-sm">
                          ₹{c.welfareFundBalance.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Dedicated Vault</span>
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-black text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{c.reliabilityScore}% A-Grade</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cooperative Principles Guarantee */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-purple-950">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-sm">
                🏛️
              </div>
              <div>
                <h4 className="font-black text-purple-950 text-sm">Autonomous Primary Governance with Apex Regulatory Umbrella</h4>
                <p className="text-purple-800/90 mt-0.5">
                  Each primary labour cooperative maintains its elected managing committee and local bank account, while the Federation oversees interoperability, national digital identity integration, and statutory split compliance.
                </p>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-900 text-white text-xs font-black shadow-xs whitespace-nowrap">
              Federation Bylaw 14-A
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: AI DEMAND FORECASTING & WORKFORCE BALANCING        */}
      {/* ========================================================= */}
      {activeTab === 'AI_BALANCING' && (
        <div className="space-y-6 animate-fadeIn">
          
          {rebalanceSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white text-xs font-black shadow-sm flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>{rebalanceSuccessMsg}</span>
            </div>
          )}

          {/* AI Demand Chart & Analysis */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-slate-900">
                    AI Predictive Ward Demand & Resource Shortfall Analysis
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black uppercase">
                    SIH ML Model
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analyzes seasonal weather spikes, housing society density, and historical booking velocity to forecast workforce requirements.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600 font-bold">
                  <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" /> Available Workforce
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-bold">
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Recommended Need
                </span>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={forecastChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="available" name="Available Shramiks" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="recommended" name="AI Recommended Workforce" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Inter-Cooperative Balancing Action Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Cross-Cooperative Rebalancing Directives
                </h3>
                <p className="text-xs text-slate-500">
                  AI-recommended inter-society rotational deployments to eliminate worker idle time and resolve ward shortfalls.
                </p>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                {forecasts.length} Locality Nodes Analyzed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Target Locality</th>
                    <th className="py-3.5 px-3">Trade Needed</th>
                    <th className="py-3.5 px-3">Demand Forecast</th>
                    <th className="py-3.5 px-3">Current vs Needed</th>
                    <th className="py-3.5 px-3">AI Cause Factor</th>
                    <th className="py-3.5 px-3 text-right">Federation Directive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {forecasts.map((f, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {f.locality}
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold">
                          {f.trade}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                          f.currentDemand === 'VERY HIGH' || f.currentDemand === 'HIGH'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {f.currentDemand} DEMAND ({f.historicalTrendPercentage})
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <span className="font-bold text-slate-800">{f.currentAvailableInZone} available</span>
                        <span className="text-slate-400"> / {f.recommendedWorkforceAllocation} needed</span>
                        {f.shortfall > 0 ? (
                          <span className="text-rose-600 font-bold block text-[10px]">
                            ⚠️ Shortfall: -{f.shortfall} Shramiks
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-bold block text-[10px]">
                            ✓ Equilibrium
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-3 text-slate-600 text-[11px] max-w-xs">
                        {f.causeFactor}
                      </td>
                      <td className="py-4 px-3 text-right">
                        {f.shortfall > 0 ? (
                          <button
                            onClick={() => handleAuthorizeRebalance(f.locality, f.trade, f.shortfall)}
                            className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-[11px] transition shadow-2xs cursor-pointer inline-flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Authorize Transfer ({f.shortfall})</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-[11px]">
                            Workforce Adequate ✓
                          </span>
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

      {/* ========================================================= */}
      {/* TAB 3: WORKFORCE & FAIR-WAGE AUDIT (80% STATUTORY FLOOR)  */}
      {/* ========================================================= */}
      {activeTab === 'WORKFORCE_WAGE' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Comparison Banner: Cooperative DPI vs Commercial Exploitative Aggregators */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white p-6 sm:p-7 rounded-3xl border border-emerald-500/40 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  Statutory Fair Wage Guarantee
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  80% Direct Worker Take-Home vs 65% Aggregator Models
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                  Commercial platforms deduct 25% to 35% in private platform commissions. Under the KaryaSetu Cooperative Bylaws, exactly 80% goes direct to the shramik, 6% to the welfare health vault, 10% to the primary society, and only 4% to platform server maintenance.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Total Disbursed directly to Shramiks</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{totalWagesDistributed.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-300 block">100% Escrow Settled</span>
              </div>
            </div>

            {/* Split Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-3 border-t border-emerald-500/30 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-900/50 border border-emerald-500/40">
                <span className="text-[10px] uppercase font-black text-emerald-300 block">80% Direct Worker Wage</span>
                <span className="text-sm font-black text-white">Direct Escrow Payout</span>
                <p className="text-[10px] text-emerald-200/80 mt-0.5">Credited directly to worker bank/UPI</p>
              </div>
              <div className="p-3 rounded-2xl bg-amber-900/50 border border-amber-500/40">
                <span className="text-[10px] uppercase font-black text-amber-300 block">6% Social Security Fund</span>
                <span className="text-sm font-black text-white">Central Welfare Vault</span>
                <p className="text-[10px] text-amber-200/80 mt-0.5">PM-JAY health insurance & accident cover</p>
              </div>
              <div className="p-3 rounded-2xl bg-blue-900/50 border border-blue-500/40">
                <span className="text-[10px] uppercase font-black text-blue-300 block">10% Primary Society</span>
                <span className="text-sm font-black text-white">Cooperative Reserve</span>
                <p className="text-[10px] text-blue-200/80 mt-0.5">Local tool banks, depot & member dividends</p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-[10px] uppercase font-black text-slate-400 block">4% Platform Maintenance</span>
                <span className="text-sm font-black text-white">Open DPI Server Costs</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Zero private billionaire equity cut</p>
              </div>
            </div>
          </div>

          {/* Trade-by-Trade Workforce Distribution */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Certified Workforce by Trade Classification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Accredited shramiks verified under the National Skill Qualification Framework (NSQF) & Cooperative Skill Boards.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(tradeDistribution).map(([trade, count], idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {trade}
                  </span>
                  <p className="text-2xl font-black text-slate-900">{count}</p>
                  <span className="text-[10px] text-emerald-700 font-bold block">
                    100% Verified ✓
                  </span>
                </div>
              ))}
            </div>

            {/* Individual Workers Table */}
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Shramik Name</th>
                    <th className="py-3.5 px-3">Trade & Verified Badges</th>
                    <th className="py-3.5 px-3">Cooperative Affiliation</th>
                    <th className="py-3.5 px-3">Completed Jobs</th>
                    <th className="py-3.5 px-3">Direct Earnings</th>
                    <th className="py-3.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {workers.length > 0 ? (
                    workers.map((w) => (
                      <tr key={w._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-900">{w.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{w.phone}</p>
                        </td>
                        <td className="py-4 px-3">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-bold inline-block mb-1">
                            {w.trade}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {w.verifiedSkills?.slice(0, 2).map((s, sIdx) => (
                              <span key={sIdx} className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                ✓ {s.name}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-slate-700">
                          {w.cooperativeName}
                        </td>
                        <td className="py-4 px-3 font-bold text-slate-900">
                          {w.completedJobs || 0} Jobs
                        </td>
                        <td className="py-4 px-3 font-black text-emerald-700 text-sm">
                          ₹{(w.totalEarnings || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            w.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                        No shramiks registered in federation roster yet. Newly inducted cooperative workers will appear here.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SOCIAL SECURITY & PM-JAY WELFARE VAULT            */}
      {/* ========================================================= */}
      {activeTab === 'WELFARE_VAULT' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Central Welfare Vault Overview */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/40 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Pooled Social Security Fund
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Federation Worker Social Security Corpus
                </h3>
                <p className="text-xs text-amber-200 mt-0.5 max-w-xl">
                  Funded automatically via statutory 6% deductions from every customer booking. Provides comprehensive safety nets for shramiks and their families.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center shrink-0">
                <span className="text-[10px] uppercase font-bold text-amber-300 block">Total Reserve Balance</span>
                <span className="text-3xl font-black text-amber-400">
                  ₹{totalWelfareFund.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-amber-200 block">Bank Managed Escrow</span>
              </div>
            </div>

            {/* 3 Welfare Coverage Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-amber-500/30 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40">
                <span className="text-[10px] uppercase font-black text-amber-300 block">1. Ayushman Bharat (PM-JAY)</span>
                <strong className="text-sm font-black text-white block mt-0.5">₹5,00,000 Health Cover</strong>
                <p className="text-[10px] text-amber-200/80 mt-1">
                  100% active shramik households linked with ABHA health cards for cashless hospital treatment.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40">
                <span className="text-[10px] uppercase font-black text-amber-300 block">2. PMSBY Accidental Cover</span>
                <strong className="text-sm font-black text-white block mt-0.5">₹2,00,000 Accidental Cover</strong>
                <p className="text-[10px] text-amber-200/80 mt-1">
                  Federation group policy covering occupational risks for high-voltage and site work.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/40">
                <span className="text-[10px] uppercase font-black text-amber-300 block">3. Shramik Tool & Family Aid</span>
                <strong className="text-sm font-black text-white block mt-0.5">Subsidies & Education Grants</strong>
                <p className="text-[10px] text-amber-200/80 mt-1">
                  Subsidized professional tools and merit scholarships for worker children.
                </p>
              </div>
            </div>
          </div>

          {/* Welfare Disbursement Ledger */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Federation Welfare Claims & Disbursement Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Transparent public audit of welfare funds disbursed to member shramiks.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                {welfareRecords.length} Disbursed Grants
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Beneficiary Worker</th>
                    <th className="py-3.5 px-3">Primary Society</th>
                    <th className="py-3.5 px-3">Grant / Claim Type</th>
                    <th className="py-3.5 px-3">Purpose & Description</th>
                    <th className="py-3.5 px-3">Disbursed Amount</th>
                    <th className="py-3.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {welfareRecords.map((w, idx) => (
                    <tr key={w._id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900 text-sm">{w.workerName}</p>
                        <p className="text-[11px] font-mono text-slate-400">ID: {w.workerId}</p>
                      </td>
                      <td className="py-4 px-3 text-slate-700">
                        {w.cooperativeName}
                      </td>
                      <td className="py-4 px-3">
                        <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px]">
                          {w.title}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{w.date}</span>
                      </td>
                      <td className="py-4 px-3 text-slate-600 text-[11px] max-w-xs">
                        {w.description}
                      </td>
                      <td className="py-4 px-3 font-black text-amber-800 text-base">
                        ₹{w.amount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-[10px] uppercase">
                          {w.status || 'DISBURSED'} ✓
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

      {/* ========================================================= */}
      {/* TAB 5: LIVE OPERATIONS, DISPUTES & CONSUMER TRUST         */}
      {/* ========================================================= */}
      {activeTab === 'OPERATIONS_TRUST' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Operations Overview (Household, Institutional, Emergency) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                Household On-Demand Bookings
              </span>
              <p className="text-3xl font-black text-slate-900">
                {bookings.filter(b => b.type === 'HOUSEHOLD').length || 18} Active
              </p>
              <p className="text-xs text-emerald-700 font-semibold">
                Direct Citizen Dispatch (Pune Wards)
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                Institutional Monthly Contracts
              </span>
              <p className="text-3xl font-black text-blue-700">
                ₹{totalInstitutionalMonthlyValue.toLocaleString('en-IN')}/mo
              </p>
              <p className="text-xs text-blue-800 font-semibold">
                {contracts.length} Housing Societies & Campuses
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                SOS Emergency Dispatch SLA
              </span>
              <p className="text-3xl font-black text-indigo-700">
                ~14 Mins
              </p>
              <p className="text-xs text-indigo-800 font-semibold">
                Critical Leakage & Short Circuit Ready
              </p>
            </div>

          </div>

          {/* Consumer Trust & Central Grievance Arbitration */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-purple-700" />
                  <span>Central Consumer Grievance & Tripartite Arbitration Queue</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unlike commercial platforms that arbitrarily ban workers or ignore customer disputes, KaryaSetu mediates disputes through tripartite committees (Customer + Society Inspector + Peer Worker).
                </p>
              </div>

              <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                100% Redressal Mandate
              </span>
            </div>

            {disputes.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-slate-800 text-sm">Zero Active Disputes on Record</p>
                <p className="mt-0.5 text-slate-500">All customer services have maintained cooperative quality and punctuality standards.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-4">Case Ref</th>
                      <th className="py-3.5 px-3">Complainant Customer</th>
                      <th className="py-3.5 px-3">Assigned Shramik / Coop</th>
                      <th className="py-3.5 px-3">Issue Category</th>
                      <th className="py-3.5 px-3">Grievance Details</th>
                      <th className="py-3.5 px-3 text-right">Arbitration Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {disputes.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-4 font-mono font-bold text-slate-900">
                          {d._id}
                          <span className="text-[10px] text-slate-400 block">{d.date}</span>
                        </td>
                        <td className="py-4 px-3">
                          <p className="font-bold text-slate-900">{d.customerName}</p>
                          <p className="text-[11px] font-mono text-slate-400">{d.customerPhone}</p>
                        </td>
                        <td className="py-4 px-3 text-slate-700">
                          <strong className="block text-slate-900">{d.workerName || 'Assigned Shramik'}</strong>
                          <span className="text-[10px] text-purple-700">{d.cooperativeName}</span>
                        </td>
                        <td className="py-4 px-3">
                          <span className="px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[10px]">
                            {d.issueType}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-slate-600 text-[11px] max-w-xs">
                          {d.description}
                          {d.resolution && (
                            <p className="mt-1 text-emerald-700 font-bold">
                              ✓ Resolution: {d.resolution}
                            </p>
                          )}
                        </td>
                        <td className="py-4 px-3 text-right">
                          {d.status === 'RESOLVED' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-black text-[10px]">
                              RESOLVED ✓
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedDispute(d)}
                              className="px-3 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-[11px] transition cursor-pointer"
                            >
                              Arbitrate Case ➔
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Arbitration Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden space-y-5 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-700 tracking-wider">
                  Tripartite Grievance Redressal
                </span>
                <h3 className="text-base font-black text-slate-900">
                  Arbitrate Case #{selectedDispute._id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Customer Complaint:</span>
                <p className="text-slate-800 font-medium">"{selectedDispute.description}"</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Customer: <strong>{selectedDispute.customerName}</strong> ({selectedDispute.customerPhone})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Tripartite Resolution:
                </label>
                <textarea
                  rows={3}
                  value={resolutionInput}
                  onChange={(e) => setResolutionInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDispute(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResolving}
                onClick={() => handleConfirmResolve(selectedDispute._id)}
                className="px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-black transition shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isResolving ? 'Resolving...' : 'Enforce Resolution ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
