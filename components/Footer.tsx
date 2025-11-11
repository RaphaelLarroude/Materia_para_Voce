import React from 'react';
import { useLanguage } from '../languageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full text-center py-6 text-xs text-gray-300 bg-black/10 mt-auto">
      <p>{t('copyrightNotice').replace('{year}', currentYear.toString())}</p>
      <p className="mt-1">{t('madeFor')}</p>
    </footer>
  );
};

export default Footer;