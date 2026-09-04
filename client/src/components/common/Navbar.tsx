import React, { useState, useRef, useEffect } from 'react';
import { 
  Check, LogOut, HeartHandshake, ShieldCheck, 
  Search, Globe, X, ArrowRight, Star, Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { searchCatalog, POPULAR_SEARCH_CHIPS } from '../../utils/searchCatalog';

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
  onSelectService?: (sectorId: string, service: any) => void;
  onOpenGoogleMap?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onLogout,
  onSelectCategoryNav,
  currentLanguage = 'en',
  onLanguageChange,
  searchQuery = '',
  onSearchChange,
  onQuickCategorySelect,
  onSelectService,
  onOpenProfile
}) => {
  const t = translations[currentLanguage || 'en'] || translations.en;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close search popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: '/' or 'Ctrl+K' focuses search input, 'Esc' closes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = searchCatalog(searchQuery || '', 6);

  const handleSelectServiceItem = (sectorId: string, service: any) => {
    setIsSearchOpen(false);
    if (onSelectService) {
      onSelectService(sectorId, service);
    } else {
      onQuickCategorySelect?.(sectorId);
    }
  };

  const handleSelectSectorItem = (sectorId: string) => {
    setIsSearchOpen(false);
    onQuickCategorySelect?.(sectorId);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchResults.services.length > 0) {
        handleSelectServiceItem(searchResults.services[0].sector.id, searchResults.services[0].service);
      } else if (searchResults.sectors.length > 0) {
        handleSelectSectorItem(searchResults.sectors[0].sector.id);
      } else {
        setIsSearchOpen(false);
      }
    }
  };

  const getRoleBadge = () => {
    switch (currentRole) {
      case 'customer':
        return { label: t.nav.citizen, bg: 'bg-orange-50 text-orange-800 border-orange-200' };
      case 'worker':
        return { label: t.nav.shramik, bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      case 'contractor':
        return { label: t.nav.contractor, bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'admin':
      case 'cooperative':
      case 'federation':
        return { label: t.nav.coopBoard, bg: 'bg-purple-50 text-purple-800 border-purple-200' };
    }
  };

  const roleInfo = getRoleBadge();

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200 shadow-xs font-sans">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2 sm:gap-4">
          
          {/* 1. Left: Sovereign Brand Logo & Authority Label */}
          <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
            <div 
              onClick={() => onSelectCategoryNav?.('HOMES')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            >
              {/* KaryaSetu Official Brand Logo */}
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-0.5 overflow-hidden group-hover:scale-105 group-hover:border-orange-300 transition flex-shrink-0">
                <img 
                  src="/karyasetu-logo.png" 
                  alt="KaryaSetu Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 leading-none">
                    {t.brandName}
                  </span>
                  <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleInfo.bg}`}>
                    {roleInfo.label}
                  </span>
                </div>
                <p className="hidden sm:flex text-[10px] text-slate-500 font-semibold leading-tight mt-1 items-center gap-1.5">
                  <span>{t.brandSubtitle}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2. Center: Prominent, Well-Proportioned Search Bar */}
          <div className="flex-1 min-w-[240px] sm:min-w-[320px] md:min-w-[380px] max-w-2xl relative mx-2 sm:mx-4" ref={searchContainerRef}>
            <div className="relative flex items-center group">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-orange-600 transition-colors absolute left-3.5 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleInputKeyDown}
                placeholder={t.nav.searchPlaceholder}
                className="w-full pl-10 pr-12 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-100 hover:bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200/60 rounded-xl sm:rounded-2xl outline-none font-medium text-slate-900 transition-all shadow-2xs placeholder:text-slate-400"
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange?.('');
                      searchInputRef.current?.focus();
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center text-[10px] font-bold text-slate-400 bg-white border border-slate-200/80 px-1.5 py-0.5 rounded shadow-2xs pointer-events-none">
                    /
                  </kbd>
                )}
              </div>
            </div>

            {/* Autocomplete Dropdown Popover: Centered and Spacious */}
            {isSearchOpen && (
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[92vw] sm:w-[500px] md:w-[560px] max-w-[580px] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 py-4 px-4 sm:px-5 z-50 animate-fadeIn max-h-[75vh] overflow-y-auto">
                
                {/* 1. When query is empty -> show popular chips in clean flex wrap */}
                {!searchQuery.trim() ? (
                  <div className="space-y-3 p-1">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-extrabold uppercase tracking-wider text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                        <span>{t.nav.popularServices}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{t.nav.pressToFocus}</span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {POPULAR_SEARCH_CHIPS.map((chip) => (
                        <button
                          key={chip.query}
                          type="button"
                          onClick={() => {
                            onSearchChange?.(chip.query);
                            setIsSearchOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-xs font-semibold text-slate-700 hover:text-orange-950 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{chip.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t.nav.govtRatesTag}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{t.nav.sectorsCount}</span>
                    </div>
                  </div>
                ) : (
                  /* 2. When query has text -> show matching results */
                  <div className="space-y-3">
                    
                    {/* Header info */}
                    <div className="flex items-center justify-between px-1 text-[11px] text-slate-500 pb-1 border-b border-slate-100">
                      <span className="font-bold text-slate-800">
                        {t.nav.matchesFor} <span className="text-orange-600">"{searchQuery}"</span>
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {searchResults.totalMatches} {t.nav.results}
                      </span>
                    </div>

                    {/* Matched Services List */}
                    {searchResults.services.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 block">
                          {t.nav.verifiedServicesTitle}
                        </span>
                        {searchResults.services.map((item) => (
                          <div
                            key={item.service.id}
                            onClick={() => handleSelectServiceItem(item.sector.id, item.service)}
                            className="p-2.5 rounded-xl hover:bg-orange-50/70 border border-transparent hover:border-orange-200/80 transition cursor-pointer flex items-center justify-between gap-3 group/item"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <strong className="text-xs font-black text-slate-900 group-hover/item:text-orange-700 transition">
                                  {item.service.name}
                                </strong>
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                                  {item.subTrade.title}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">
                                  • {item.sector.shortTitle}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                {item.service.description}
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0 flex items-center gap-2.5">
                              <div>
                                <span className="text-xs font-black text-slate-900 block leading-tight">
                                  ₹{item.service.price}
                                </span>
                                <span className="text-[10px] font-bold text-amber-600 flex items-center justify-end gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  <span>{item.service.rating}</span>
                                </span>
                              </div>
                              <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover/item:bg-orange-500 group-hover/item:text-white text-slate-600 flex items-center justify-center transition">
                                <ArrowRight className="w-3.5 h-3.5" />
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Matched Sectors */}
                    {searchResults.sectors.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 block">
                          {t.nav.cooperativeSectorsTitle}
                        </span>
                        {searchResults.sectors.map((sec) => (
                          <div
                            key={sec.sector.id}
                            onClick={() => handleSelectSectorItem(sec.sector.id)}
                            className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition cursor-pointer flex items-center justify-between gap-3 group/sec"
                          >
                            <div>
                              <strong className="text-xs font-bold text-slate-800 group-hover/sec:text-blue-900 transition">
                                {sec.sector.title}
                              </strong>
                              <p className="text-[10px] text-slate-500">
                                {sec.sector.subTradesList.slice(0, 4).join(', ')}...
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {sec.sector.shramiksAvailable} {t.nav.ready}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/sec:text-slate-800" />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Zero matches */}
                    {searchResults.totalMatches === 0 && (
                      <div className="text-center py-6 px-4 space-y-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                          <Search className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {t.nav.noServicesFound} "{searchQuery}"
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {t.nav.trySearching}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                          {['Electrician', 'Plumber', 'AC Repair', 'Deep Cleaning', 'Painting'].map((term) => (
                            <button
                              key={term}
                              type="button"
                              onClick={() => {
                                onSearchChange?.(term.toLowerCase());
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 px-1">
                      <span>{t.nav.pressEnter}</span>
                      <span>{t.nav.escToClose}</span>
                    </div>

                  </div>
                )}

              </div>
            )}
          </div>

          {/* 3. Right: Multilingual Selector & User Profile */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            
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

            {/* User Profile & Role Switcher */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                
                {/* User Avatar + Name -> Clickable Customer Profile Trigger */}
                <button
                  type="button"
                  onClick={() => onOpenProfile?.()}
                  className="flex items-center gap-2 p-1 sm:px-2 sm:py-1 rounded-xl hover:bg-slate-100 transition cursor-pointer group text-left border border-transparent hover:border-slate-200"
                  title="Click to open your Citizen Customer Profile"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-950 group-hover:bg-orange-600 transition text-white font-black text-xs flex items-center justify-center shadow-xs flex-shrink-0">
                    {currentUser.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-black text-slate-900 group-hover:text-orange-600 transition leading-none">{currentUser.name}</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Active"></span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{currentUser.roleName}</p>
                  </div>
                </button>

                {/* Switch Role Button */}
                <button
                  onClick={onLogout}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs cursor-pointer ml-1"
                  title="Switch user perspective or sign out"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">{t.nav.switchRole}</span>
                </button>

              </div>
            ) : (
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-black transition shadow-xs cursor-pointer"
              >
                {t.nav.signIn}
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
