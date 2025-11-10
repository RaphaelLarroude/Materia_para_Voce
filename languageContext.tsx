import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations } from './i18n';
import { Language } from './types';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('PT_BR');

  const t = useCallback((key: string): string => {
    const languageStrings = translations[language];
    if (languageStrings && typeof languageStrings === 'object' && key in languageStrings) {
        return languageStrings[key as keyof typeof languageStrings];
    }
    return key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};