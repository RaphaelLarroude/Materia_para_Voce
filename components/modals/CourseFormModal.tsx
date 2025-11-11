import React, { useState, useEffect, useRef } from 'react';
import { Course, Classroom, SchoolYear } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon, BookOpenIcon, BeakerIcon, GlobeAltIcon, AcademicCapIcon, PaintBrushIcon, RunningIcon, PhotoIcon } from '../icons';
import { fileToBase64 } from '../../utils/file';
import ClassroomSelector from '../ClassroomSelector';
import YearSelector from '../YearSelector';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courseData: any) => void;
  courseToEdit: Course | null;
}

const icons = { BookOpenIcon, BeakerIcon, GlobeAltIcon, AcademicCapIcon, PaintBrushIcon, RunningIcon };
const iconNames = Object.keys(icons) as (keyof typeof icons)[];

const CourseFormModal: React.FC<CourseFormModalProps> = ({ isOpen, onClose, onSave, courseToEdit }) => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState(''); // Holds data URL
  const [iconName, setIconName] = useState<keyof typeof icons>(iconNames[0]);
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
      const name = (Object.keys(icons) as (keyof typeof icons)[]).find(
        (key) => icons[key] === courseToEdit.icon
      );
      if (name) setIconName(name);
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
      onSave({ title, imageUrl, icon: icons[iconName], classrooms, years });
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md shadow-2xl text-white max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-lg font-bold">{courseToEdit ? t('editCourse') : t('createCourseTitle')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="course-title" className="block text-sm font-medium text-gray-300">{t('courseTitle')}</label>
            <input id="course-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required
                   className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('courseImage')}</label>
            <div className="mt-1">
                {imageUrl ? (
                    <div className="relative group">
                        <img src={imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                            {t('changeImage')}
                        </button>
                    </div>
                ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="flex justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-gray-500">
                        <div className="space-y-1 text-center">
                            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="text-sm text-gray-400">{t('uploadFile')}</p>
                        </div>
                    </div>
                )}
                <input ref={fileInputRef} id="course-image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden"/>
            </div>
          </div>
          <div>
            <label htmlFor="course-icon" className="block text-sm font-medium text-gray-300">{t('courseIcon')}</label>
            <select id="course-icon" value={iconName} onChange={e => setIconName(e.target.value as keyof typeof icons)}
                    className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>{t('selectIcon')}</option>
                {iconNames.map(name => <option key={name} value={name}>{name.replace('Icon', '')}</option>)}
            </select>
          </div>
          <ClassroomSelector selectedClassrooms={classrooms} onChange={setClassrooms} />
          <YearSelector selectedYears={years} onChange={setYears} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">{t('cancel')}</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800">
              {isLoading ? t(courseToEdit ? 'saving' : 'creating') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;