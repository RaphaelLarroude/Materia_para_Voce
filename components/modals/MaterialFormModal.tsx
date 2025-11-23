import React, { useState, useEffect } from 'react';
import { StudyMaterial, Classroom, SchoolYear } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon, DocumentIcon } from '../icons';
import { fileToBase64 } from '../../utils/file';
import ClassroomSelector from '../ClassroomSelector';
import YearSelector from '../YearSelector';

interface MaterialFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<StudyMaterial, 'id'> & { id?: string }) => Promise<void>;
  materialToEdit: StudyMaterial | null;
}

const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ isOpen, onClose, onSave, materialToEdit }) => {
  const [title, setTitle] = useState('');
  const [uploadType, setUploadType] = useState<StudyMaterial['type']>('file');
  const [file, setFile] = useState<File | null>(null);
  const [link, setLink] = useState('');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (materialToEdit) {
      setTitle(materialToEdit.title);
      setUploadType(materialToEdit.type);
      setClassrooms(materialToEdit.classrooms || []);
      setYears(materialToEdit.years || []);
      if (materialToEdit.type === 'link') {
        setLink(materialToEdit.content);
        setFile(null);
      } else {
        setLink('');
        setFile(null);
      }
    } else {
      setTitle('');
      setUploadType('file');
      setFile(null);
      setLink('');
      setClassrooms([]);
      setYears([]);
    }
    setError('');
  }, [materialToEdit, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
        setError(t('fieldRequired'));
        return;
    }
    
    setIsLoading(true);
    setError('');

    try {
        let dataToSave: Omit<StudyMaterial, 'id'> & { id?: string };

        if (uploadType === 'file') {
            if (!file && !materialToEdit) {
                 setError(t('selectFileOrLink'));
                 setIsLoading(false);
                 return;
            }
            if(file){
                const content = await fileToBase64(file);
                dataToSave = { title, type: 'file', content, fileName: file.name, fileType: file.type, classrooms, years };
            } else {
                dataToSave = { ...materialToEdit!, title, classrooms, years };
            }
        } else {
            if (!link) {
                setError(t('selectFileOrLink'));
                setIsLoading(false);
                return;
            }
            dataToSave = { title, type: 'link', content: link, classrooms, years };
        }
        
        if (materialToEdit) dataToSave.id = materialToEdit.id;

        await onSave(dataToSave);

    } catch (err: any) {
      const errorMessageKey = err.message || 'fileProcessingError';
      const translatedMessage = t(errorMessageKey);
      setError(translatedMessage === errorMessageKey ? t('fileProcessingError') : translatedMessage);
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl w-full max-w-md shadow-2xl text-blue-900 max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-blue-100/50">
          <h2 className="text-lg font-bold">{materialToEdit ? t('editMaterial') : t('createMaterial')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/30 text-blue-500 hover:text-blue-800"><XIcon className="w-5 h-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="mat-title" className="block text-sm font-medium text-blue-800">{t('materialTitle')}</label>
            <input id="mat-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required
                   className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800">{t('uploadType')}</label>
            <div className="mt-1 flex rounded-lg bg-blue-50/50 p-1 border border-blue-200/50">
                <button type="button" onClick={() => setUploadType('file')} className={`w-1/2 py-1.5 text-sm rounded-md transition-colors ${uploadType === 'file' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-600 hover:bg-white/50'}`}>{t('file')}</button>
                <button type="button" onClick={() => setUploadType('link')} className={`w-1/2 py-1.5 text-sm rounded-md transition-colors ${uploadType === 'link' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-600 hover:bg-white/50'}`}>{t('link')}</button>
            </div>
          </div>

          {uploadType === 'file' ? (
             <div>
                <label htmlFor="mat-file" className="block text-sm font-medium text-blue-800">{t('uploadFile')}</label>
                <div className="mt-1 flex items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-blue-300 border-dashed rounded-lg hover:bg-white/20 transition-colors">
                   <div className="text-center">
                    <DocumentIcon className="mx-auto h-10 w-10 text-blue-400" />
                    <label htmlFor="mat-file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>{file ? file.name : t('uploadFile')}</span>
                        <input id="mat-file-upload" name="mat-file-upload" type="file" onChange={handleFileChange} className="sr-only" />
                    </label>
                    {materialToEdit && !file && <p className="text-xs text-blue-500">{t('changeImage')}: {materialToEdit.fileName}</p>}
                   </div>
                </div>
             </div>
          ) : (
            <div>
                <label htmlFor="mat-link" className="block text-sm font-medium text-blue-800">{t('linkUrl')}</label>
                <input id="mat-link" type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." required
                       className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          )}
          
          <ClassroomSelector selectedClassrooms={classrooms} onChange={setClassrooms} />
          <YearSelector selectedYears={years} onChange={setYears} />

           {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-blue-100/50">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-100/50 hover:bg-blue-200/50 text-blue-900 transition-colors">{t('cancel')}</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 disabled:bg-blue-800 disabled:text-gray-300 transition-all">
              {isLoading ? t(materialToEdit ? 'saving' : 'creating') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialFormModal;