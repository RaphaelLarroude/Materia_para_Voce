import React from 'react';
import { Course } from '../types';
import { useLanguage } from '../languageContext';
import { PencilIcon, TrashIcon, UserGroupIcon, AcademicCapIcon } from './icons';

interface CourseCardProps {
  course: Course;
  onClick: (course: Course) => void;
  isTeacherOwner?: boolean;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onClick, isTeacherOwner = false, onEdit, onDelete }) => {
  const { t } = useLanguage();
  
  const getStatusText = () => {
    if (course.progress === 0) {
      return t('notStartedYet');
    }
    return `${course.progress}${t('completed')}`;
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(course);
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(course);
  }

  const visibilityText = (!course.classrooms || course.classrooms.length === 0)
    ? t('allClassrooms')
    : `${t('classrooms')}: ${course.classrooms.join(', ')}`;

  const visibilityTextYears = (!course.years || course.years.length === 0)
    ? t('allYears')
    : `${t('years')}: ${course.years.map(y => `${y}º`).join(', ')}`;

  return (
    <div
      className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-lg rounded-2xl flex flex-col text-white transition-all duration-300 hover:border-white/40 hover:-translate-y-1 cursor-pointer overflow-hidden group"
      onClick={() => onClick(course)}
      role="button"
      tabIndex={0}
      aria-label={`Acessar curso ${course.title}`}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(course)}
    >
      <div className="relative">
        <img src={course.imageUrl} alt={`Imagem do curso ${course.title}`} className="w-full h-32 object-cover" />
        {isTeacherOwner && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleEditClick} className="p-2 bg-blue-600/80 rounded-full hover:bg-blue-500 transition-colors" aria-label={t('edit')}>
                <PencilIcon className="w-4 h-4 text-white" />
            </button>
            <button onClick={handleDeleteClick} className="p-2 bg-red-600/80 rounded-full hover:bg-red-500 transition-colors" aria-label={t('delete')}>
                <TrashIcon className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-bold text-blue-400 uppercase">{course.title}</h3>
        
        <div className="flex-grow mt-2 space-y-1">
            {isTeacherOwner && (
                <>
                    <div className="flex items-center gap-1.5 text-xs text-gray-300" title={visibilityText}>
                        <UserGroupIcon className="w-4 h-4" />
                        <span className="truncate">{visibilityText}</span>
                    </div>
                     <div className="flex items-center gap-1.5 text-xs text-gray-300" title={visibilityTextYears}>
                        <AcademicCapIcon className="w-4 h-4" />
                        <span className="truncate">{visibilityTextYears}</span>
                    </div>
                </>
            )}
        </div>

        <div className="mt-4">
           <div className="w-full bg-white/20 rounded-full h-1.5 mb-1">
             <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
           </div>
           <p className="text-xs text-gray-200">{getStatusText()}</p>
        </div>

        <button
          className="mt-4 w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
          onClick={(e) => {
              e.stopPropagation();
              onClick(course);
          }}
        >
          {t('access')}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;