import React, { useState, useEffect } from 'react';
import { SidebarLink, Classroom, SchoolYear } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon } from '../icons';
import ClassroomSelector from '../ClassroomSelector';
import YearSelector from '../YearSelector';

interface SidebarLinkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<SidebarLink, 'id'>) => void;
  linkToEdit: SidebarLink | null;
}

const SidebarLinkFormModal: React.FC<SidebarLinkFormModalProps> = ({ isOpen, onClose, onSave, linkToEdit }) => {
    const { t } = useLanguage();
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [years, setYears] = useState<SchoolYear[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (linkToEdit) {
            setText(linkToEdit.text);
            setUrl(linkToEdit.url === '#' ? '' : linkToEdit.url);
            setClassrooms(linkToEdit.classrooms || []);
            setYears(linkToEdit.years || []);
        } else {
            setText('');
            setUrl('');
            setClassrooms([]);
            setYears([]);
        }
        setError('');
    }, [linkToEdit, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!text || !url) {
            setError(t('fieldRequired'));
            return;
        }
        setIsLoading(true);
        setTimeout(() => {
            onSave({ text, url, classrooms, years });
            setIsLoading(false);
        }, 500);
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-md shadow-2xl text-white max-h-[90vh] flex flex-col">
            <header className="flex justify-between items-center p-4 border-b border-white/20">
              <h2 className="text-lg font-bold">{linkToEdit ? t('editLink') : t('addLink')}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5" /></button>
            </header>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label htmlFor="link-text" className="block text-sm font-medium text-gray-200">{t('label')}</label>
                <input id="link-text" type="text" value={text} onChange={e => setText(e.target.value)} required
                       className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <div>
                <label htmlFor="link-url" className="block text-sm font-medium text-gray-200">{t('url')}</label>
                <input id="link-url" type="url" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://..."
                       className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
              </div>
              <ClassroomSelector selectedClassrooms={classrooms} onChange={setClassrooms} />
              <YearSelector selectedYears={years} onChange={setYears} />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">{t('cancel')}</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800">
                  {isLoading ? t(linkToEdit ? 'saving' : 'creating') : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
    );
};

export default SidebarLinkFormModal;