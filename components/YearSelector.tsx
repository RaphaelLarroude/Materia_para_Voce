import React from 'react';
import { SchoolYear } from '../types';
import { useLanguage } from '../languageContext';

interface YearSelectorProps {
  selectedYears: SchoolYear[] | undefined;
  onChange: (years: SchoolYear[]) => void;
}

const ALL_YEARS: SchoolYear[] = [6, 7, 8, 9];

const YearSelector: React.FC<YearSelectorProps> = ({ selectedYears = [], onChange }) => {
  const { t } = useLanguage();

  const handleYearToggle = (year: SchoolYear) => {
    const currentIndex = selectedYears.indexOf(year);
    let newSelectedYears = [...selectedYears];

    if (currentIndex === -1) {
      newSelectedYears.push(year);
    } else {
      newSelectedYears.splice(currentIndex, 1);
    }

    if (newSelectedYears.length === ALL_YEARS.length) {
      onChange([]);
    } else {
      onChange(newSelectedYears.sort((a, b) => a - b));
    }
  };
  
  const isAllSelected = selectedYears.length === 0;

  const handleSelectAll = () => {
    onChange([]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-200">{t('visibleToYears')}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSelectAll}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            isAllSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-transparent border-gray-500 text-gray-200 hover:bg-white/10'
          }`}
        >
          {t('allYears')}
        </button>
        {ALL_YEARS.map(year => (
          <button
            key={year}
            type="button"
            onClick={() => handleYearToggle(year)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              !isAllSelected && selectedYears.includes(year)
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-transparent border-gray-500 text-gray-200 hover:bg-white/10'
            }`}
          >
            {`${year}º ${t('year')}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearSelector;