import React, { useState } from 'react';
import { SchoolYear, Classroom } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon } from '../icons';

interface SimulationSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (year: SchoolYear, classroom: Classroom) => void;
}

const ALL_YEARS: SchoolYear[] = [6, 7, 8, 9];
const ALL_CLASSROOMS: Classroom[] = ['A', 'B', 'C', 'D', 'E'];

const SimulationSetupModal: React.FC<SimulationSetupModalProps> = ({ isOpen, onClose, onStart }) => {
  const { t } = useLanguage();
  const [year, setYear] = useState<SchoolYear | ''>('');
  const [classroom, setClassroom] = useState<Classroom | ''>('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year) {
      setError(t('yearRequired'));
      return;
    }
    if (!classroom) {
      setError(t('classroomRequired'));
      return;
    }
    onStart(year, classroom);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-white/20 rounded-2xl w-full max-w-sm shadow-2xl text-white">
        <header className="flex justify-between items-center p-4 border-b border-white/20">
          <h2 className="text-lg font-bold">{t('setupStudentSimulation')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10"><XIcon className="w-5 h-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="sim-year" className="block text-sm font-medium text-gray-200">{t('year')}</label>
            <select id="sim-year" value={year} onChange={e => setYear(Number(e.target.value) as SchoolYear)} required
              className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>{t('selectYearToSimulate')}</option>
              {ALL_YEARS.map(y => <option key={y} value={y}>{y}º {t('year')}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="sim-classroom" className="block text-sm font-medium text-gray-200">{t('classroom')}</label>
            <select id="sim-classroom" value={classroom} onChange={e => setClassroom(e.target.value as Classroom)} required
              className="mt-1 block w-full bg-black/20 text-white rounded-lg border-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="" disabled>{t('selectClassroomToSimulate')}</option>
              {ALL_CLASSROOMS.map(c => <option key={c} value={c}>{t('classroom')} {c}</option>)}
            </select>
          </div>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700">
              {t('startSimulation')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimulationSetupModal;