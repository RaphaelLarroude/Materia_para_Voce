import React, { useState, useEffect, useRef } from 'react';
import { Course, Classroom, SchoolYear } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon, PhotoIcon, IconMap, IconName } from '../icons';
import { fileToBase64 } from '../../utils/file';
import ClassroomSelector from '../ClassroomSelector';
import YearSelector from '../YearSelector';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courseData: any) => void;
  courseToEdit: Course | null;
}

const iconNames = Object.keys(IconMap) as IconName[];

const CourseFormModal: React.FC<CourseFormModalProps> = ({ isOpen, onClose, onSave, courseToEdit }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Holds data URL
  const [iconName, setIconName] = useState<IconName>(iconNames[0]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t } = useLanguage();

  useEffect(() => {
    if (courseToEdit) {
      setTitle(courseToEdit.title);
      setImageUrl(courseToEdit.imageUrl);
      setClassrooms(courseToEdit.classrooms || []);
      setYears(courseToEdit.years || []);
      setIconName(courseToEdit.icon as IconName);
    } else {
      setTitle('');
      setImageUrl('');
      setClassrooms([]);
      setYears([]);
      setIconName(iconNames[0]);
    }
    setError('');
  }, [courseToEdit, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64 = await fileToBase64(file);
        setImageUrl(base64);
      } catch (err) {
        setError('Failed to read file.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
        setError(t('fieldRequired'));
        return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onSave({ title, imageUrl, icon: iconName, classrooms, years });
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl w-full max-w-md shadow-2xl text-blue-900 max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-blue-100/50">
          <h2 className="text-lg font-bold">{courseToEdit ? t('editCourse') : t('createCourseTitle')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/30 text-blue-500 hover:text-blue-800"><XIcon className="w-5 h-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="course-title" className="block text-sm font-medium text-blue-800">{t('courseTitle')}</label>
            <input id="course-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required
                   className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800">{t('courseImage')}</label>
            <div className="mt-1">
                {imageUrl ? (
                    <div className="relative group">
                        <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg shadow-sm border border-blue-200/50" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-medium rounded-lg">
                            {t('changeImage')}
                        </button>
                    </div>
                ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="flex justify-center w-full px-6 pt-5 pb-6 border-2 border-blue-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-white/20 transition-colors">
                        <div className="space-y-1 text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-blue-400" />
                            <p className="text-sm text-blue-500">{t('uploadFile')}</p>
                        </div>
                    </div>
                )}
                <input ref={fileInputRef} id="course-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
            </div>
          </div>
          <div>
            <label htmlFor="course-icon" className="block text-sm font-medium text-blue-800">{t('courseIcon')}</label>
            <select id="course-icon" value={iconName} onChange={e => setIconName(e.target.value as IconName)}
                    className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>{t('selectIcon')}</option>
                {iconNames.map(name => <option key={name} value={name}>{name.replace('Icon', '')}</option>)}
            </select>
          </div>
          <ClassroomSelector selectedClassrooms={classrooms} onChange={setClassrooms} />
          <YearSelector selectedYears={years} onChange={setYears} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-blue-100/50">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-100/50 hover:bg-blue-200/50 text-blue-900 transition-colors">{t('cancel')}</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 disabled:bg-blue-800 disabled:text-gray-300 transition-all">
              {isLoading ? t(courseToEdit ? 'saving' : 'creating') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;