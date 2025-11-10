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
        // Can't reconstruct the file, but can show its name
        setLink('');
        setFile(null); // Reset file input
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
            } else { // Editing but not changing file
                dataToSave = { ...materialToEdit!, title, classrooms, years };
            }
        } else { // type is 'link'
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md shadow-2xl text-white max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-lg font-bold">{materialToEdit ? t('editMaterial') : t('createMaterial')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="mat-title" className="block text-sm font-medium text-gray-300">{t('materialTitle')}</label>
            <input id="mat-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required
                   className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">{t('uploadType')}</label>
            <div className="mt-1 flex rounded-lg bg-black/20 p-1">
                <button type="button" onClick={() => setUploadType('file')} className={`w-1/2 py-1.5 text-sm rounded-md transition-colors ${uploadType === 'file' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>{t('file')}</button>
                <button type="button" onClick={() => setUploadType('link')} className={`w-1/2 py-1.5 text-sm rounded-md transition-colors ${uploadType === 'link' ? 'bg-blue-600' : 'hover:bg-white/10'}`}>{t('link')}</button>
            </div>
          </div>

          {uploadType === 'file' ? (
             <div>
                <label htmlFor="mat-file" className="block text-sm font-medium text-gray-300">{t('uploadFile')}</label>
                <div className="mt-1 flex items-center justify-center w-full px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                   <div className="text-center">
                    <DocumentIcon className="mx-auto h-10 w-10 text-gray-500" />
                    <label htmlFor="mat-file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>{file ? file.name : t('uploadFile')}</span>
                        <input id="mat-file-upload" name="mat-file-upload" type="file" onChange={handleFileChange} className="sr-only" />
                    </label>
                    {materialToEdit && !file && <p className="text-xs text-gray-400">{t('changeImage')}: {materialToEdit.fileName}</p>}
                   </div>
                </div>
             </div>
          ) : (
            <div>
                <label htmlFor="mat-link" className="block text-sm font-medium text-gray-300">{t('linkUrl')}</label>
                <input id="mat-link" type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." required
                       className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          )}
          
          <ClassroomSelector selectedClassrooms={classrooms} onChange={setClassrooms} />
          <YearSelector selectedYears={years} onChange={setYears} />

           {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">{t('cancel')}</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800">
              {isLoading ? t(materialToEdit ? 'saving' : 'creating') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialFormModal;