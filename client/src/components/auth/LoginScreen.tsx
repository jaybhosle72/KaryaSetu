import React, { useState } from 'react';
import { UserRole } from '../../types';
import { Language } from '../../i18n/translations';
import { 
  Users, HardHat, Briefcase, Building, ArrowRight, 
  CheckCircle2, FileCheck, Check, Award, Lock, Phone, Mail, Sparkles, Globe 
} from 'lucide-react';

interface LoginScreenProps {
  onLogin: (role: UserRole, userDetails: { name: string; phone: string; roleName: string; extraMeta?: any }) => void;
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ 
  onLogin,
  currentLanguage: propLanguage,
  onLanguageChange
}) => {
  const [internalLanguage, setInternalLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('karyasetu_language') || localStorage.getItem('sahakar_language');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    } catch {}
    return 'en';
  });

  const currentLanguage = propLanguage || internalLanguage;

  const handleLangSelect = (lang: Language) => {
    setInternalLanguage(lang);
    if (onLanguageChange) {
      onLanguageChange(lang);
    } else {
      try {
        localStorage.setItem('karyasetu_language', lang);
        localStorage.setItem('sahakar_language', lang);
      } catch {}
    }
  };

  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');

  // Customer Form State
  const [custPhone, setCustPhone] = useState('+91 98229 33445');
  const [custName, setCustName] = useState('Rahul Sharma');
  const [custOtp, setCustOtp] = useState('4821');

  // Worker Form State
  const [workerName, setWorkerName] = useState('Santosh Baburao Kadam');
  const [workerPhone, setWorkerPhone] = useState('+91 98221 00101');
  const [workerAadhaar, setWorkerAadhaar] = useState('XXXX-XXXX-4012');
  const [workerEShram, setWorkerEShram] = useState('UAN-9942-1802-7711');
  const [workerTrade, setWorkerTrade] = useState('Electrical');
  const [workerCert, setWorkerCert] = useState('NSDC Level-4 Certified Domestic Electrician (IS-732)');
  const [workerEducation, setWorkerEducation] = useState('ITI Electrician Diploma (2-Year)');

  // Contractor Form State
  const [contractorName, setContractorName] = useState('Balasaheb Ramchandra Shinde');
  const [contractorPhone, setContractorPhone] = useState('+91 98224 88120');
  const [contractorLicense, setContractorLicense] = useState('LIC/CLRA/PNE/2022/8812');
  const [contractorCoop, setContractorCoop] = useState('Brihan-Maharashtra Multi-Trade Labour Cooperative');
  const [contractorAadhaar, setContractorAadhaar] = useState('XXXX-XXXX-9102');
  const [communitySize, setCommunitySize] = useState(12);
  const [contractorTrades, setContractorTrades] = useState('Painting, Deep Cleaning, Masonry, Carpentry');

  // Admin Form State
  const [adminName, setAdminName] = useState('Suresh Patil');
  const [adminPhone, setAdminPhone] = useState('+91 98220 99887');
  const [adminReg, setAdminReg] = useState('MAH/PNE/LBR/2018/0091');

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('customer', {
      name: custName,
      phone: custPhone,
      roleName: 'Citizen Customer'
    });
  };

  const handleWorkerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('worker', {
      name: workerName,
      phone: workerPhone,
      roleName: `Certified ${workerTrade} Shramik`,
      extraMeta: {
        trade: workerTrade,
        aadhaar: workerAadhaar,
        eShram: workerEShram,
        cert: workerCert,
        education: workerEducation
      }
    });
  };

  const handleContractorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('contractor', {
      name: contractorName,
      phone: contractorPhone,
      roleName: 'Labour Community Coordinator / Mukaddam',
      extraMeta: {
        license: contractorLicense,
        cooperative: contractorCoop,
        communitySize: communitySize,
        trades: contractorTrades
      }
    });
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin('admin', {
      name: adminName,
      phone: adminPhone,
      roleName: 'Cooperative Board President',
      extraMeta: { regNumber: adminReg }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. Header with Sovereign Branding & Multilingual Selector */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden shrink-0">
            <img 
              src="/karyasetu-logo.png" 
              alt="KaryaSetu Logo" 
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight block leading-none">
              KaryaSetu
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              National Cooperative Digital Labour Infrastructure
            </span>
          </div>
        </div>

        {/* Multilingual Selector (SIH Requirement: Multilingual Mobile Application) */}
        <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200 shadow-2xs">
          <span className="pl-1.5 pr-0.5 text-slate-400">
            <Globe className="w-3 h-3" />
          </span>
          <button
            type="button"
            onClick={() => handleLangSelect('en')}
            className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
              currentLanguage === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="English"
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => handleLangSelect('hi')}
            className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
              currentLanguage === 'hi' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="हिंदी (Hindi)"
          >
            हिं
          </button>
          <button
            type="button"
            onClick={() => handleLangSelect('mr')}
            className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
              currentLanguage === 'mr' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="मराठी (Marathi)"
          >
            मरा
          </button>
        </div>
      </div>

      {/* 2. Main Center Body */}
      <div className="max-w-5xl mx-auto w-full py-6 space-y-8">
        
        {/* Title & Perspective Explanation */}
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            One Ecosystem • Four Perspectives
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Sign In with Your Role & Credentials
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Each role has distinct verification requirements, specialized workflows, and dedicated interfaces.
          </p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          
          {/* Tab 1: Customer */}
          <button
            type="button"
            onClick={() => setSelectedRole('customer')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
              selectedRole === 'customer'
                ? 'bg-white border-slate-900 shadow-md ring-2 ring-slate-900'
                : 'bg-white/80 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                Citizen
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Customer</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Book solo shramiks or contractor teams
              </p>
            </div>
          </button>

          {/* Tab 2: Worker */}
          <button
            type="button"
            onClick={() => setSelectedRole('worker')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
              selectedRole === 'worker'
                ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500'
                : 'bg-white/80 border-slate-200 hover:border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Labour
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Cooperative Worker</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Verified skill badge, job queue & welfare
              </p>
            </div>
          </button>

          {/* Tab 3: Contractor */}
          <button
            type="button"
            onClick={() => setSelectedRole('contractor')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
              selectedRole === 'contractor'
                ? 'bg-white border-blue-600 shadow-md ring-2 ring-blue-500'
                : 'bg-white/80 border-slate-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                Community
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Contractor</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Manage worker community & team allocations
              </p>
            </div>
          </button>

          {/* Tab 4: Admin */}
          <button
            type="button"
            onClick={() => setSelectedRole('admin')}
            className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
              selectedRole === 'admin'
                ? 'bg-white border-amber-600 shadow-md ring-2 ring-amber-500'
                : 'bg-white/80 border-slate-200 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                Federation
              </span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Cooperative Admin</h3>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                AI forecasting, bylaw split & mediation
              </p>
            </div>
          </button>

        </div>

        {/* 3. Role-Specific Login & Verification Panel */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          
          {/* ================= PERSPECTIVE 1: CUSTOMER ================= */}
          {selectedRole === 'customer' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-extrabold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Customer Access</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  Instant Household & Resident Sign-In
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Book verified local shramiks or request multi-worker contractor teams for painting, deep cleaning, and renovations. Zero 30% private aggregator fee.
                </p>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Solo shramik or contractor community bookings</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Direct verified cooperative shramik guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>1-Click priority emergency dispatch (&lt;15 mins)</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
                <form onSubmit={handleCustomerSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-slate-400"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mobile Number / Gmail
                      </label>
                      <input
                        type="text"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-none focus:border-slate-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        One-Time Password (OTP)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={custOtp}
                          onChange={(e) => setCustOtp(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold tracking-widest focus:outline-none focus:border-slate-400"
                          placeholder="4-digit OTP"
                          required
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                          OTP Verified ✓
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Enter Customer Marketplace ➔</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustName('Rahul Sharma');
                        setCustPhone('+91 98229 33445');
                        onLogin('customer', { name: 'Rahul Sharma', phone: '+91 98229 33445', roleName: 'Citizen Customer' });
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs whitespace-nowrap cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= PERSPECTIVE 2: WORKER ================= */}
          {selectedRole === 'worker' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                  <HardHat className="w-3.5 h-3.5" />
                  <span>Labour Identity & Skill Verification</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  Shramik Professional Portal
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Workers are verified via DigiLocker, e-Shram, and NSDC skill certification. Receive direct jobs, track milestone progression, and access PM-JAY & accidental welfare.
                </p>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                    <span>Digital Labour Verification</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Aadhaar KYC linked. Linked to Pune District Labour Cooperative Society.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
                <form onSubmit={handleWorkerSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Shramik Full Name
                      </label>
                      <input
                        type="text"
                        value={workerName}
                        onChange={(e) => setWorkerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={workerPhone}
                        onChange={(e) => setWorkerPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Aadhaar Number</span>
                        <span className="text-[9px] text-emerald-600 font-extrabold">DigiLocker ✓</span>
                      </label>
                      <input
                        type="text"
                        value={workerAadhaar}
                        onChange={(e) => setWorkerAadhaar(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>e-Shram UAN (Labour Proof)</span>
                        <span className="text-[9px] text-emerald-600 font-extrabold">Verified ✓</span>
                      </label>
                      <input
                        type="text"
                        value={workerEShram}
                        onChange={(e) => setWorkerEShram(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Primary Trade Specialization
                      </label>
                      <select
                        value={workerTrade}
                        onChange={(e) => setWorkerTrade(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      >
                        <option value="Electrical">Electrical & Wiring</option>
                        <option value="Plumbing">Plumbing & Water Systems</option>
                        <option value="Carpentry">Carpentry & Smart Locks</option>
                        <option value="Painting">Painting & Waterproofing</option>
                        <option value="Deep Cleaning">Deep Cleaning & Sanitization</option>
                        <option value="Maid">Maid & Housekeeper</option>
                        <option value="Caregiver">Caregiver & Elderly Assistance</option>
                        <option value="Driver">Driver on Demand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Education & Vocational Training
                      </label>
                      <input
                        type="text"
                        value={workerEducation}
                        onChange={(e) => setWorkerEducation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Skill India / Cooperative Board Certification
                    </label>
                    <input
                      type="text"
                      value={workerCert}
                      onChange={(e) => setWorkerCert(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                      required
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Authenticate & Enter Worker Dashboard ➔</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLogin('worker', { 
                          name: 'Santosh Baburao Kadam', 
                          phone: '+91 98221 00101', 
                          roleName: 'Certified Electrical Shramik' 
                        });
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs whitespace-nowrap cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= PERSPECTIVE 3: CONTRACTOR ================= */}
          {selectedRole === 'contractor' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-extrabold">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Labour Contractor / Mukaddam</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  Worker Community Coordination Portal
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Contractors represent and manage a community or gang of workers. When a customer needs 5 painters or 4 deep cleaners, the contractor receives the requirement and allocates specific community shramiks.
                </p>

                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200/80 space-y-1.5 text-xs text-blue-900">
                  <span className="font-extrabold uppercase text-[10px] block text-blue-800">
                    Statutory Labour Contractor License
                  </span>
                  <p className="text-[11px] text-blue-800 font-medium">
                    Complies with Contract Labour (Regulation & Abolition) Act, 1970. Cooperative member oversight.
                  </p>
                </div>
              </div>

              <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
                <form onSubmit={handleContractorSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Contractor / Coordinator Name
                      </label>
                      <input
                        type="text"
                        value={contractorName}
                        onChange={(e) => setContractorName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        value={contractorPhone}
                        onChange={(e) => setContractorPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                        <span>Labour License No. (CLRA)</span>
                        <span className="text-[9px] text-blue-600 font-extrabold">Active Permit ✓</span>
                      </label>
                      <input
                        type="text"
                        value={contractorLicense}
                        onChange={(e) => setContractorLicense(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Contractor Aadhaar KYC
                      </label>
                      <input
                        type="text"
                        value={contractorAadhaar}
                        onChange={(e) => setContractorAadhaar(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Affiliated Labour Cooperative Federation
                    </label>
                    <input
                      type="text"
                      value={contractorCoop}
                      onChange={(e) => setContractorCoop(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Community Worker Strength
                      </label>
                      <input
                        type="number"
                        min={2}
                        max={50}
                        value={communitySize}
                        onChange={(e) => setCommunitySize(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Trades Represented in Community
                      </label>
                      <input
                        type="text"
                        value={contractorTrades}
                        onChange={(e) => setContractorTrades(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Enter Contractor Community Portal ➔</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLogin('contractor', { 
                          name: 'Balasaheb Ramchandra Shinde', 
                          phone: '+91 98224 88120', 
                          roleName: 'Labour Community Coordinator' 
                        });
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs whitespace-nowrap cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ================= PERSPECTIVE 4: ADMIN ================= */}
          {selectedRole === 'admin' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                  <Building className="w-3.5 h-3.5" />
                  <span>Cooperative Society & Federation Board</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 leading-tight">
                  Apex Society Administration
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Oversee multi-trade labour societies, execute AI demand rebalancing across Pune wards, calibrate statutory 80/10/6/4 splits, and conduct tripartite dispute resolution.
                </p>
              </div>

              <div className="lg:col-span-7 bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
                <form onSubmit={handleAdminSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Board Officer Name
                      </label>
                      <input
                        type="text"
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Officer Mobile Number
                      </label>
                      <input
                        type="text"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cooperative Registration Number
                    </label>
                    <input
                      type="text"
                      value={adminReg}
                      onChange={(e) => setAdminReg(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold"
                      required
                    />
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      type="submit"
                      className="w-full sm:flex-1 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Enter Cooperative Admin Hub ➔</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLogin('admin', { 
                          name: 'Suresh Patil', 
                          phone: '+91 98220 99887', 
                          roleName: 'Cooperative Board President' 
                        });
                      }}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs whitespace-nowrap cursor-pointer"
                    >
                      Quick Demo Fill
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 4. Footer */}
      <div className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>© 2026 KaryaSetu. National Cooperative Digital Labour Infrastructure.</p>
      </div>

    </div>
  );
};
