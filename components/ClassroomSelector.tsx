import React from 'react';
import { Classroom } from '../types';
import { useLanguage } from '../languageContext';

interface ClassroomSelectorProps {
  selectedClassrooms: Classroom[] | undefined;
  onChange: (classrooms: Classroom[]) => void;
}

const ALL_CLASSROOMS: Classroom[] = ['A', 'B', 'C', 'D', 'E'];

const ClassroomSelector: React.FC<ClassroomSelectorProps> = ({ selectedClassrooms = [], onChange }) => {
  const { t } = useLanguage();

  const handleClassroomToggle = (classroom: Classroom) => {
    const currentIndex = selectedClassrooms.indexOf(classroom);
    let newSelectedClassrooms = [...selectedClassrooms];

    if (currentIndex === -1) {
      newSelectedClassrooms.push(classroom);
    } else {
      newSelectedClassrooms.splice(currentIndex, 1);
    }

    if (newSelectedClassrooms.length === ALL_CLASSROOMS.length) {
      onChange([]);
    } else {
      onChange(newSelectedClassrooms);
    }
  };
  
  const isAllSelected = selectedClassrooms.length === 0;

  const handleSelectAll = () => {
    onChange([]);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-blue-800">{t('visibleToClassrooms')}</label>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleSelectAll}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            isAllSelected
              ? 'bg-blue-600 border-blue-600 text-white'
              : 'bg-white/40 border-blue-300 text-blue-900 hover:bg-blue-50'
          }`}
        >
          {t('allClassrooms')}
        </button>
        {ALL_CLASSROOMS.map(classroom => (
          <button
            key={classroom}
            type="button"
            onClick={() => handleClassroomToggle(classroom)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              !isAllSelected && selectedClassrooms.includes(classroom)
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white/40 border-blue-300 text-blue-900 hover:bg-blue-50'
            }`}
          >
            {`${t('classroom')} ${classroom}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ClassroomSelector;