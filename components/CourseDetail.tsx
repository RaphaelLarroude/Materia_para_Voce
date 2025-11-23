import React, { useState } from 'react';
import { Course, CourseModule, StudyMaterialCategory, StudyMaterial } from '../types';
import CourseModuleCard from './CourseModuleCard';
import { HomeIcon, XIcon, VideoCameraIcon, DocumentIcon, LinkIcon, PencilIcon, TrashIcon, PlusIcon, PhotoIcon } from './icons';
import { useLanguage } from '../languageContext';

// Reusable card for categories, now with edit/delete buttons for teachers
const StudyMaterialCategoryCard: React.FC<{ category: StudyMaterialCategory, onClick: () => void, isTeacherOwner: boolean, onEdit: () => void, onDelete: () => void }> = ({ category, onClick, isTeacherOwner, onEdit, onDelete }) => {
  const { t } = useLanguage();
  return (
    <div
      className="relative aspect-[4/3] bg-cover bg-center rounded-2xl overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1 border border-white/40 shadow-lg"
      style={{ backgroundImage: `url(${category.illustrationUrl})` }}
      onClick={onClick} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors" />
      {isTeacherOwner && (
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 bg-blue-600/80 rounded-full hover:bg-blue-500" aria-label={t('edit')}><PencilIcon className="w-4 h-4 text-white" /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-red-600/80 rounded-full hover:bg-red-500" aria-label={t('delete')}><TrashIcon className="w-4 h-4 text-white" /></button>
        </div>
      )}
      <div className="relative p-3">
        <div className="bg-white/50 backdrop-blur-md p-2 rounded-md inline-block shadow-sm">
          <h3 className="text-blue-900 text-base font-semibold">{category.title}</h3>
        </div>
      </div>
    </div>
  );
};

