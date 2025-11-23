import React from 'react';
import { useLanguage } from '../languageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full text-center py-8 px-6 mt-auto bg-white/20 backdrop-blur-xl border-t border-white/30 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <p className="text-sm font-bold text-blue-900">
          {t('copyrightNotice').replace('{year}', currentYear.toString())}
        </p>
        <p className="mt-1 text-xs font-medium text-blue-800">{t('madeFor')}</p>
      </div>
    </footer>
  );
};

export default Footer;