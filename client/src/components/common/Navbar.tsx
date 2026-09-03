import React, { useState } from 'react';
import { 
  MapPin, ChevronDown, Check, LogOut, HeartHandshake, 
  ShieldCheck, Users, Briefcase, Zap, Search, Globe
} from 'lucide-react';
import { UserRole } from '../../types';
import { Language } from '../../i18n/translations';

interface NavbarProps {
  currentRole: UserRole;
  currentUser: any;
  onLogout: () => void;
  welfareCorpusTotal?: number;
  currentLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
  activeBookingsCount?: number;
  cartItemsCount?: number;
  onOpenCart?: () => void;
  onSelectCategoryNav?: (nav: 'HOMES' | 'INSTITUTIONAL' | 'WELFARE') => void;
  onOpenActiveBooking?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedLocality?: string;
  onSelectLocality?: (locality: string) => void;
  onQuickCategorySelect?: (categoryId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onLogout,
  welfareCorpusTotal = 1356649,
  activeBookingsCount = 0,
  onSelectCategoryNav,
  onOpenActiveBooking,
  selectedLocality = 'Amanora & Baner, Pune',
  onSelectLocality,
  currentLanguage = 'en',
  onLanguageChange
}) => {
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);

  const localities = [
    'Amanora & Baner, Pune',
    'Kothrud & Karve Nagar, Pune',
    'Hinjewadi IT Park, Pune',
    'Viman Nagar & Kalyani Nagar, Pune',
    'Hadapsar & Magarpatta, Pune'
  ];

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'customer':
        return { label: 'Citizen', bg: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'worker':
        return { label: 'Shramik', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'contractor':
        return { label: 'Contractor', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'admin':
      case 'cooperative':
      case 'federation':
        return { label: 'Cooperative Board', bg: 'bg-purple-50 text-purple-800 border-purple-200' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-xs font-sans">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
          
          {/* 1. Left: Sovereign Brand Logo & Authority Label */}
          <div className="flex items-center gap-6">
            <div 
              onClick={() => onSelectCategoryNav?.('HOMES')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Sovereign Crest / Logo */}
              <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-xs font-black text-base tracking-wider relative overflow-hidden group-hover:bg-slate-800 transition">
                <span className="relative z-10">SS</span>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-slate-900 leading-none">
                    SahakarSetu
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-semibold leading-tight mt-1 flex items-center gap-1.5">
                  <span>National Cooperative Digital Public Infrastructure</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-emerald-700 font-bold">NCCT</span>
                </p>
              </div>
            </div>

            {/* Clean Navigation Links for Customer */}
            {currentRole === 'customer' && (
              <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 pl-4 border-l border-slate-200">
                <button 
                  onClick={() => onSelectCategoryNav?.('HOMES')}
                  className="text-slate-950 hover:text-orange-600 transition cursor-pointer"
                >
                  Explore Services
                </button>
                <button 
                  onClick={() => onSelectCategoryNav?.('INSTITUTIONAL')}
                  className="text-slate-600 hover:text-slate-950 transition cursor-pointer"
                >
                  Societies & RWAs
                </button>
                <button 
                  onClick={() => onSelectCategoryNav?.('WELFARE')}
                  className="text-slate-600 hover:text-emerald-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Social Security Vault</span>
                </button>
              </nav>
            )}
          </div>

          {/* 2. Center-Right: Locality Selector & Active Job Tracker */}
          <div className="flex items-center gap-2.5">
            
            {/* Locality Dropdown Selector (Customer) */}
            {currentRole === 'customer' && (
              <div className="relative hidden md:block">
                <button
                  type="button"
                  onClick={() => setShowLocalityDropdown(!showLocalityDropdown)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition cursor-pointer text-xs font-bold text-slate-700 shadow-2xs"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                  <span className="truncate max-w-[150px]">
                    {selectedLocality}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
                </button>

                {showLocalityDropdown && (
                  <div className="absolute top-full mt-1.5 right-0 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn">
                    <span className="px-3.5 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      Select Municipal Zone (Pune)
                    </span>
                    {localities.map((loc) => (
                      <button
                        key={loc}
                        type="button"
                        onClick={() => {
                          onSelectLocality?.(loc);
                          setShowLocalityDropdown(false);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-between transition"
                      >
                        <span>{loc}</span>
                        {selectedLocality === loc && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Active On-Site Job Badge (Clean & Subtle) */}
            {currentRole === 'customer' && activeBookingsCount > 0 && (
              <button
                onClick={onOpenActiveBooking}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black transition cursor-pointer shadow-2xs"
                title="View Active On-Site Service Job"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>{activeBookingsCount} Active</span>
              </button>
            )}

            {/* Multilingual Selector (SIH Requirement: Multilingual Mobile Application) */}
            <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200">
              <span className="pl-1.5 pr-0.5 text-slate-400">
                <Globe className="w-3 h-3" />
              </span>
              <button
                type="button"
                onClick={() => onLanguageChange?.('en')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                  currentLanguage === 'en' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange?.('hi')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                  currentLanguage === 'hi' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="हिंदी (Hindi)"
              >
                हिं
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange?.('mr')}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition cursor-pointer ${
                  currentLanguage === 'mr' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="मराठी (Marathi)"
              >
                मरा
              </button>
            </div>

            {/* User Profile & Role Switcher (Unified Pill) */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                
                {/* User Avatar + Name */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-black text-slate-900 leading-none">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{currentUser.roleName}</p>
                  </div>
                </div>

                {/* Switch Role Button */}
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer ml-1"
                  title="Switch user perspective or sign out"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Switch Role</span>
                </button>

              </div>
            ) : (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black transition shadow-xs cursor-pointer"
              >
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
