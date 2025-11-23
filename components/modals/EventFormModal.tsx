import React, { useState, useEffect } from 'react';
import { CalendarEvent, Course, Classroom, SchoolYear } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon } from '../icons';
import ClassroomSelector from '../ClassroomSelector';
import YearSelector from '../YearSelector';

interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<CalendarEvent, 'id'>) => void;
  eventToEdit: CalendarEvent | null;
  selectedDate: Date | null;
  courses: Course[];
}

const eventColors: CalendarEvent['color'][] = ['blue', 'green', 'purple', 'red', 'yellow', 'pink'];
const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
};

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, eventToEdit, selectedDate, courses }) => {
  const { t } = useLanguage();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [course, setCourse] = useState('');
  const [color, setColor] = useState<CalendarEvent['color']>('blue');
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [years, setYears] = useState<SchoolYear[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatDateForInput = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (eventToEdit) {
      setTitle(eventToEdit.title);
      setDescription(eventToEdit.description || '');
      setDate(eventToEdit.date);
      setCourse(eventToEdit.course);
      setColor(eventToEdit.color);
      setClassrooms(eventToEdit.classrooms || []);
      setYears(eventToEdit.years || []);
    } else if (selectedDate) {
      setTitle('');
      setDescription('');
      setDate(formatDateForInput(selectedDate));
      setCourse(t('noCourse'));
      setColor('blue');
      setClassrooms([]);
      setYears([]);
    }
     setError('');
  }, [eventToEdit, selectedDate, isOpen, t]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
      setError(t('fieldRequired'));
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      onSave({ title, date, course, color, description, classrooms, years });
      setIsLoading(false);
    }, 500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 rounded-2xl w-full max-w-md shadow-2xl text-blue-900 max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b border-blue-100/50">
          <h2 className="text-lg font-bold">{eventToEdit ? t('editEvent') : t('addEvent')}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/30 text-blue-500 hover:text-blue-800"><XIcon className="w-5 h-5" /></button>
        </header>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label htmlFor="event-title" className="block text-sm font-medium text-blue-800">{t('eventTitle')}</label>
            <input id="event-title" type="text" value={title} onChange={e => setTitle(e.target.value)} required
                   className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
          </div>
           <div>
            <label htmlFor="event-description" className="block text-sm font-medium text-blue-800">{t('description')}</label>
            <textarea
                id="event-description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
                <label htmlFor="event-date" className="block text-sm font-medium text-blue-800">{t('date')}</label>
                <input id="event-date" type="date" value={date} onChange={e => setDate(e.target.value)} required
                       className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            </div>
          </div>
          <div>
            <label htmlFor="event-course" className="block text-sm font-medium text-blue-800">{t('course')}</label>
            <select id="event-course" value={course} onChange={e => setCourse(e.target.value)}
                    className="mt-1 block w-full bg-white/30 text-blue-900 rounded-lg border border-blue-200/50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={t('noCourse')}>{t('noCourse')}</option>
                {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800">{t('color')}</label>
            <div className="mt-2 flex gap-3">
              {eventColors.map(c => (
                <button type="button" key={c} onClick={() => setColor(c)}
                        className={`w-8 h-8 rounded-full ${colorClasses[c]} ${color === c ? 'ring-2 ring-offset-2 ring-offset-white ring-blue-500' : 'opacity-70 hover:opacity-100'}`}
                        aria-label={`Select color ${c}`}></button>
              ))}
            </div>
          </div>
          <ClassroomSelector selectedClassrooms={classrooms} onChange={setClassrooms} />
          <YearSelector selectedYears={years} onChange={setYears} />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-blue-100/50">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-blue-100/50 hover:bg-blue-200/50 text-blue-900 transition-colors">{t('cancel')}</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 disabled:bg-blue-800 disabled:text-gray-300 transition-all">
              {isLoading ? t(eventToEdit ? 'saving' : 'creating') : t('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;