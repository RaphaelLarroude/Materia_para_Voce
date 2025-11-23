import React from 'react';
import { CourseModule } from '../types';
import { PencilIcon, TrashIcon, UserGroupIcon, AcademicCapIcon } from './icons';
import { useLanguage } from '../languageContext';

interface CourseModuleCardProps {
  module: CourseModule;
  onClick: () => void;
  isTeacherOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CourseModuleCard: React.FC<CourseModuleCardProps> = ({ module, onClick, isTeacherOwner, onEdit, onDelete }) => {
  const { t } = useLanguage();
  
  const visibilityText = (!module.classrooms || module.classrooms.length === 0)
    ? t('allClassrooms')
    : `${t('classrooms')}: ${module.classrooms.join(', ')}`;
  
  const visibilityTextYears = (!module.years || module.years.length === 0)
    ? t('allYears')
    : `${t('years')}: ${module.years.map(y => `${y}º`).join(', ')}`;

  return (
    <div
      className="relative aspect-video bg-cover bg-center rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 border border-white/40 shadow-lg flex flex-col justify-between"
      style={{ backgroundImage: `url(${module.illustrationUrl})` }}
      role="button"
      tabIndex={0}
      aria-label={`Acessar módulo ${module.title}`}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
      {isTeacherOwner && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-2 bg-blue-600/80 rounded-full hover:bg-blue-500" aria-label={t('edit')}>
                <PencilIcon className="w-4 h-4 text-white" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 bg-red-600/80 rounded-full hover:bg-red-500" aria-label={t('delete')}>
                <TrashIcon className="w-4 h-4 text-white" />
            </button>
        </div>
      )}
      <div className="relative p-3">
        <div className="inline-block bg-white/50 backdrop-blur-md border border-white/40 p-2 rounded-md shadow-sm">
          <h3 className="text-blue-900 text-sm font-bold uppercase tracking-wide leading-tight">
            {module.title}
          </h3>
        </div>
      </div>
      {isTeacherOwner && (
        <div className="relative p-2 bg-white/50 backdrop-blur-md space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-blue-800" title={visibilityText}>
                <UserGroupIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{visibilityText}</span>
            </div>
             <div className="flex items-center gap-1.5 text-xs text-blue-800" title={visibilityTextYears}>
                <AcademicCapIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{visibilityTextYears}</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default CourseModuleCard;