import React from 'react';
import { useLanguage } from '../languageContext';
import { SchoolYear, Classroom } from '../types';

interface SimulationBannerProps {
  onExit: () => void;
  simulationContext: {
    year: SchoolYear;
    classroom: Classroom;
  };
}

const SimulationBanner: React.FC<SimulationBannerProps> = ({ onExit, simulationContext }) => {
  const { t } = useLanguage();
  return (
    <div className="sticky top-0 z-20 bg-purple-600 text-white text-center p-2 text-sm flex items-center justify-center gap-4 flex-wrap">
      <span>
        {t('simulationActive') + ` (${simulationContext.year}º ${t('year')}, ${t('classroom')} ${simulationContext.classroom})`}
      </span>
      <button onClick={onExit} className="font-bold border border-white rounded-md px-3 py-1 hover:bg-white hover:text-purple-600 transition-colors">
        {t('exitSimulation')}
      </button>
    </div>
  );
};

export default SimulationBanner;