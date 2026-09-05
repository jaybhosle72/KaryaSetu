import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Users, HardHat, Briefcase, Building, ArrowRight, 
  CheckCircle2, Award, Lock, Phone, UserPlus, LogIn,
  ShieldCheck, AlertCircle, RefreshCw, Trash2
} from 'lucide-react';
import { api } from '../../services/api';

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
  const { language: contextLang, setLanguage: setContextLang } = useLanguage();
  const [internalLanguage, setInternalLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('karyasetu_language') || localStorage.getItem('sahakar_language');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    } catch {}
    return 'en';
  });

  const currentLanguage = propLanguage || internalLanguage || contextLang;
  const t = (translations[currentLanguage] || translations.en) as typeof translations['en'];

  const handleLangSelect = (lang: Language) => {
    setInternalLanguage(lang);
    setContextLang(lang);
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
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Sign In State
  const [loginPhone, setLoginPhone] = useState('');

  // Register States - Customer
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Register States - Worker
  const [workerName, setWorkerName] = useState('');
  const [workerPhone, setWorkerPhone] = useState('');
  const [workerTrade, setWorkerTrade] = useState('Electrical');
  const [workerExperience, setWorkerExperience] = useState(3);
  const [workerAadhaar, setWorkerAadhaar] = useState('');

  // Register States - Contractor
  const [contractorName, setContractorName] = useState('');
  const [contractorPhone, setContractorPhone] = useState('');
  const [contractorLicense, setContractorLicense] = useState('');
  const [contractorTrades, setContractorTrades] = useState('Painting, Deep Cleaning, Masonry, Carpentry');

  // Register States - Admin
  const [adminName, setAdminName] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminCoop, setAdminCoop] = useState('Brihan-Maharashtra Multi-Trade Labour Cooperative');
  const [adminRegNo, setAdminRegNo] = useState('MH/PNE/CS/LAB/2026/0491');

  // Fetch real registered users from backend on mount
  const fetchRegisteredUsers = async () => {
    try {
      const users = await api.getUsers();
      setRegisteredUsers(users);
    } catch (e) {
      console.warn('Could not fetch registered users:', e);
    }
  };

  useEffect(() => {
    fetchRegisteredUsers();
  }, [selectedRole]);

  // Handle Sign In with phone lookup
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setErrorMessage(t.auth.phoneRequired);
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login(loginPhone.trim(), selectedRole);
      const user = res.user;
      let roleName = 'Citizen Customer';
      if (selectedRole === 'worker') {
        roleName = `Certified ${res.worker?.trade || user.metadata?.trade || 'Skilled'} Shramik`;
      } else if (selectedRole === 'contractor') {
        roleName = 'Labour Contractor / Mukaddam';
      } else if (selectedRole === 'admin') {
        roleName = 'Cooperative Board President';
      }

      onLogin(user.role as UserRole, {
        name: user.name,
        phone: user.phone,
        roleName,
        extraMeta: {
          ...user.metadata,
          workerId: user.workerId,
          contractorId: user.contractorId,
          cooperativeId: user.cooperativeId,
          cooperativeName: user.cooperativeName,
          address: user.address
        }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your phone number or register.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let regPayload: any = {};
      let roleName = 'Citizen Customer';

      if (selectedRole === 'customer') {
        if (!custName.trim() || !custPhone.trim()) {
          throw new Error(t.auth.namePhoneRequired);
        }
        regPayload = {
          name: custName.trim(),
          phone: custPhone.trim(),
          address: custAddress.trim() || 'Kothrud, Pune, Maharashtra',
          role: 'customer'
        };
        roleName = 'Citizen Customer';
      } else if (selectedRole === 'worker') {
        if (!workerName.trim() || !workerPhone.trim()) {
          throw new Error(t.auth.namePhoneRequired);
        }
        regPayload = {
          name: workerName.trim(),
          phone: workerPhone.trim(),
          trade: workerTrade,
          experienceYears: Number(workerExperience) || 3,
          aadhaar: workerAadhaar.trim(),
          role: 'worker'
        };
        roleName = `Certified ${workerTrade} Shramik`;
      } else if (selectedRole === 'contractor') {
        if (!contractorName.trim() || !contractorPhone.trim()) {
          throw new Error('Please enter contractor name and phone number.');
        }
        regPayload = {
          name: contractorName.trim(),
          phone: contractorPhone.trim(),
          license: contractorLicense.trim(),
          trade: contractorTrades.split(',').map(s => s.trim()),
          role: 'contractor'
        };
        roleName = 'Labour Contractor / Mukaddam';
      } else if (selectedRole === 'admin') {
        if (!adminName.trim() || !adminPhone.trim()) {
          throw new Error('Please enter officer name and phone number.');
        }
        regPayload = {
          name: adminName.trim(),
          phone: adminPhone.trim(),
          cooperativeName: adminCoop.trim(),
          regNumber: adminRegNo.trim() || 'MH/PNE/CS/LAB/2026/0491',
          role: 'admin'
        };
        roleName = 'Cooperative Board President';
      }

      const res = await api.register(regPayload);
      const user = res.user;

      setSuccessMessage(`Account registered successfully for ${user.name}!`);
      setTimeout(() => {
        onLogin(user.role as UserRole, {
          name: user.name,
          phone: user.phone,
          roleName,
          extraMeta: {
            ...user.metadata,
            workerId: user.workerId,
            contractorId: user.contractorId,
            cooperativeId: user.cooperativeId,
            cooperativeName: user.cooperativeName,
            address: user.address
          }
        });
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick select an existing registered user for multi-device testing
  const handleSelectRegisteredUser = (u: any) => {
    let roleName = 'Citizen Customer';
    if (u.role === 'worker') {
      roleName = `Certified ${u.metadata?.trade || 'Skilled'} Shramik`;
    } else if (u.role === 'contractor') {
      roleName = 'Labour Contractor / Mukaddam';
    } else if (u.role === 'admin') {
      roleName = 'Cooperative Board President';
    }

    onLogin(u.role as UserRole, {
      name: u.name,
      phone: u.phone,
      roleName,
      extraMeta: {
        ...u.metadata,
        workerId: u.workerId,
        contractorId: u.contractorId,
        cooperativeId: u.cooperativeId,
        cooperativeName: u.cooperativeName,
        address: u.address
      }
    });
  };

  const handleClearBookings = async () => {
    if (!window.confirm('Are you sure you want to clear all bookings in the database? This creates a completely clean slate for multi-device testing.')) return;
    try {
      setIsLoading(true);
      await api.clearAllBookings();
      setSuccessMessage('All test bookings cleared. System is 100% clean!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to clear bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRegisteredUsers = registeredUsers.filter(u => u.role === selectedRole);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 1. Header with Sovereign Branding & Language Selector */}
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
              {t.brandName}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {t.brandSubtitle}
            </span>
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
          <button
            onClick={() => handleLangSelect('en')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${currentLanguage === 'en' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
          >
            EN
          </button>
          <button
            onClick={() => handleLangSelect('hi')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${currentLanguage === 'hi' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
          >
            हिंदी
          </button>
          <button
            onClick={() => handleLangSelect('mr')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${currentLanguage === 'mr' ? 'bg-slate-900 text-white' : 'hover:bg-slate-100'}`}
          >
            मराठी
          </button>
        </div>
      </div>

      {/* 2. Main Login / Registration Container */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8">
        
        {/* Alerts */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          
          {/* Top Title & Role Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {t.auth.dpiAuthTag}
              </span>
              <h1 className="text-2xl font-black text-slate-900 mt-1">
                {t.auth.accessTitle}
              </h1>
              <p className="text-xs text-slate-500">
                {t.auth.accessSubtitle}
              </p>
            </div>

            {/* Auth Mode Toggle: Sign In vs Register */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => { setAuthMode('LOGIN'); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  authMode === 'LOGIN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t.auth.signInTab}</span>
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('REGISTER'); setErrorMessage(''); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  authMode === 'REGISTER' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{t.auth.registerTab}</span>
              </button>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => { setSelectedRole('customer'); setErrorMessage(''); }}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedRole === 'customer'
                  ? 'bg-blue-50/70 border-blue-500 text-blue-950 ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Users className={`w-5 h-5 ${selectedRole === 'customer' ? 'text-blue-600' : 'text-slate-400'}`} />
                {selectedRole === 'customer' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">{t.auth.customerRoleTitle}</span>
                <span className="text-[10px] text-slate-500">{t.auth.customerRoleDesc}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('worker'); setErrorMessage(''); }}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedRole === 'worker'
                  ? 'bg-emerald-50/70 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <HardHat className={`w-5 h-5 ${selectedRole === 'worker' ? 'text-emerald-600' : 'text-slate-400'}`} />
                {selectedRole === 'worker' && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">{t.auth.workerRoleTitle}</span>
                <span className="text-[10px] text-slate-500">{t.auth.workerRoleDesc}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('contractor'); setErrorMessage(''); }}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedRole === 'contractor'
                  ? 'bg-orange-50/70 border-orange-500 text-orange-950 ring-2 ring-orange-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Briefcase className={`w-5 h-5 ${selectedRole === 'contractor' ? 'text-orange-600' : 'text-slate-400'}`} />
                {selectedRole === 'contractor' && <span className="w-2 h-2 rounded-full bg-orange-600" />}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">{t.auth.contractorRoleTitle}</span>
                <span className="text-[10px] text-slate-500">{t.auth.contractorRoleDesc}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('admin'); setErrorMessage(''); }}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-amber-50/70 border-amber-500 text-amber-950 ring-2 ring-amber-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building className={`w-5 h-5 ${selectedRole === 'admin' ? 'text-amber-600' : 'text-slate-400'}`} />
                {selectedRole === 'admin' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">{t.auth.coopRoleTitle}</span>
                <span className="text-[10px] text-slate-500">{t.auth.coopRoleDesc}</span>
              </div>
            </button>
          </div>

          {/* Quick Select of Registered Database Accounts for Easy Testing */}
          {filteredRegisteredUsers.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  {t.auth.registeredAccounts.replace('{role}', selectedRole.toUpperCase())}
                </span>
                <button
                  type="button"
                  onClick={fetchRegisteredUsers}
                  className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> {t.auth.refresh}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {filteredRegisteredUsers.map(u => (
                  <button
                    key={u._id}
                    type="button"
                    onClick={() => handleSelectRegisteredUser(u)}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-slate-800 text-xs font-bold transition flex items-center gap-2 shadow-2xs cursor-pointer group hover:bg-emerald-50"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 group-hover:scale-125 transition" />
                    <span>{u.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({u.phone})</span>
                    {u.metadata?.trade && (
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                        {u.metadata.trade}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FORM: Sign In or Register */}
          {authMode === 'LOGIN' ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.auth.mobileLabel}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder={t.auth.mobilePlaceholder}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t.auth.mobileHint}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>{isLoading ? t.common.loading : t.auth.signInBtn.replace('{role}', selectedRole.toUpperCase())}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('REGISTER'); setErrorMessage(''); }}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  {t.auth.createNewAccount}
                </button>
              </div>
            </form>
          ) : (
            /* ================= REGISTER FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-2">
              
              {/* CUSTOMER REGISTRATION */}
              {selectedRole === 'customer' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.fullName}</label>
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder={t.auth.fullNamePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.mobileLabel} *</label>
                      <input
                        type="text"
                        required
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+91 98220 11223"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.serviceAddress}</label>
                    <input
                      type="text"
                      value={custAddress}
                      onChange={(e) => setCustAddress(e.target.value)}
                      placeholder={t.auth.serviceAddressPlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* WORKER REGISTRATION */}
              {selectedRole === 'worker' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.fullName}</label>
                      <input
                        type="text"
                        required
                        value={workerName}
                        onChange={(e) => setWorkerName(e.target.value)}
                        placeholder={t.auth.fullNamePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.mobileLabel} *</label>
                      <input
                        type="text"
                        required
                        value={workerPhone}
                        onChange={(e) => setWorkerPhone(e.target.value)}
                        placeholder="+91 98221 00200"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.serviceTrade}</label>
                      <select
                        value={workerTrade}
                        onChange={(e) => setWorkerTrade(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
                      >
                        <option value="Electrical">{t.trades?.electrical || 'Electrical'}</option>
                        <option value="Plumbing">{t.trades?.plumbing || 'Plumbing'}</option>
                        <option value="Painting">{t.trades?.painting || 'Painting & Renovation'}</option>
                        <option value="Carpentry">{t.trades?.carpentry || 'Carpentry'}</option>
                        <option value="Deep Cleaning">{t.trades?.cleaning || 'Deep Cleaning'}</option>
                        <option value="Appliance Repair">{t.trades?.appliances || 'Appliance Repair'}</option>
                        <option value="Masonry">Masonry & Civil Labour</option>
                        <option value="Gardening">{t.trades?.gardening || 'Gardening & Landscaping'}</option>
                        <option value="Caregiver">{t.trades?.caregivers || 'Caregiver & Home Care'}</option>
                        <option value="Driver">{t.trades?.drivers || 'Driver on Demand'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.experienceYears}</label>
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={workerExperience}
                        onChange={(e) => setWorkerExperience(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.aadhaarNo}</label>
                    <input
                      type="text"
                      value={workerAadhaar}
                      onChange={(e) => setWorkerAadhaar(e.target.value)}
                      placeholder="XXXX-XXXX-4012"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* CONTRACTOR REGISTRATION */}
              {selectedRole === 'contractor' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.fullName}</label>
                      <input
                        type="text"
                        required
                        value={contractorName}
                        onChange={(e) => setContractorName(e.target.value)}
                        placeholder={t.auth.fullNamePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.mobileLabel} *</label>
                      <input
                        type="text"
                        required
                        value={contractorPhone}
                        onChange={(e) => setContractorPhone(e.target.value)}
                        placeholder="+91 98224 88120"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.contractorLicense}</label>
                    <input
                      type="text"
                      value={contractorLicense}
                      onChange={(e) => setContractorLicense(e.target.value)}
                      placeholder="LIC/CLRA/PNE/2026/8812"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.contractorTrades}</label>
                    <input
                      type="text"
                      value={contractorTrades}
                      onChange={(e) => setContractorTrades(e.target.value)}
                      placeholder="Painting, Plumbing, Civil, Deep Cleaning"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                </div>
              )}

              {/* ADMIN REGISTRATION */}
              {selectedRole === 'admin' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.fullName}</label>
                      <input
                        type="text"
                        required
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        placeholder={t.auth.fullNamePlaceholder}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.mobileLabel} *</label>
                      <input
                        type="text"
                        required
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        placeholder="+91 98220 99887"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.coopName}</label>
                    <input
                      type="text"
                      value={adminCoop}
                      onChange={(e) => setAdminCoop(e.target.value)}
                      placeholder="Brihan-Maharashtra Multi-Trade Labour Cooperative"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.coopRegNo || 'Cooperative Registration No. (MSCS / State Act) *'}</label>
                    <input
                      type="text"
                      value={adminRegNo}
                      onChange={(e) => setAdminRegNo(e.target.value)}
                      placeholder={t.auth.coopRegNoPlaceholder || 'MH/PNE/CS/LAB/2026/0491'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:flex-1 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isLoading ? t.common.loading : t.auth.registerBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('LOGIN'); setErrorMessage(''); }}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                >
                  {t.auth.alreadyRegistered}
                </button>
              </div>
            </form>
          )}

          {/* Clean Slate Button for Testing */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {t.auth.testMultiDeviceNote}
            </span>
            <button
              type="button"
              onClick={handleClearBookings}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
              title="Purges all bookings from MongoDB so you can test fresh from zero"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.auth.clearBookings}</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. Footer */}
      <div className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
        <p>© 2026 KaryaSetu. National Cooperative Digital Labour Public Infrastructure (DPI).</p>
      </div>

    </div>
  );
};