// Reusable item for materials, now with edit/delete buttons for teachers
const StudyMaterialItem: React.FC<{ 
    material: StudyMaterial, 
    isTeacherOwner: boolean, 
    onEdit: () => void, 
    onDelete: () => void,
    onViewMaterial: (material: StudyMaterial) => void
}> = ({ material, isTeacherOwner, onEdit, onDelete, onViewMaterial }) => {
  const { t } = useLanguage();
  
  const getIconForMaterial = (mat: StudyMaterial) => {
    if (mat.type === 'link') return <LinkIcon className="h-6 w-6 text-blue-600" />;
    if (mat.fileType?.startsWith('video/')) return <VideoCameraIcon className="h-6 w-6 text-blue-600" />;
    if (mat.fileType?.startsWith('image/')) return <PhotoIcon className="h-6 w-6 text-blue-600" />;
    return <DocumentIcon className="h-6 w-6 text-blue-600" />;
  };

  const handleItemClick = () => {
    if (material.type === 'file') {
      onViewMaterial(material);
    } else {
      window.open(material.content, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <li className="flex items-center p-4 bg-white/30 rounded-lg group hover:bg-white/40 transition-colors border border-white/20">
      <button onClick={handleItemClick} className="flex items-center min-w-0 flex-grow text-left">
        <div className="flex-shrink-0 mr-4">{getIconForMaterial(material)}</div>
        <div className="min-w-0">
          <span className="font-medium text-blue-900 truncate block">{material.title}</span>
          {material.type === 'file' && material.fileName && (
              <span className="text-xs text-blue-700 truncate hidden sm:inline">({material.fileName})</span>
          )}
        </div>
      </button>
      {isTeacherOwner && (
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-4">
            <button onClick={onEdit} className="p-2 hover:bg-blue-100/50 rounded-full" aria-label={t('edit')}><PencilIcon className="w-5 h-5 text-blue-600" /></button>
            <button onClick={onDelete} className="p-2 hover:bg-red-100/50 rounded-full" aria-label={t('delete')}><TrashIcon className="w-5 h-5 text-red-500" /></button>
        </div>
      )}
    </li>
  );
};

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  isTeacherOwner: boolean;
  onAddModule: () => void;
  onEditModule: (module: CourseModule) => void;
  onDeleteModule: (moduleId: string) => void;
  onAddCategory: (moduleId: string) => void;
  onEditCategory: (moduleId: string, category: StudyMaterialCategory) => void;
  onDeleteCategory: (moduleId: string, categoryId: string) => void;
  onAddMaterial: (categoryId: string) => void;
  onEditMaterial: (categoryId: string, material: StudyMaterial) => void;
  onDeleteMaterial: (categoryId: string, materialId: string) => void;
  onViewMaterial: (material: StudyMaterial) => void;
}

const CourseDetail: React.FC<CourseDetailProps> = (props) => {
  const { course, onBack, isTeacherOwner, onViewMaterial, ...handlers } = props;
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<StudyMaterialCategory | null>(null);
  const { t } = useLanguage();

  const handleModuleClick = (module: CourseModule) => setSelectedModule(module);
  const handleCategoryClick = (category: StudyMaterialCategory) => setSelectedCategory(category);

  const backToCourseList = (e: React.MouseEvent) => { e.preventDefault(); onBack(); };
  const backToModuleList = (e: React.MouseEvent) => { e.preventDefault(); setSelectedModule(null); setSelectedCategory(null); };
  const backToCategoryList = (e: React.MouseEvent) => { e.preventDefault(); setSelectedCategory(null); };

  const renderContent = () => {
    // Level 3: Materials View
    if (selectedModule && selectedCategory) {
      return (
        <>
          <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-blue-900">{selectedCategory.title}</h1>
          <div className="bg-white/30 backdrop-blur-lg border border-white/40 rounded-2xl p-4 sm:p-6 shadow-sm">
            <ul className="space-y-3">
              {(selectedCategory.materials || []).map((material) => (
                <StudyMaterialItem key={material.id} material={material} isTeacherOwner={isTeacherOwner}
                  onViewMaterial={onViewMaterial}
                  onEdit={() => handlers.onEditMaterial(selectedCategory.id, material)}
                  onDelete={() => { if (window.confirm(t('confirmDeleteMaterial'))) handlers.onDeleteMaterial(selectedCategory.id, material.id) }}/>
              ))}
            </ul>
            {(!selectedCategory.materials || selectedCategory.materials.length === 0) && (
              <p className="text-center text-blue-800 py-8">{t('noMaterialsInCategory')}</p>
            )}
             {isTeacherOwner && (
              <div className="mt-6 text-center">
                <button onClick={() => handlers.onAddMaterial(selectedCategory.id)} className="flex items-center gap-2 mx-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  <PlusIcon className="w-5 h-5" /> {t('addMaterial')}
                </button>
              </div>
            )}
          </div>
        </>
      );
    }
    
    // Level 2: Categories View
    if (selectedModule) {
      return (
        <>
         <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-blue-900">{selectedModule.title}</h1>
         {selectedModule.categories?.length === 0 && isTeacherOwner && (
            <p className="text-center text-blue-800 mb-6">{t('noCategoriesInModule')}</p>
         )}
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {(selectedModule.categories || []).map((category) => (
              <StudyMaterialCategoryCard key={category.id} category={category} onClick={() => handleCategoryClick(category)} isTeacherOwner={isTeacherOwner} 
                onEdit={() => handlers.onEditCategory(selectedModule.id, category)}
                onDelete={() => { if (window.confirm(t('confirmDeleteCategory'))) handlers.onDeleteCategory(selectedModule.id, category.id) }} />
            ))}
          </div>
           {isTeacherOwner && (
              <div className="mt-8 text-center">
                 <button onClick={() => handlers.onAddCategory(selectedModule.id)} className="flex items-center gap-2 mx-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  <PlusIcon className="w-5 h-5" /> {t('addCategory')}
                </button>
              </div>
            )}
        </>
      );
    }

    // Level 1: Modules View
    return (
      <>
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-blue-900">{course.title}</h1>
        {course.content?.length === 0 && isTeacherOwner && (
            <p className="text-center text-blue-800 mb-6">{t('noModulesInCourse')}</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {course.content.map((module) => (
            <CourseModuleCard key={module.id} module={module} onClick={() => handleModuleClick(module)} isTeacherOwner={isTeacherOwner}
              onEdit={() => handlers.onEditModule(module)}
              onDelete={() => { if (window.confirm(t('confirmDeleteModule'))) handlers.onDeleteModule(module.id) }}/>
          ))}
        </div>
         {isTeacherOwner && (
              <div className="mt-8 text-center">
                 <button onClick={handlers.onAddModule} className="flex items-center gap-2 mx-auto bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  <PlusIcon className="w-5 h-5" /> {t('addModule')}
                </button>
              </div>
          )}
      </>
    );
  }

  return (
    <div className="w-full text-blue-900 animate-fade-in">
      <header className="flex justify-between items-center mb-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-blue-800 bg-white/20 backdrop-blur-md p-2 rounded-lg flex-wrap border border-white/10">
            <li><a href="#" onClick={backToCourseList} className="flex items-center hover:text-blue-600"><HomeIcon className="h-4 w-4 mr-2" />{t('panel')}</a></li>
            <li><span className="text-blue-400">/</span></li>
            <li><a href="#" onClick={backToCourseList} className="hover:text-blue-600">{t('myCourses')}</a></li>
            <li><span className="text-blue-400">/</span></li>
            {selectedModule ? (
              <>
                <li><a href="#" onClick={backToModuleList} className="hover:text-blue-600 truncate max-w-[100px] sm:max-w-xs">{course.title}</a></li>
                <li><span className="text-blue-400">/</span></li>
                {selectedCategory ? (
                   <>
                    <li><a href="#" onClick={backToCategoryList} className="hover:text-blue-600 truncate max-w-[100px] sm:max-w-xs">{selectedModule.title}</a></li>
                    <li><span className="text-blue-400">/</span></li>
                    <li className="font-semibold text-blue-900 truncate max-w-[100px] sm:max-w-xs" aria-current="page">{selectedCategory.title}</li>
                   </>
                ) : ( <li className="font-semibold text-blue-900 truncate max-w-[100px] sm:max-w-xs" aria-current="page">{selectedModule.title}</li> )}
              </>
            ) : ( <li className="font-semibold text-blue-900 truncate max-w-[100px] sm:max-w-xs" aria-current="page">{course.title}</li> )}
          </ol>
        </nav>
        <button onClick={onBack} className="p-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 text-blue-900" aria-label={t('closeCourseDetails')}><XIcon className="h-5 w-5" /></button>
      </header>
      {renderContent()}
    </div>
  );
};

export default CourseDetail;