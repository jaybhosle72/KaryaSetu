import React, { useState } from 'react';
import { 
  Building2, Users, HardHat, CheckCircle2, Clock, AlertCircle, 
  MapPin, Phone, ShieldCheck, Award, ArrowRight, UserPlus, 
  Check, FileText, ChevronRight, Sparkles, Filter, DollarSign,
  Search, Shield, Star, X, Smartphone, PhoneCall, Wrench, HelpCircle,
  PlusCircle, RefreshCw, Send, ClipboardList, AlertTriangle
} from 'lucide-react';
import { Booking, Worker } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { maskUan } from '../../utils/tradeUtils';

interface VillageHubPortalProps {
  hubUser?: {
    name: string;
    phone: string;
    roleName: string;
    extraMeta?: any;
  };
  bookings: Booking[];
  workers: Worker[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
  onOnboardWorker?: (data: any) => Promise<Worker | void>;
  onOfflineBookingCreate?: (bookingData: any) => Promise<Booking | null | void>;
}

export const VillageHubPortal: React.FC<VillageHubPortalProps> = ({
  hubUser,
  bookings,
  workers,
  onUpdateBookingStatus,
  onOnboardWorker,
  onOfflineBookingCreate
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'SHRAMIKS' | 'DISPATCH_RELAY' | 'WALK_IN_DESK' | 'TOOL_BANK'>('SHRAMIKS');

  // Search & Filter state for Workers
  const [searchTerm, setSearchTerm] = useState('');
  const [tradeFilter, setTradeFilter] = useState('ALL');
  const [smartphoneFilter, setSmartphoneFilter] = useState<'ALL' | 'SMARTPHONE' | 'NON_SMARTPHONE'>('ALL');
  const [selectedWorkerDossier, setSelectedWorkerDossier] = useState<Worker | null>(null);

  // New Shramik Onboarding Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');
  const [newWorkerPhone, setNewWorkerPhone] = useState('');
  const [newWorkerTrade, setNewWorkerTrade] = useState('Electrical');
  const [newWorkerExp, setNewWorkerExp] = useState(3);
  const [newWorkerAadhaar, setNewWorkerAadhaar] = useState('');
  const [newWorkerEshram, setNewWorkerEshram] = useState('');
  const [newWorkerHasPhone, setNewWorkerHasPhone] = useState(true);
  const [isOnboardingSubmitting, setIsOnboardingSubmitting] = useState(false);
  const [onboardSuccess, setOnboardSuccess] = useState('');

  // Offline Walk-in Citizen Booking State
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinAddress, setWalkinAddress] = useState('Kothrud Village Panchayat Ward 4, Pune');
  const [walkinTrade, setWalkinTrade] = useState('Plumbing');
  const [walkinNotes, setWalkinNotes] = useState('');
  const [walkinSubmitting, setWalkinSubmitting] = useState(false);
  const [walkinSuccessMsg, setWalkinSuccessMsg] = useState('');
  const [lastGeneratedOtp, setLastGeneratedOtp] = useState<string | null>(null);

  // Tool Bank State
  const [tools, setTools] = useState([
    { id: 't1', name: 'Heavy Rotary Hammer Drill (Makita 800W)', total: 6, available: 4, trade: 'Electrical & Masonry' },
    { id: 't2', name: 'Digital Multimeter & Insulation Tester', total: 10, available: 8, trade: 'Electrical' },
    { id: 't3', name: 'Pipe Threading & Hydrostatic Pressure Pump', total: 4, available: 2, trade: 'Plumbing' },
    { id: 't4', name: 'Laser Spirit Level & Angle Finder', total: 5, available: 5, trade: 'Carpentry' },
    { id: 't5', name: 'Full Body Safety Harness & Lanyard Kit', total: 12, available: 9, trade: 'Safety & Heights' }
  ]);

  // Relay Alert Simulation state
  const [relayLogs, setRelayLogs] = useState<Record<string, string>>({});

  // Filtered workers
  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          w.phone.includes(searchTerm) ||
                          w.trade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrade = tradeFilter === 'ALL' || w.trade === tradeFilter;
    const matchesPhone = smartphoneFilter === 'ALL' || 
                         (smartphoneFilter === 'SMARTPHONE' && w.hasSmartphone !== false) ||
                         (smartphoneFilter === 'NON_SMARTPHONE' && w.hasSmartphone === false);
    return matchesSearch && matchesTrade && matchesPhone;
  });

  // Recent bookings requiring dispatch
  const activeHubBookings = bookings.filter(b => b.status === 'ALLOCATED' || b.status === 'MATCHING' || b.status === 'EN_ROUTE');

  // Handle New Worker Onboarding
  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerName.trim() || !newWorkerPhone.trim()) {
      alert('Please fill worker name and phone number.');
      return;
    }
    setIsOnboardingSubmitting(true);
    try {
      const payload = {
        name: newWorkerName.trim(),
        phone: newWorkerPhone.trim(),
        trade: newWorkerTrade,
        experienceYears: Number(newWorkerExp) || 3,
        aadhaar: newWorkerAadhaar.trim(),
        eshramUan: newWorkerEshram.trim(),
        eshramRegistered: Boolean(newWorkerEshram.trim()),
        hasSmartphone: newWorkerHasPhone,
        preferredDispatchMode: newWorkerHasPhone ? 'APP' : 'HUB_CALL',
        cooperativeName: 'Brihan-Maharashtra Multi-Trade Labour Cooperative',
        villageHubName: 'Ward 4 Shramik Suvidha Kendra'
      };
      if (onOnboardWorker) {
        await onOnboardWorker(payload);
      }
      setOnboardSuccess(`✓ ${newWorkerName} enrolled successfully as verified ${newWorkerTrade} member!`);
      setNewWorkerName('');
      setNewWorkerPhone('');
      setNewWorkerAadhaar('');
      setNewWorkerEshram('');
      setTimeout(() => {
        setOnboardSuccess('');
        setIsOnboardingOpen(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to onboard worker');
    } finally {
      setIsOnboardingSubmitting(false);
    }
  };

  // Handle Walk-in Citizen Booking
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim() || !walkinPhone.trim()) {
      alert('Please enter citizen name and phone number.');
      return;
    }
    setWalkinSubmitting(true);
    try {
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      const bookingData = {
        customerName: walkinName.trim(),
        customerPhone: walkinPhone.trim(),
        serviceCategory: walkinTrade,
        subTrade: `${walkinTrade} General Repair`,
        address: walkinAddress.trim(),
        type: 'HOUSEHOLD',
        urgency: 'STANDARD',
        status: 'MATCHING',
        totalAmount: 450,
        notes: walkinNotes ? `[Hub Walk-in] ${walkinNotes}` : '[Hub Walk-in Assisted Booking]',
        otp: generatedOtp,
        hubAssisted: true,
        hubCoordinatorName: hubUser?.name || 'Village Kendra Sanchalak'
      };

      if (onOfflineBookingCreate) {
        await onOfflineBookingCreate(bookingData);
      }
      setLastGeneratedOtp(generatedOtp);
      setWalkinSuccessMsg(`✓ Offline booking confirmed for ${walkinName}! Doorstep OTP is ${generatedOtp}.`);
      setWalkinName('');
      setWalkinPhone('');
      setWalkinNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to create offline booking');
    } finally {
      setWalkinSubmitting(false);
    }
  };

  // Handle coordinator relaying dispatch to worker
  const handleRelayDispatch = (bookingId: string, workerName: string, workerPhone: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRelayLogs(prev => ({
      ...prev,
      [bookingId]: `✓ Call logged at ${timestamp} to ${workerPhone} (${workerName}). Confirmed worker dispatched to site.`
    }));
  };

  return (
    <div className="space-y-6 pb-20 font-sans max-w-[1360px] mx-auto">
      
      {/* 1. Hub Header: Shramik Suvidha Kendra */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-teal-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-wider border border-teal-500/30">
              <Building2 className="w-3.5 h-3.5 text-teal-400" />
              <span>{language === 'mr' ? 'ग्राम / प्रभाग श्रमिक सुविधा केंद्र' : language === 'hi' ? 'ग्राम / वार्ड श्रमिक सुविधा केंद्र' : 'Village / Ward Shramik Suvidha Kendra'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {hubUser?.name || 'Kendra Sanchalak / Sahakar Mitra'} • {language === 'mr' ? 'स्थानिक सहकारी सेवा केंद्र' : language === 'hi' ? 'स्थानीय सहकारी सेवा केंद्र' : 'Local Cooperative Service Hub'}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              {language === 'mr' ? 'स्थानिक कामगार पडताळणी, डिजिटल सहाय्य, ज्येष्ठ नागरिकांसाठी ऑफलाइन बुकिंग आणि सहकारी साधन बँक व्यवस्थापन.' : language === 'hi' ? 'स्थानीय श्रमिक सत्यापन, डिजिटल सहायता, गैर-स्मार्टफोन सदस्यों के लिए कॉल डिस्पैच और निष्पक्ष सहकारी सेवा सुविधा।' : 'On-ground worker verification, digital assistance, phone dispatch for non-smartphone members, walk-in citizen counter bookings, and cooperative tool bank administration.'}
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-teal-950/80 border border-teal-400/30 text-teal-200 font-mono text-[11px] flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-teal-400" />
              <span>Ward 4, Kothrud Panchayat Hub</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'mr' ? 'शून्य-मध्यस्थ सहकारी केंद्र' : language === 'hi' ? 'शून्य-बिचौलिया सहकारी केंद्र' : 'Zero-Middleman Cooperative Center'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Member Shramiks</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{workers.length}</p>
          <p className="text-[11px] text-teal-700 font-semibold">Registered in this Hub</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Non-Smartphone Members</span>
            <Smartphone className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{workers.filter(w => w.hasSmartphone === false).length}</p>
          <p className="text-[11px] text-amber-700 font-semibold">Assisted via Voice/SMS Dispatch</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Active Dispatches Today</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeHubBookings.length}</p>
          <p className="text-[11px] text-blue-700 font-semibold">Direct & Walk-in Bookings</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider">Shared Tool Bank</span>
            <Wrench className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{tools.reduce((acc, t) => acc + t.available, 0)} / {tools.reduce((acc, t) => acc + t.total, 0)}</p>
          <p className="text-[11px] text-indigo-700 font-semibold">Units Available for Members</p>
        </div>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('SHRAMIKS')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'SHRAMIKS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600" />
          <span>Member Shramiks ({workers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DISPATCH_RELAY')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'DISPATCH_RELAY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PhoneCall className="w-4 h-4 text-amber-600" />
          <span>Non-Smartphone Dispatch Relay ({activeHubBookings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WALK_IN_DESK')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'WALK_IN_DESK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4 text-blue-600" />
          <span>Walk-in Citizen Counter (Offline Booking)</span>
        </button>

        <button
          onClick={() => setActiveTab('TOOL_BANK')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'TOOL_BANK' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-indigo-600" />
          <span>Cooperative Tool Bank</span>
        </button>
      </div>

      {/* 4. TAB 1: MEMBER SHRAMIKS & ONBOARDING DESK */}
      {activeTab === 'SHRAMIKS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by worker name, trade, phone..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold"
                />
              </div>

              <select
                value={tradeFilter}
                onChange={(e) => setTradeFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-slate-700 bg-white"
              >
                <option value="ALL">All Trades</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Masonry">Masonry</option>
                <option value="Deep Cleaning">Deep Cleaning</option>
              </select>

              <select
                value={smartphoneFilter}
                onChange={(e: any) => setSmartphoneFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold text-slate-700 bg-white"
              >
                <option value="ALL">All Devices</option>
                <option value="SMARTPHONE">Smartphone App Users</option>
                <option value="NON_SMARTPHONE">Non-Smartphone (Call Dispatch)</option>
              </select>
            </div>

            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition flex items-center gap-2 cursor-pointer shrink-0 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll New Shramik</span>
            </button>
          </div>

          {/* Workers Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkers.map(w => {
              const isNonSmartphone = w.hasSmartphone === false;
              return (
                <div 
                  key={w._id || w.id}
                  className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-base font-black text-slate-900">{w.name}</h3>
                        <p className="text-xs text-teal-700 font-bold">{w.trade} • {w.experienceYears} Yrs Exp</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                        w.status === 'AVAILABLE' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {w.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{w.phone}</span>
                      </div>
                      
                      {/* Device Mode Badge */}
                      <div className="flex items-center gap-1.5 pt-1">
                        {isNonSmartphone ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                            <PhoneCall className="w-3 h-3 text-amber-600" />
                            <span>Feature Phone • Call Dispatch</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold border border-teal-200">
                            <Smartphone className="w-3 h-3 text-teal-600" />
                            <span>KaryaSetu Shramik App User</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Verified Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                        <ShieldCheck className="w-3 h-3 text-purple-600" />
                        <span>e-Shram Registered ✓</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        <Award className="w-3 h-3 text-blue-600" />
                        <span>NCCT / Skill India Certified</span>
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="text-slate-500">
                      <span>Rating: <strong>{w.customerRating || 4.8}★</strong> ({w.completedJobs || 12} jobs)</span>
                    </div>
                    <button
                      onClick={() => setSelectedWorkerDossier(w)}
                      className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Dossier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TAB 2: NON-SMARTPHONE DISPATCH RELAY */}
      {activeTab === 'DISPATCH_RELAY' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950">Inclusive Digital Assistance Protocol</p>
              <p className="mt-0.5 text-amber-800">
                To prevent digital exclusion, cooperative members without smartphones receive direct phone call dispatch alerts through this hub. Confirm worker availability and relay customer address & requirements.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
            {activeHubBookings.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
                <p className="font-bold text-sm text-slate-700">All local dispatch requests have been relayed.</p>
                <p className="text-xs">No pending worker communications required at this moment.</p>
              </div>
            ) : (
              activeHubBookings.map(b => {
                const assignedWorker = workers.find(w => w._id === b.assignedWorkerId || w.id === b.assignedWorkerId);
                const hasRelayLog = relayLogs[b._id || b.id || ''];

                return (
                  <div key={b._id || b.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{b.serviceCategory} — {b.subTrade}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {b.status}
                        </span>
                        {b.hubAssisted && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            Walk-in Assisted
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-slate-600">
                        <strong>Citizen:</strong> {b.customerName} ({b.customerPhone}) • <strong>Location:</strong> {b.address}
                      </p>

                      <p className="text-xs text-teal-700 font-semibold">
                        <strong>Assigned Shramik:</strong> {b.workerName || assignedWorker?.name || 'Awaiting Allocation'} ({b.workerPhone || assignedWorker?.phone || 'N/A'})
                      </p>

                      {hasRelayLog && (
                        <p className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                          {hasRelayLog}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRelayDispatch(b._id || b.id || '', b.workerName || 'Worker', b.workerPhone || 'Worker Phone')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Log Voice Call Dispatch</span>
                      </button>

                      <button
                        onClick={() => onUpdateBookingStatus(b._id || b.id || '', 'EN_ROUTE')}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Mark En Route
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 3: WALK-IN CITIZEN COUNTER (OFFLINE BOOKING) */}
      {activeTab === 'WALK_IN_DESK' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Walk-in Citizen Service Booking Counter</h2>
              <p className="text-xs text-slate-500">
                Assist elderly villagers, local shopkeepers, or residents without smartphones in booking verified cooperative trades.
              </p>
            </div>

            {walkinSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{walkinSuccessMsg}</span>
                </div>
                {lastGeneratedOtp && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-700 block">Customer Doorstep OTP</span>
                      <span className="text-xl font-mono font-black text-slate-900">{lastGeneratedOtp}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 max-w-[200px] text-right">
                      Hand over this OTP or SMS to citizen. Shramik will ask for it upon arrival.
                    </span>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleWalkinSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Citizen Full Name *</label>
                  <input
                    type="text"
                    required
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    placeholder="e.g. Smt. Mandakini Deshmukh"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Citizen Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    placeholder="+91 98230 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Service Trade *</label>
                  <select
                    value={walkinTrade}
                    onChange={(e) => setWalkinTrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Plumbing">Plumbing & Water Pipeline</option>
                    <option value="Electrical">Electrical Repairs & Wiring</option>
                    <option value="Carpentry">Carpentry & Furniture</option>
                    <option value="Painting">Painting & Whitewashing</option>
                    <option value="Masonry">Masonry & Tile Repair</option>
                    <option value="Deep Cleaning">Home Deep Cleaning</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Village Ward / Address *</label>
                  <input
                    type="text"
                    required
                    value={walkinAddress}
                    onChange={(e) => setWalkinAddress(e.target.value)}
                    placeholder="House No, Lane, Ward"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Problem Description / Notes</label>
                <textarea
                  rows={2}
                  value={walkinNotes}
                  onChange={(e) => setWalkinNotes(e.target.value)}
                  placeholder="e.g. Overhead water tank leakage near kitchen connection."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={walkinSubmitting}
                className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{walkinSubmitting ? 'Dispatching...' : 'Confirm Walk-in Booking & Generate Doorstep OTP'}</span>
              </button>
            </form>
          </div>

          {/* Guidelines Sidebar */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Hub Facilitator Protocols</h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Ensure transparent cooperative rate is explained to the citizen prior to confirmation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Explain the Doorstep OTP mechanism: The worker will only begin work after the customer reveals the OTP.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>Zero commission policy: The hub coordinator does not charge any private fee from either citizen or worker.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* 7. TAB 4: COOPERATIVE TOOL BANK */}
      {activeTab === 'TOOL_BANK' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-black text-slate-900">Cooperative Community Tool Bank</h2>
              <p className="text-xs text-slate-500">
                Expensive equipment funded through the Cooperative Reserve. Member shramiks can check out specialized tools free of cost.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              100% Cooperative Owned
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map(tool => (
              <div key={tool.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                    {tool.trade}
                  </span>
                  <h4 className="text-sm font-black text-slate-900 mt-2">{tool.name}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-600 mt-2">
                    <span>Available in Hub:</span>
                    <strong className="text-emerald-700">{tool.available} / {tool.total} Units</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => {
                      if (tool.available <= 0) return alert('No units currently available in tool bank');
                      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, available: t.available - 1 } : t));
                      alert(`Checked out 1 unit of ${tool.name} to member shramik.`);
                    }}
                    disabled={tool.available <= 0}
                    className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 transition cursor-pointer disabled:opacity-50"
                  >
                    Check Out Tool
                  </button>

                  <button
                    onClick={() => {
                      if (tool.available >= tool.total) return;
                      setTools(prev => prev.map(t => t.id === tool.id ? { ...t, available: t.available + 1 } : t));
                    }}
                    disabled={tool.available >= tool.total}
                    className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs border border-teal-300 transition cursor-pointer disabled:opacity-50"
                  >
                    Return
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. MODAL: ENROLL NEW WORKER */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Enroll Village Shramik</h3>
              </div>
              <button onClick={() => setIsOnboardingOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {onboardSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{onboardSuccess}</span>
              </div>
            )}

            <form onSubmit={handleOnboardSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shramik Full Name *</label>
                <input
                  type="text"
                  required
                  value={newWorkerName}
                  onChange={(e) => setNewWorkerName(e.target.value)}
                  placeholder="e.g. Dnyaneshwar Shinde"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={newWorkerPhone}
                    onChange={(e) => setNewWorkerPhone(e.target.value)}
                    placeholder="+91 98220 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Primary Trade *</label>
                  <select
                    value={newWorkerTrade}
                    onChange={(e) => setNewWorkerTrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                  >
                    <option value="Electrical">Electrical</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Painting">Painting</option>
                    <option value="Masonry">Masonry</option>
                    <option value="Deep Cleaning">Deep Cleaning</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Number (Last 4 digits)</label>
                  <input
                    type="text"
                    value={newWorkerAadhaar}
                    onChange={(e) => setNewWorkerAadhaar(e.target.value)}
                    placeholder="XXXX-XXXX-7812"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">e-Shram UAN Number</label>
                  <input
                    type="text"
                    value={newWorkerEshram}
                    onChange={(e) => setNewWorkerEshram(e.target.value)}
                    placeholder="UAN 12-digit number"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Smartphone Checkbox */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Does worker own an active Smartphone?</span>
                  <span className="text-[11px] text-slate-500">
                    {newWorkerHasPhone ? 'Worker will receive jobs via KaryaSetu App' : 'Worker will receive jobs via Hub voice call dispatch'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={newWorkerHasPhone}
                  onChange={(e) => setNewWorkerHasPhone(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOnboardingOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboardingSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isOnboardingSubmitting ? 'Enrolling...' : 'Verify & Enroll Worker'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. MODAL: WORKER DOSSIER DETAIL */}
      {selectedWorkerDossier && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedWorkerDossier.name}</h3>
                <p className="text-xs text-teal-700 font-bold">{selectedWorkerDossier.trade} • {selectedWorkerDossier.cooperativeName}</p>
              </div>
              <button onClick={() => setSelectedWorkerDossier(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">e-Shram Status:</span>
                  <span className="font-bold text-emerald-700">✓ Verified Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">e-Shram UAN:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {maskUan(selectedWorkerDossier.eshramUan || selectedWorkerDossier.welfareDetails?.eShramUAN || '120984729104')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PM-JAY Health Card:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {selectedWorkerDossier.welfareDetails?.pmjayCardNumber || 'PMJAY-MH-8821-9921'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accidental Insurance:</span>
                  <span className="font-bold text-emerald-700">Covered (₹5,00,000)</span>
                </div>
              </div>

              <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-teal-900 font-bold">Total Livelihood Earned:</span>
                  <span className="font-black text-teal-800">₹{(selectedWorkerDossier.totalEarnings || 24500).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Cooperative Jobs Completed:</span>
                  <span className="font-bold text-slate-800">{selectedWorkerDossier.completedJobs || 14}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Quality Rating:</span>
                  <span className="font-bold text-amber-600">{selectedWorkerDossier.customerRating || 4.9} ★</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedWorkerDossier(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
            >
              Close Dossier
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
