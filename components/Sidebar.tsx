import React, { useState, useMemo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, LinkIcon, PencilIcon, TrashIcon, PlusIcon, UserGroupIcon, AcademicCapIcon } from './icons';
import { useLanguage } from '../languageContext';
import { localeMap } from '../i18n';
import { SidebarLink as SidebarLinkType, CalendarEvent } from '../types';

interface SidebarProps {
  onShowCalendar: () => void;
  links: SidebarLinkType[];
  isTeacher: boolean;
  onAddLink: () => void;
  onEditLink: (link: SidebarLinkType) => void;
  onDeleteLink: (linkId: string) => void;
  calendarEvents: CalendarEvent[];
}

const Calendar: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { language, t } = useLanguage();
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleDayClick = (day: number) => {
        setSelectedDate(new Date(year, month, day));
    };

    const monthName = useMemo(() => currentDate.toLocaleString(localeMap[language], { month: 'long' }), [currentDate, language]);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const calendarGrid = [...Array(firstDayOfMonth).fill(null), ...daysArray];

    const today = new Date();
    const isToday = (day: number) => 
        day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
    
    const isSelected = (day: number) =>
        selectedDate && day === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear();
    
    const eventDays = useMemo(() => {
        const eventDates = events.map(event => new Date(event.date + 'T00:00:00'));
        return eventDates
            .filter(d => d.getFullYear() === year && d.getMonth() === month)
            .map(d => d.getDate());
    }, [events, year, month]);

    const isEvent = (day: number) => eventDays.includes(day);
    
    const weekDays = useMemo(() => {
        const formatter = new Intl.DateTimeFormat(localeMap[language], { weekday: 'short' });
        return Array.from({ length: 7 }, (_, i) => formatter.format(new Date(2023, 0, i + 1))); // Get days for a sample week
    }, [language]);


    return (
        <div className="text-white">
            <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-sm capitalize">{monthName} {year}</span>
                <div className="flex items-center">
                    <button onClick={handlePrevMonth} className="p-1 text-gray-300 hover:text-white" aria-label={t('previousMonth')}>
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <button onClick={handleNextMonth} className="p-1 text-gray-300 hover:text-white" aria-label={t('nextMonth')}>
                        <ChevronRightIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                {weekDays.map(day => <span key={day}>{day}</span>)}
            </div>
            <div className="grid grid-cols-7 text-center text-sm text-gray-200">
                {calendarGrid.map((day, index) => (
                    <div key={index} className="py-1 flex justify-center items-center">
                       {day ? (
                         <button 
                            onClick={() => handleDayClick(day)}
                            className={`
                                w-8 h-8 flex items-center justify-center rounded-full relative transition-colors
                                ${isSelected(day) ? 'bg-white text-gray-900' : 'hover:bg-white/20'}
                                ${isEvent(day) && !isSelected(day) ? 'font-bold' : ''}
                            `}>
                            {day}
                             {isEvent(day) && (
                               <span className={`absolute bottom-1 right-1 w-1.5 h-1.5 ${isSelected(day) ? 'bg-blue-600' : 'bg-blue-400'} rounded-full`}></span>
                             )}
                             {isToday(day) && !isSelected(day) && (
                                <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full"></span>
                             )}
                        </button>
                       ) : <div />}
                    </div>
                ))}
            </div>
        </div>
    );
}

const SidebarLink: React.FC<{ 
    link: SidebarLinkType; 
    isTeacher: boolean;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ link, isTeacher, onEdit, onDelete }) => {
    const { t } = useLanguage();
    const visibilityText = (!link.classrooms || link.classrooms.length === 0)
        ? t('allClassrooms')
        : `${t('classrooms')}: ${link.classrooms.join(', ')}`;
    const visibilityTextYears = (!link.years || link.years.length === 0)
        ? t('allYears')
        : `${t('years')}: ${link.years.map(y => `${y}º`).join(', ')}`;
        
    return (
        <div className="flex flex-col group">
            <div className="flex items-center">
                <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-gray-200 hover:text-blue-400 py-1.5 transition-colors group flex-grow min-w-0">
                    <div className="w-7 h-7 mr-3 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500 transition-colors">
                      <LinkIcon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="truncate font-medium">{link.text}</span>
                </a>
                {isTeacher && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0">
                        <button onClick={onEdit} className="p-1 text-gray-400 hover:text-white" aria-label="Edit Link"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-400" aria-label="Delete Link"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
            {isTeacher && (
                <div className="pl-10 -mt-1 space-y-0.5">
                    <div className="flex items-center gap-1 text-xs text-gray-500" title={visibilityText}>
                        <UserGroupIcon className="w-3 h-3"/>
                        <span className="truncate">{visibilityText}</span>
                    </div>
                     <div className="flex items-center gap-1 text-xs text-gray-500" title={visibilityTextYears}>
                        <AcademicCapIcon className="w-3 h-3"/>
                        <span className="truncate">{visibilityTextYears}</span>
                    </div>
                </div>
            )}
        </div>
    );
}


const Sidebar: React.FC<SidebarProps> = ({ onShowCalendar, links, isTeacher, onAddLink, onEditLink, onDeleteLink, calendarEvents }) => {
  const { t } = useLanguage();

  const handleDelete = (link: SidebarLinkType) => {
    if(window.confirm(`Tem certeza que quer deletar o link "${link.text}"?`)){
        onDeleteLink(link.id);
    }
  }

  return (
    <aside className="w-full space-y-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl">
            <Calendar events={calendarEvents} />
             <div className="text-center mt-4 border-t border-white/20 pt-3">
                <button onClick={onShowCalendar} className="text-sm text-blue-400 hover:underline font-medium">{t('fullCalendar')}</button>
            </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs text-gray-400 font-semibold uppercase">{t('sidebarNavLinks')}</h4>
                {isTeacher && (
                    <button onClick={onAddLink} className="flex items-center gap-1 text-xs bg-blue-600/80 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md transition-colors">
                        <PlusIcon className="w-3 h-3"/>
                        {t('add')}
                    </button>
                )}
            </div>
            <nav className="space-y-1">
                {links.map(link => (
                    <SidebarLink 
                        key={link.id} 
                        link={link} 
                        isTeacher={isTeacher}
                        onEdit={() => onEditLink(link)}
                        onDelete={() => handleDelete(link)}
                    />
                ))}
            </nav>
        </div>

    </aside>
  );
};

export default Sidebar;