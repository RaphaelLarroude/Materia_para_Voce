
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, BellIcon, ChevronDownIcon, MenuIcon, XIcon, AppLogoIcon } from './icons';
import { Notification, Language, User } from '../types';
import { NOTIFICATIONS } from '../constants';
import { useLanguage } from '../languageContext';

interface HeaderProps {
    user: User | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onLogout: () => void;
    onShowUserManagement: () => void;
    onShowProfile: () => void;
    isTeacherView: boolean;
    onOpenSimulationModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, searchQuery, onSearchChange, onLogout, onShowUserManagement, onShowProfile, isTeacherView, onOpenSimulationModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isLangDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(NOTIFICATIONS);
  const { language, setLanguage, t } = useLanguage();

  const langRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) setLangDropdownOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) setNotificationsOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setProfileDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (!searchQuery) setIsSearchVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);
  
  const handleDismissNotification = (id: number) => setNotifications(notifications.filter(n => n.id !== id));
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  }

  const navItems = (
    <>
      {isTeacherView && (
        <button onClick={onShowUserManagement} className="text-sm text-blue-800 hover:text-blue-900 transition-colors p-3 md:p-0 font-black uppercase tracking-widest text-[10px] md:text-xs">
          {t('manageUsers')}
        </button>
      )}
      <div ref={langRef} className="relative">
        <button onClick={() => setLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center gap-1 text-sm text-blue-800 hover:text-blue-900 transition-colors p-3 md:p-0 font-bold">
          <span role="img" aria-label="Translate icon">🌐</span>
          <span className="uppercase text-[10px] md:text-sm">{language.split('_')[0]}</span>
        </button>
        {isLangDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white/90 backdrop-blur-xl border border-white/40 rounded-xl shadow-2xl py-1 z-20 overflow-hidden animate-fade-in-up">
                {['PT_BR', 'EN', 'ES'].map(l => (
                    <button key={l} onClick={() => handleLanguageChange(l as Language)} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase text-blue-900 hover:bg-blue-50 transition-colors tracking-widest">{l === 'PT_BR' ? 'Português' : l === 'EN' ? 'English' : 'Español'}</button>
                ))}
            </div>
        )}
      </div>

      <div ref={notificationsRef} className="relative flex items-center gap-4">
          <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="text-blue-800 hover:text-blue-900 relative p-3 md:p-0">
              <BellIcon className="h-6 w-6" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-2 right-2 md:top-0 md:right-0 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px] font-black">{unreadNotificationsCount}</span>
                </span>
              )}
          </button>
          {isNotificationsOpen && (
             <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl z-20 animate-fade-in-up overflow-hidden">
                <div className="p-4 border-b border-blue-100/50 bg-blue-50/30"><h4 className="font-black text-[10px] uppercase tracking-widest text-blue-900">{t('notifications')}</h4></div>
                <div className="max-h-80 overflow-y-auto no-scrollbar">
                    {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className="flex items-start gap-3 p-4 text-sm border-b border-blue-50 hover:bg-blue-50/20 transition-colors">
                            <div className="flex-grow min-w-0"><p className="text-blue-900 font-bold leading-snug">{n.message}</p><p className="text-[9px] font-black text-blue-300 uppercase mt-1">{n.timestamp}</p></div>
                            <button onClick={() => handleDismissNotification(n.id)} className="p-1 text-gray-300 hover:text-red-500 transition-colors"><XIcon className="h-4 w-4"/></button>
                        </div>
                    )) : <p className="text-center text-blue-300 font-bold uppercase tracking-widest text-[9px] p-8">{t('noNotifications')}</p>}
                </div>
             </div>
          )}
      </div>

      <div ref={profileRef} className="relative">
        <button onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-white/20 transition-colors">
            <div className="h-9 w-9 2xl:h-10 2xl:w-10 rounded-xl overflow-hidden border-2 border-white/40 shadow-sm flex-shrink-0">
                {user?.profilePictureUrl ? <img src={user.profilePictureUrl} alt="Profile" className="h-full w-full object-cover"/> : <div className="h-full w-full flex items-center justify-center bg-blue-600 text-white font-black text-lg">{user?.name?.charAt(0).toUpperCase()}</div>}
            </div>
            <span className="hidden lg:inline text-xs font-black text-blue-900 tracking-tight">{user?.name}</span>
            <ChevronDownIcon className="h-4 w-4 text-blue-400" />
        </button>
        {isProfileDropdownOpen && (
             <div className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl py-2 z-20 animate-fade-in-up overflow-hidden">
                <button onClick={() => { onShowProfile(); setProfileDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-900 hover:bg-blue-50 transition-colors">{t('myProfile')}</button>
                {user?.role === 'teacher' && isTeacherView && (
                    <button onClick={() => { onOpenSimulationModal(); setProfileDropdownOpen(false); }} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-blue-900 hover:bg-blue-50 transition-colors border-t border-blue-50">{t('simulateStudentView')}</button>
                )}
                <button onClick={onLogout} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-blue-50">{t('logout')}</button>
            </div>
        )}
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-40 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div ref={searchRef} className="flex items-center flex-1 min-w-0">
             {isSearchVisible ? (
                <div className="relative w-full max-w-sm animate-fade-in-up">
                    <SearchIcon className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"/>
                    <input type="text" placeholder={t('searchCourses')} value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} className="w-full bg-white/60 text-blue-900 rounded-2xl pl-11 pr-10 py-2.5 focus:outline-none focus:ring-4 focus:ring-blue-600/10 border border-white/60 shadow-inner font-bold text-sm" autoFocus />
                    {searchQuery && <button onClick={() => onSearchChange('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-900 transition-colors"><XIcon className="h-4 w-4"/></button>}
                </div>
             ) : (
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.href = '/'}>
                    <div className="w-9 h-9 md:w-10 md:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform"><AppLogoIcon className="w-6 h-6 md:w-7 md:h-7" /></div>
                    <div>
                        <span className="font-black text-sm md:text-lg 2xl:text-xl text-blue-900 block leading-none tracking-tighter whitespace-nowrap">Matéria para Você</span>
                        <span className="text-[7px] md:text-[9px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none hidden xs:block">Plataforma Digital</span>
                    </div>
                </div>
             )}
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 lg:gap-8">
            <div className="hidden md:flex items-center gap-4 lg:gap-6">{navItems}</div>
            <button onClick={() => setIsSearchVisible(!isSearchVisible)} className="p-2.5 text-blue-800 hover:bg-white/20 rounded-xl transition-all"><SearchIcon className="h-5 w-5 sm:h-6 sm:w-6" /></button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2.5 text-blue-800 hover:bg-white/20 rounded-xl transition-all"><MenuIcon className="h-6 w-6" /></button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden pb-6 animate-fade-in-up border-t border-white/10">
            <div className="flex flex-col items-center gap-3 pt-5">{navItems}</div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
