import React from 'react';
import { Course } from '../types';
import { useLanguage } from '../languageContext';
import { PencilIcon, TrashIcon, UserGroupIcon, AcademicCapIcon, IconMap, IconName } from './icons';

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
  };

  const visibilityText = (!course.classrooms || course.classrooms.length === 0)
    ? t('allClassrooms')
    : `${t('classrooms')}: ${course.classrooms.join(', ')}`;

  const visibilityTextYears = (!course.years || course.years.length === 0)
    ? t('allYears')
    : `${t('years')}: ${course.years.map(y => `${y}º`).join(', ')}`;

  const IconComponent = IconMap[course.icon as IconName] || IconMap.BookOpenIcon;

  return (
    <div 
      className="relative bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl p-6 hover:bg-white/40 transition-all duration-300 cursor-pointer shadow-lg group"
      onClick={() => onClick(course)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick(course);
        }
      }}
    >
      <div className="flex items-center gap-4">
        {course.imageUrl ? (
             <img src={course.imageUrl} alt={course.title} className="w-16 h-16 rounded-xl object-cover shadow-sm border border-white/20"/>
        ) : (
             <div className="w-16 h-16 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 shadow-sm border border-white/20">
               <IconComponent className="w-8 h-8" />
             </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-blue-900 truncate">{course.title}</h3>
          <p className="text-sm text-blue-800 mt-1">{course.teacher}</p>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs text-blue-800 mb-1 font-medium">
            <span>{getStatusText()}</span>
            <span>{course.progress}%</span>
        </div>
        <div className="w-full bg-blue-100/50 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]" 
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
      </div>
      
      {isTeacherOwner && (
        <>
            <div className="mt-3 pt-3 border-t border-blue-100/30 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-blue-700" title={visibilityText}>
                    <UserGroupIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{visibilityText}</span>
                </div>
                 <div className="flex items-center gap-1.5 text-xs text-blue-700" title={visibilityTextYears}>
                    <AcademicCapIcon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{visibilityTextYears}</span>
                </div>
            </div>

            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit && onEdit(course); }} className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 text-blue-600" aria-label={t('edit')}>
                    <PencilIcon className="w-4 h-4" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete && onDelete(course); }} className="p-2 bg-red-100 rounded-full hover:bg-red-200 text-red-500" aria-label={t('delete')}>
                    <TrashIcon className="w-4 h-4" />
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default CourseCard;