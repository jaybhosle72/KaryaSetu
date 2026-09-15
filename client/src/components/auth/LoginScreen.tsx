import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  Users, HardHat, Briefcase, Building, Building2, Globe, Landmark, ArrowRight, 
  CheckCircle2, Award, Lock, Phone, UserPlus, LogIn,
  ShieldCheck, AlertCircle, RefreshCw, Trash2,
  Eye, EyeOff, User
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
  // Sign In State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Common Registration Credentials (Username & Password)
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

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

  // Handle Sign In with username/phone and password
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your username or registered mobile number.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await api.login(loginIdentifier.trim(), selectedRole, loginPassword.trim());
      const user = res.user;
      let roleName = 'Citizen Customer';
      if (selectedRole === 'worker') {
        roleName = `Certified ${res.worker?.trade || user.metadata?.trade || 'Skilled'} Shramik`;
      } else if (selectedRole === 'hub_coordinator' || selectedRole === 'contractor') {
        roleName = 'Village Hub Facilitator (Sahakar Mitra)';
      } else if (selectedRole === 'federation_admin' || selectedRole === 'admin' || selectedRole === 'cooperative' || selectedRole === 'federation') {
        roleName = 'Cooperative Federation Officer (NCCT Aligned)';
      }

      onLogin(user.role as UserRole, {
        name: user.name,
        phone: user.phone,
        roleName,
        extraMeta: {
          ...user.metadata,
          username: user.username,
          workerId: user.workerId,
          contractorId: user.contractorId,
          cooperativeId: user.cooperativeId,
          cooperativeName: user.cooperativeName,
          address: user.address
        }
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your username/password or register.');
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
      if (!regUsername.trim()) {
        throw new Error('Please choose a username for your account.');
      }
      if (regUsername.trim().length < 3) {
        throw new Error('Username must be at least 3 characters long.');
      }
      if (!regPassword.trim()) {
        throw new Error('Please enter a password for your account.');
      }
      if (regPassword.trim().length < 4) {
        throw new Error('Password must be at least 4 characters long.');
      }

      let regPayload: any = {
        username: regUsername.trim().toLowerCase(),
        password: regPassword.trim()
      };
      let roleName = 'Citizen Customer';

      if (selectedRole === 'customer') {
        if (!custName.trim() || !custPhone.trim()) {
          throw new Error(t.auth.namePhoneRequired);
        }
        regPayload = {
          ...regPayload,
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
          ...regPayload,
          name: workerName.trim(),
          phone: workerPhone.trim(),
          trade: workerTrade,
          experienceYears: Number(workerExperience) || 3,
          aadhaar: workerAadhaar.trim(),
          role: 'worker'
        };
        roleName = `Certified ${workerTrade} Shramik`;
      } else if (selectedRole === 'hub_coordinator' || selectedRole === 'contractor') {
        if (!contractorName.trim() || !contractorPhone.trim()) {
          throw new Error('Please enter coordinator / facilitator name and phone number.');
        }
        regPayload = {
          ...regPayload,
          name: contractorName.trim(),
          phone: contractorPhone.trim(),
          license: contractorLicense.trim(),
          trade: contractorTrades.split(',').map(s => s.trim()),
          role: 'hub_coordinator'
        };
        roleName = 'Village Hub Facilitator (Sahakar Mitra)';
      } else if (selectedRole === 'federation_admin' || selectedRole === 'admin') {
        if (!adminName.trim() || !adminPhone.trim()) {
          throw new Error('Please enter federation officer name and phone number.');
        }
        regPayload = {
          ...regPayload,
          name: adminName.trim(),
          phone: adminPhone.trim(),
          cooperativeName: adminCoop.trim(),
          regNumber: adminRegNo.trim() || 'MSCS/CR/2018/MH-4421',
          role: 'federation_admin'
        };
        roleName = 'Cooperative Federation Officer (NCCT Aligned)';
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
            username: user.username,
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

  return (
    <div 
      className="min-h-screen relative overflow-hidden flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 font-sans"
      style={{
        background: 'linear-gradient(180deg, rgba(255, 153, 51, 0.22) 0%, rgba(255, 179, 102, 0.12) 20%, #FFFFFF 45%, #FFFFFF 55%, rgba(74, 187, 89, 0.12) 80%, rgba(19, 136, 8, 0.22) 100%)'
      }}
    >
      {/* Sovereign Tiranga (Indian Tricolor) Ribbon at top */}
      <div className="absolute top-0 left-0 right-0 h-1 flex z-50 shadow-xs">
        <div className="h-full flex-1 bg-[#FF9933]" />
        <div className="h-full flex-1 bg-white" />
        <div className="h-full flex-1 bg-[#138808]" />
      </div>

      {/* Decorative Indian Tricolor Ambient Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF9933]/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#FF671F]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#138808]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#16A34A]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle Central Ashoka Chakra Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.03] select-none">
        <svg viewBox="0 0 200 200" className="w-[520px] h-[520px] text-[#000080]" fill="currentColor">
          <circle cx="100" cy="100" r="92" stroke="currentColor" strokeWidth="8" fill="none" />
          <circle cx="100" cy="100" r="16" fill="currentColor" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={100 + 88 * Math.cos((i * 15 * Math.PI) / 180)}
              y2={100 + 88 * Math.sin((i * 15 * Math.PI) / 180)}
              stroke="currentColor"
              strokeWidth="2.5"
            />
          ))}
        </svg>
      </div>

      {/* 1. Header with Sovereign Branding & Language Selector */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200/80 gap-3 relative z-10">
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
      <div className="max-w-4xl mx-auto w-full my-auto py-8 relative z-10">
        
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

        <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
          
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
              className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
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
              className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
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
              onClick={() => { setSelectedRole('hub_coordinator'); setErrorMessage(''); }}
              className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedRole === 'hub_coordinator' || selectedRole === 'contractor'
                  ? 'bg-teal-50/70 border-teal-500 text-teal-950 ring-2 ring-teal-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Building2 className={`w-5 h-5 ${selectedRole === 'hub_coordinator' || selectedRole === 'contractor' ? 'text-teal-600' : 'text-slate-400'}`} />
                {(selectedRole === 'hub_coordinator' || selectedRole === 'contractor') && <span className="w-2 h-2 rounded-full bg-teal-600" />}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">{currentLanguage === 'mr' ? '३. ग्राम सुविधा केंद्र' : currentLanguage === 'hi' ? '3. ग्राम सुविधा केंद्र' : '3. Village Hub'}</span>
                <span className="text-[10px] text-slate-500">{currentLanguage === 'mr' ? 'श्रमिक नोंदणी व मदत केंद्र' : currentLanguage === 'hi' ? 'श्रमिक सत्यापन व सहायता केंद्र' : 'Shramik Kendra & Offline Desk'}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => { setSelectedRole('federation_admin'); setErrorMessage(''); }}
              className={`p-2.5 sm:p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                selectedRole === 'federation_admin' || selectedRole === 'admin' || selectedRole === 'cooperative' || selectedRole === 'federation'
                  ? 'bg-purple-50/70 border-purple-500 text-purple-950 ring-2 ring-purple-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Globe className={`w-5 h-5 ${selectedRole === 'federation_admin' || selectedRole === 'admin' || selectedRole === 'cooperative' || selectedRole === 'federation' ? 'text-purple-600' : 'text-slate-400'}`} />
                {(selectedRole === 'federation_admin' || selectedRole === 'admin' || selectedRole === 'cooperative' || selectedRole === 'federation') && <span className="w-2 h-2 rounded-full bg-purple-600" />}
              </div>
              <div className="mt-2">
                <span className="text-xs font-black block">{currentLanguage === 'mr' ? '४. महासंघ प्रशासन' : currentLanguage === 'hi' ? '4. महासंघ बोर्ड' : '4. Federation Board'}</span>
                <span className="text-[10px] text-slate-500">{currentLanguage === 'mr' ? 'NCCT आणि AI कार्यबल संतुलन' : currentLanguage === 'hi' ? 'NCCT व एआई कार्यबल संतुलन' : 'NCCT Governance & AI Allocation'}</span>
              </div>
            </button>
          </div>

          {/* FORM: Sign In or Register */}
          {authMode === 'LOGIN' ? (
            /* ================= SIGN IN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username or Registered Mobile Number *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter username (e.g. rahul_patil) or mobile number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Enter the username you chose during registration, or your registered mobile number.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Account Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-base sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                    title={showLoginPassword ? "Hide password" : "Show password"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
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
              
              {/* Common Account Access Credentials (Username & Password) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border border-amber-200/90 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between pb-1 border-b border-amber-200/60">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                    <Lock className="w-3.5 h-3.5 text-amber-700" />
                    <span>Account Login Credentials</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-200">
                    Required for Future Logins
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Choose Username *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        placeholder="e.g. rahul_patil"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white text-base sm:text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Unique login ID (letters, numbers, underscore)</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Account Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showRegPassword ? "text" : "password"}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min. 4 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-white text-base sm:text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                        title={showRegPassword ? "Hide password" : "Show password"}
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Secure password to access your account</p>
                  </div>
                </div>
              </div>
              
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.serviceTrade}</label>
                      <select
                        value={workerTrade}
                        onChange={(e) => setWorkerTrade(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-bold text-slate-900"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-mono"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold text-slate-900"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.contractorTrades}</label>
                    <input
                      type="text"
                      value={contractorTrades}
                      onChange={(e) => setContractorTrades(e.target.value)}
                      placeholder="Painting, Plumbing, Civil, Deep Cleaning"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold"
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
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t.auth.coopRegNo || 'Cooperative Registration No. (MSCS / State Act) *'}</label>
                    <input
                      type="text"
                      value={adminRegNo}
                      onChange={(e) => setAdminRegNo(e.target.value)}
                      placeholder={t.auth.coopRegNoPlaceholder || 'MH/PNE/CS/LAB/2026/0491'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-base sm:text-xs font-mono"
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
      <div className="max-w-5xl mx-auto w-full pt-6 border-t border-slate-300/60 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 KaryaSetu. National Cooperative Digital Labour Public Infrastructure (DPI).</p>
      </div>

    </div>
  );
};
