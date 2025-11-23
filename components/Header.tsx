import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, BellIcon, ChevronDownIcon, MenuIcon, XIcon } from './icons';
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
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        if (!searchQuery) {
            setIsSearchVisible(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);
  
  const handleDismissNotification = (id: number) => {
      setNotifications(notifications.filter(n => n.id !== id));
  }
  
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  }

  const navItems = (
    <>
      {isTeacherView && (
        <button onClick={onShowUserManagement} className="text-sm text-blue-800 hover:text-blue-900 transition-colors p-2 md:p-0 font-medium">
          {t('manageUsers')}
        </button>
      )}
      <div ref={langRef} className="relative">
        <button onClick={() => setLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center gap-1 text-sm text-blue-800 hover:text-blue-900 transition-colors p-2 md:p-0 font-medium">
          <span role="img" aria-label="Translate icon">🌐</span>
          <span>{language.split('_')[0]}</span>
        </button>
        {isLangDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-32 bg-white/40 backdrop-blur-xl border border-white/30 rounded-lg shadow-xl py-1 z-20">
                <a href="#" onClick={(e) => { e.preventDefault(); handleLanguageChange('PT_BR'); }} className="block px-4 py-2 text-sm text-blue-900 hover:bg-white/30">{t('portuguese')}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLanguageChange('EN'); }} className="block px-4 py-2 text-sm text-blue-900 hover:bg-white/30">{t('english')}</a>
                <a href="#" onClick={(e) => { e.preventDefault(); handleLanguageChange('ES'); }} className="block px-4 py-2 text-sm text-blue-900 hover:bg-white/30">{t('spanish')}</a>
            </div>
        )}
      </div>

      <div ref={notificationsRef} className="relative flex items-center gap-4">
          <button onClick={() => setNotificationsOpen(!isNotificationsOpen)} className="text-blue-800 hover:text-blue-900 relative p-2 md:p-0">
              <BellIcon className="h-6 w-6" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 md:top-0 md:right-0 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 justify-center items-center text-white text-[10px]">{unreadNotificationsCount}</span>
                </span>
              )}
          </button>
          {isNotificationsOpen && (
             <div className="absolute top-full right-0 mt-2 w-80 bg-white/40 backdrop-blur-xl border border-white/30 rounded-lg shadow-xl z-20">
                <div className="p-3 border-b border-blue-100/30">
                    <h4 className="font-semibold text-blue-900">{t('notifications')}</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map(n => (
                            <div key={n.id} className={`flex items-start gap-3 p-3 text-sm border-b border-blue-100/30 ${n.read ? 'opacity-70' : ''}`}>
                                <div className="flex-grow">
                                    <p className="text-blue-900">{n.message}</p>
                                    <p className="text-xs text-blue-500 mt-1">{n.timestamp}</p>
                                </div>
                                <button onClick={() => handleDismissNotification(n.id)} className="p-1 text-blue-400 hover:text-blue-600" aria-label="Dispensar notificação">
                                    <XIcon className="h-4 w-4"/>
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-blue-500 p-6">{t('noNotifications')}</p>
                    )}
                </div>
             </div>
          )}
      </div>

      <div ref={profileRef} className="relative">
        <button onClick={() => setProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center gap-2 cursor-pointer p-1 rounded-lg hover:bg-white/20 transition-colors">
            {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="Profile" className="h-9 w-9 rounded-full object-cover border-2 border-white/40"/>
            ) : (
                <div className="h-9 w-9 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold text-lg border-2 border-white/40">
                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                </div>
            )}
            <span className="hidden md:inline text-sm font-medium text-blue-900">{user?.name}</span>
            <ChevronDownIcon className="h-4 w-4 text-blue-800" />
        </button>
        {isProfileDropdownOpen && (
             <div className="absolute top-full right-0 mt-2 w-48 bg-white/40 backdrop-blur-xl border border-white/30 rounded-lg shadow-xl py-1 z-20">
                <a href="#" onClick={(e) => { e.preventDefault(); onShowProfile(); setProfileDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-blue-900 hover:bg-white/30">{t('myProfile')}</a>
                {user?.role === 'teacher' && isTeacherView && (
                    <a href="#" onClick={(e) => { e.preventDefault(); onOpenSimulationModal(); setProfileDropdownOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-blue-900 hover:bg-white/30">{t('simulateStudentView')}</a>
                )}
                <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-white/30">{t('logout')}</a>
            </div>
        )}
      </div>
    </>
  );

  return (
    <header className="sticky top-0 z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div ref={searchRef} className="flex items-center flex-1 min-w-0">
             {isSearchVisible ? (
                <div className="relative w-full max-w-sm">
                    <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"/>
                    <input 
                        type="text"
                        placeholder={t('searchCourses')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-white/10 text-blue-900 rounded-lg pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/70 border border-white/20"
                        autoFocus
                    />
                     {searchQuery && (
                        <button onClick={() => onSearchChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600">
                            <XIcon className="h-4 w-4"/>
                        </button>
                    )}
                </div>
             ) : (
                <span className="font-bold text-lg text-blue-900">Matéria para Você</span>
             )}
          </div>
          
          <div className="flex items-center gap-4">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <button onClick={() => setIsSearchVisible(true)} className="text-blue-800 hover:text-blue-900 p-2 md:p-0">
                  <SearchIcon className="h-6 w-6" />
              </button>
              {navItems}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-blue-800 hover:text-blue-900"
                aria-label="Abrir menu"
                aria-expanded={isMenuOpen}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col items-start gap-4 pt-4 border-t border-white/20">
               <div className="relative w-full">
                    <SearchIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-blue-500"/>
                    <input 
                        type="text"
                        placeholder={t('searchCourses')}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                         className="w-full bg-white/10 text-blue-900 rounded-lg pl-10 pr-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-500/70 border border-white/20"
                    />
                </div>
               {navItems}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;