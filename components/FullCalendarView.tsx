import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XIcon, ClockIcon, PlusIcon, PencilIcon, TrashIcon, UserGroupIcon, AcademicCapIcon } from './icons';
import { CalendarEvent, Course } from '../types';
import { useLanguage } from '../languageContext';
import { localeMap } from '../i18n';

interface FullCalendarViewProps {
  onClose: () => void;
  events: CalendarEvent[];
  isTeacher: boolean;
  courses: Course[];
  onAddEvent: (date: Date) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

const eventColorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
};

const FullCalendarView: React.FC<FullCalendarViewProps> = ({ onClose, events, isTeacher, courses, onAddEvent, onEditEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { language, t } = useLanguage();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleDayClick = (day: number) => setSelectedDate(new Date(year, month, day));

  const monthName = useMemo(() => currentDate.toLocaleString(localeMap[language], { month: 'long' }), [currentDate, language]);
  
  const weekDays = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(localeMap[language], { weekday: 'short' });
    return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2023, 0, i + 1)));
  }, [language]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const calendarGrid = [...Array(firstDayOfMonth).fill(null), ...daysArray];
  
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const isSelected = (day: number) =>
    day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEvent[]>();
    events.forEach(event => {
      const eventDate = new Date(event.date + 'T00:00:00');
      if (eventDate.getFullYear() === year && eventDate.getMonth() === month) {
        const day = eventDate.getDate();
        if (!map.has(day)) map.set(day, []);
        map.get(day)?.push(event);
      }
    });
    return map;
  }, [year, month, events]);

  const selectedDayEvents = useMemo(() => {
    const dateString = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
    return events.filter(event => event.date === dateString);
  }, [selectedDate, events]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="calendar-title">
      <div className="bg-white/10 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
        <div className="w-full md:w-3/5 p-6 flex flex-col">
          <header className="flex justify-between items-center mb-6">
            <h2 id="calendar-title" className="text-xl font-bold text-white capitalize">{monthName} {year}</h2>
            <div className="flex items-center gap-2">
              <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-white/20" aria-label={t('previousMonth')}>
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-white/20" aria-label={t('nextMonth')}>
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-7 text-center text-xs text-gray-200 mb-2">
            {weekDays.map(day => <span key={day}>{day}</span>)}
          </div>
          <div className="grid grid-cols-7 flex-grow">
            {calendarGrid.map((day, index) => (
              <div key={index} className="border-t border-r border-white/10 p-1 flex flex-col">
                {day && (
                  <button
                    onClick={() => handleDayClick(day)}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-full mx-auto transition-colors text-sm
                      ${isSelected(day) ? 'bg-white text-gray-900 font-bold' : 'hover:bg-white/20'}
                      ${isToday(day) && !isSelected(day) ? 'border-2 border-blue-400' : ''}
                      ${!isToday(day) && !isSelected(day) ? 'text-white' : ''}
                    `}
                  >
                    {day}
                  </button>
                )}
                <div className="flex justify-center items-center gap-1 mt-1">
                    {day && eventsByDay.get(day)?.slice(0, 3).map(event => (
                        <div key={event.id} className={`w-1.5 h-1.5 rounded-full ${eventColorClasses[event.color]}`}></div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full md:w-2/5 bg-black/20 p-6 flex flex-col border-t md:border-t-0 md:border-l border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-white">
                {t('eventsFor')} <span className="text-blue-300">{selectedDate.toLocaleDateString(localeMap[language], { day: '2-digit', month: 'long' })}</span>
              </h3>
               {isTeacher && (
                  <button onClick={() => onAddEvent(selectedDate)} className="flex items-center gap-1 text-xs bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md transition-colors">
                      <PlusIcon className="w-3 h-3"/> {t('addEvent')}
                  </button>
              )}
            </div>
            <div className="overflow-y-auto flex-grow pr-2 -mr-2">
              {selectedDayEvents.length > 0 ? (
                <ul className="space-y-3">
                  {selectedDayEvents.map(event => {
                    const visibilityText = (!event.classrooms || event.classrooms.length === 0)
                      ? t('allClassrooms')
                      : `${t('classrooms')}: ${event.classrooms.join(', ')}`;
                    const visibilityTextYears = (!event.years || event.years.length === 0)
                      ? t('allYears')
                      : `${t('years')}: ${event.years.map(y => `${y}º`).join(', ')}`;
                    return (
                      <li key={event.id} className={`relative group p-4 rounded-lg border-l-4 ${eventColorClasses[event.color].replace('bg', 'border')} bg-white/5`}>
                        <p className="font-semibold text-white">{event.title}</p>
                        {event.description && <p className="text-sm text-gray-200 mt-1 break-words">{event.description}</p>}
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-xs text-gray-200">{event.course}</p>
                            {isTeacher && (
                                <div className="flex flex-col items-end gap-1 text-xs text-gray-400">
                                    <div className="flex items-center gap-1.5" title={visibilityText}>
                                        <UserGroupIcon className="w-3.5 h-3.5" />
                                        <span className="truncate">{visibilityText}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5" title={visibilityTextYears}>
                                        <AcademicCapIcon className="w-3.5 h-3.5" />
                                        <span className="truncate">{visibilityTextYears}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {isTeacher && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onEditEvent(event)} className="p-1.5 bg-blue-600/80 rounded-full hover:bg-blue-500" aria-label={t('edit')}><PencilIcon className="w-3 h-3 text-white" /></button>
                                <button onClick={() => onDeleteEvent(event.id)} className="p-1.5 bg-red-600/80 rounded-full hover:bg-red-500" aria-label={t('delete')}><TrashIcon className="w-3 h-3 text-white" /></button>
                            </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-300">
                    <ClockIcon className="w-10 h-10 mb-2" />
                    <p>{t('noEventsForDay')}</p>
                </div>
              )}
            </div>
        </div>
      </div>
       <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-colors"
        aria-label={t('closeCalendar')}
      >
        <XIcon className="h-5 w-5" />
      </button>
    </div>
  );
};

export default FullCalendarView;