import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Language, 
  translations, 
  getTranslatedSectorTitle, 
  getTranslatedServiceName, 
  getTranslatedDuration,
  getTranslatedSubTradeTitle,
  getTranslatedSubTradeTagline
} from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  getSectorTitle: (sectorId: string, fallback: string) => string;
  getServiceName: (serviceName: string) => string;
  getDuration: (duration: string) => string;
  getSubTradeTitle: (subTradeId: string, fallback: string) => string;
  getSubTradeTagline: (subTradeId: string, fallback: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('karyasetu_language') || localStorage.getItem('sahakar_language');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') return saved;
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('karyasetu_language', lang);
      localStorage.setItem('sahakar_language', lang);
      // Dispatch custom event for same-tab cross-component notification
      window.dispatchEvent(new Event('karyasetu_language_changed'));
    } catch {}
  };

  // Sync across tabs & storage events
  useEffect(() => {
    const handleStorage = () => {
      try {
        const saved = localStorage.getItem('karyasetu_language') || localStorage.getItem('sahakar_language');
        if (saved === 'en' || saved === 'hi' || saved === 'mr') {
          setLanguageState(saved);
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('karyasetu_language_changed', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('karyasetu_language_changed', handleStorage);
    };
  }, []);

  const t = useMemo(() => {
    return (translations[language] || translations.en) as typeof translations['en'];
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t,
    getSectorTitle: (sectorId: string, fallback: string) => getTranslatedSectorTitle(sectorId, fallback, language),
    getServiceName: (serviceName: string) => getTranslatedServiceName(serviceName, language),
    getDuration: (duration: string) => getTranslatedDuration(duration, language),
    getSubTradeTitle: (subTradeId: string, fallback: string) => getTranslatedSubTradeTitle(subTradeId, fallback, language),
    getSubTradeTagline: (subTradeId: string, fallback: string) => getTranslatedSubTradeTagline(subTradeId, fallback, language)
  }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const context = useContext(LanguageContext);
  if (!context) {
    const fallbackLang: Language = 'en';
    return {
      language: fallbackLang,
      setLanguage: () => {},
      t: translations.en,
      getSectorTitle: (secId, fb) => getTranslatedSectorTitle(secId, fb, fallbackLang),
      getServiceName: (sn) => getTranslatedServiceName(sn, fallbackLang),
      getDuration: (d) => getTranslatedDuration(d, fallbackLang),
      getSubTradeTitle: (stId, fb) => getTranslatedSubTradeTitle(stId, fb, fallbackLang),
      getSubTradeTagline: (stId, fb) => getTranslatedSubTradeTagline(stId, fb, fallbackLang)
    };
  }
  return context;
};
