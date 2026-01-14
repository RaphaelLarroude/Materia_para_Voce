
import React, { useState, useMemo, useEffect } from 'react';
import { Course, User, StoredUser, CourseModule, StudyMaterialCategory, StudyMaterial, SidebarLink, CalendarEvent, Classroom, SchoolYear } from './types';
import CourseCard from './components/CourseCard';
import CourseDetail from './components/CourseDetail';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FullCalendarView from './components/FullCalendarView';
import Auth from './components/Auth';
import UserManagement from './components/UserManagement';
import CourseFormModal from './components/modals/CourseFormModal';
import ModuleFormModal from './components/modals/ModuleFormModal';
import CategoryFormModal from './components/modals/CategoryFormModal';
import MaterialFormModal from './components/modals/MaterialFormModal';
import SidebarLinkFormModal from './components/modals/SidebarLinkFormModal';
import EventFormModal from './components/modals/EventFormModal';
import ProfileModal from './components/modals/ProfileModal';
import SimulationBanner from './components/SimulationBanner';
import FilePreviewModal from './components/modals/FilePreviewModal';
import SimulationSetupModal from './components/modals/SimulationSetupModal';
import Footer from './components/Footer';
import StudyPlanner from './components/StudyPlanner';
import { useLanguage } from './languageContext';
import { getUsers, saveUsers, simpleHash } from './utils/auth';
import { getCourses, saveCourses } from './utils/course';
import { getLinks, saveLinks } from './utils/links';
import { getEvents, saveEvents } from './utils/calendar';
import { generateId } from './utils/auth';
import { PlusIcon, SparklesIcon, PinFilledIcon } from './components/icons';
import LandingPage from './components/LandingPage';
import AIChat from './components/AIChat';

const isItemVisibleToStudent = (item: { classrooms?: Classroom[], years?: SchoolYear[] }, student: User | null): boolean => {
    if (!student || student.role !== 'student') return true;
    const isClassroomVisible = !item.classrooms || item.classrooms.length === 0 || item.classrooms.includes(student.classroom);
    const isYearVisible = !item.years || item.years.length === 0 || item.years.includes(student.year);
    return isClassroomVisible && isYearVisible;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sidebarLinks, setSidebarLinks] = useState<SidebarLink[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false);
  const [isStudyPlannerOpen, setIsStudyPlannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [simulationContext, setSimulationContext] = useState<{ year: SchoolYear, classroom: Classroom } | null>(null);

  // Modal states
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StudyMaterialCategory | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isSidebarLinkModalOpen, setIsSidebarLinkModalOpen] = useState(false);
  const [editingSidebarLink, setEditingSidebarLink] = useState<SidebarLink | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<StudyMaterial | null>(null);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  // Pinned Schedule
  const [pinnedSchedule, setPinnedSchedule] = useState<{blocks: any[], theme: string} | null>(null);

  const { t } = useLanguage();

  useEffect(() => {
    const init = () => {
      const allUsers = getUsers();
      const allCourses = getCourses();
      const allLinks = getLinks();
      const allEvents = getEvents();
      
      setUsers(allUsers);
      setCourses(allCourses);
      setSidebarLinks(allLinks);
      setCalendarEvents(allEvents);

      const savedPin = localStorage.getItem('mpv_pinned_schedule');
      if (savedPin) {
          try { setPinnedSchedule(JSON.parse(savedPin)); } catch (e) { console.error(e); }
      }

      const savedUserStr = localStorage.getItem('mpv_current_user');
      if (savedUserStr) {
          try {
              const cached = JSON.parse(savedUserStr);
              const freshUser = allUsers.find(u => u.email === cached.email);
              if (freshUser) {
                  const { passwordHash, ...userSession } = freshUser;
                  setCurrentUser(userSession);
              } else {
                  setCurrentUser(cached);
              }
          } catch (e) { console.error(e); }
      }
      setIsDataLoaded(true);
    };
    init();
  }, []);

  const updateUsers = (updatedUsers: StoredUser[]) => { setUsers(updatedUsers); saveUsers(updatedUsers); }
  const handleUpdateUser = (updatedUser: StoredUser) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    updateUsers(updated);
  };
  const handleDeleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    updateUsers(updated);
  };

  const updateCourses = (updatedCourses: Course[]) => { setCourses(updatedCourses); saveCourses(updatedCourses); }
  const updateLinks = (updatedLinks: SidebarLink[]) => { setSidebarLinks(updatedLinks); saveLinks(updatedLinks); }
  const updateEvents = (updatedEvents: CalendarEvent[]) => { setCalendarEvents(updatedEvents); saveEvents(updatedEvents); };

  const handlePinSchedule = (blocks: any[], theme: string) => {
    const pinData = { blocks, theme };
    setPinnedSchedule(pinData);
    localStorage.setItem('mpv_pinned_schedule', JSON.stringify(pinData));
    setIsStudyPlannerOpen(false);
  };

  const isTeacherView = !simulationContext && currentUser?.role === 'teacher';
  const viewingUser = useMemo(() => {
      if (simulationContext && currentUser) {
          return { ...currentUser, role: 'student', year: simulationContext.year, classroom: simulationContext.classroom } as User;
      }
      return currentUser;
  }, [currentUser, simulationContext]);

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      localStorage.setItem('mpv_current_user', JSON.stringify(user));
  };
  const handleLogout = () => { 
      setCurrentUser(null); 
      setSimulationContext(null); 
      setSelectedCourse(null);
      localStorage.removeItem('mpv_current_user');
  };

  const handleSaveProfile = (updatedData: Partial<User>, passwordData?: { current: string, new: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!currentUser) return reject(new Error("No user"));
        const userToUpdate = users.find(u => u.id === currentUser.id);
        if (!userToUpdate) return reject(new Error("User not found"));
        let updatedUser = { ...userToUpdate, ...updatedData };
        if (passwordData && passwordData.current && passwordData.new) {
            if (simpleHash(passwordData.current) !== userToUpdate.passwordHash) return reject(new Error(t('currentPasswordIncorrect')));
            updatedUser.passwordHash = simpleHash(passwordData.new);
        }
        const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        updateUsers(updatedUsers);
        const { passwordHash, ...userForSession } = updatedUser;
        setCurrentUser(userForSession);
        localStorage.setItem('mpv_current_user', JSON.stringify(userForSession));
        resolve();
    });
  }

  const handleSaveCourse = (courseData: any) => {
    if (!currentUser) return;
    if (editingCourse) {
      updateCourses(courses.map(c => c.id === editingCourse.id ? { ...c, ...courseData } : c));
    } else {
      const newCourse: Course = { ...courseData, id: generateId(), teacher: currentUser.name, teacherId: currentUser.id, content: [], status: t('notStartedYet'), progress: 0 };
      updateCourses([...courses, newCourse]);
    }
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  }

  const handleSelectCourse = (course: Course) => {
    if (viewingUser?.role === 'student') {
        const filteredCourse = {
            ...course,
            content: course.content
                .filter(module => isItemVisibleToStudent(module, viewingUser))
                .map(module => ({
                    ...module,
                    categories: module.categories
                        .filter(category => isItemVisibleToStudent(category, viewingUser))
                        .map(category => ({
                            ...category,
                            materials: category.materials.filter(material => isItemVisibleToStudent(material, viewingUser))
                        }))
                }))
        };
        setSelectedCourse(filteredCourse);
    } else { setSelectedCourse(course); }
  };

  const filteredCourses = useMemo(() => {
    const baseCourses = (currentUser?.role === 'teacher' && !simulationContext)
      ? courses.filter(c => c.teacherId === currentUser.id)
      : courses.filter(course => isItemVisibleToStudent(course, viewingUser));
    if (!searchQuery) return baseCourses;
    return baseCourses.filter(course => course.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery, courses, currentUser, simulationContext, viewingUser]);
  
  const visibleSidebarLinks = useMemo(() => sidebarLinks.filter(link => isItemVisibleToStudent(link, viewingUser)), [sidebarLinks, viewingUser]);
  const visibleCalendarEvents = useMemo(() => calendarEvents.filter(event => isItemVisibleToStudent(event, viewingUser)), [calendarEvents, viewingUser]);

  if (!isDataLoaded) return <div className="fixed inset-0 flex items-center justify-center bg-blue-900 text-white font-black">MATÉRIA PARA VOCÊ...</div>;
  if (!currentUser) return <LandingPage onLoginSuccess={handleLogin} />;
  
  const dashboardTitle = simulationContext ? t('studentDashboardSimulation') : (currentUser.role === 'teacher' ? t('teacherDashboard') : t('myCoursesAsStudent'));

  return (
    <div className="min-h-screen font-sans text-blue-900 flex flex-col print:p-0">
      {simulationContext && <SimulationBanner onExit={() => setSimulationContext(null)} simulationContext={simulationContext} />}
      <div className="print:hidden">
          <Header 
            user={currentUser} searchQuery={searchQuery} onSearchChange={setSearchQuery} onLogout={handleLogout}
            onShowUserManagement={() => setIsUserManagementVisible(true)} onShowProfile={() => setIsProfileModalOpen(true)}
            isTeacherView={isTeacherView} onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
          />
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex-grow">
        {!selectedCourse ? (
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8 lg:gap-12">
            <main className="flex-1 py-6 md:py-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 print:hidden">
                <h1 className="text-3xl md:text-4xl 2xl:text-5xl font-black text-blue-900 tracking-tighter">
                  {dashboardTitle}
                </h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    {!isTeacherView && (
                        <button onClick={() => setIsStudyPlannerOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-black py-3 px-8 rounded-2xl hover:shadow-2xl transition-all active:scale-95 shadow-xl shadow-blue-200">
                            <SparklesIcon className="w-5 h-5"/> {t('studyPlanner')}
                        </button>
                    )}
                    {isTeacherView && (
                      <button onClick={() => setIsCourseModalOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white font-black py-3 px-8 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-200">
                          <PlusIcon className="w-5 h-5"/> {t('createCourse')}
                      </button>
                    )}
                </div>
              </div>

              {/* Hub de Cronograma - Posicionamento Centralizado e Refinado */}
              {pinnedSchedule && !isTeacherView && !searchQuery && (
                  <div className="mb-12 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[3rem] p-6 sm:p-10 shadow-2xl relative overflow-hidden group transition-all duration-500 print:hidden mx-auto max-w-7xl">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-blue-100 pb-6">
                          <div className="flex items-center gap-5">
                              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                                  <PinFilledIcon className="w-7 h-7" />
                              </div>
                              <div>
                                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-blue-900 leading-none">Meu Painel Semanal</h2>
                                <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mt-1">Organização em Tempo Real</p>
                              </div>
                          </div>
                          <button onClick={() => setIsStudyPlannerOpen(true)} className="text-blue-600 font-black hover:bg-blue-50 px-6 py-2.5 rounded-full border border-blue-200 transition-all text-xs uppercase tracking-widest bg-white/50">Abrir Planejador</button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 lg:gap-5">
                          {['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'].map(day => (
                             <div key={day} className="bg-white/60 p-4 rounded-3xl border border-white shadow-lg shadow-blue-900/5 hover:scale-[1.02] transition-transform">
                                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 border-b border-blue-50 pb-2">{day}</p>
                                <div className="space-y-2 min-h-[60px]">
                                    {pinnedSchedule.blocks.filter(b => b.day.includes(day)).slice(0, 2).map(b => (
                                        <div key={b.id} className="text-[9px] font-black text-blue-900 truncate bg-blue-50/50 px-2.5 py-2 rounded-xl border border-white shadow-sm">
                                            <span className="text-blue-400 mr-1.5">{b.startTime}</span>
                                            {b.activity}
                                        </div>
                                    ))}
                                    {pinnedSchedule.blocks.filter(b => b.day.includes(day)).length === 0 && (
                                        <div className="h-full flex items-center justify-center opacity-20">
                                            <div className="w-1 h-1 bg-blue-300 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                             </div>
                          ))}
                      </div>
                  </div>
              )}

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onClick={handleSelectCourse} 
                      isTeacherOwner={isTeacherView && course.teacherId === currentUser.id}
                      onEdit={() => { setEditingCourse(course); setIsCourseModalOpen(true); }}
                      onDelete={(c) => updateCourses(courses.filter(i => i.id !== c.id))}
                    />
                  ))}
                </div>
              ) : (
                 <div className="text-center py-24 bg-white/20 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-white/40 print:hidden">
                    <div className="w-20 h-20 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <SparklesIcon className="w-10 h-10 text-blue-400" />
                    </div>
                    <p className="text-blue-400 font-black uppercase tracking-widest text-sm">{t('noCoursesCreated')}</p>
                 </div>
              )}
            </main>
            <aside className="shrink-0 py-6 md:py-10 w-full lg:w-72 xl:w-80 print:hidden">
               <Sidebar 
                  onShowCalendar={() => setIsCalendarVisible(true)} links={visibleSidebarLinks} isTeacher={isTeacherView}
                  onAddLink={() => { setEditingSidebarLink(null); setIsSidebarLinkModalOpen(true); }}
                  onEditLink={setEditingSidebarLink} onDeleteLink={(id) => updateLinks(sidebarLinks.filter(l => l.id !== id))}
                  calendarEvents={visibleCalendarEvents}
                />
            </aside>
          </div>
        ) : (
          <main className="py-6 md:py-10">
            <CourseDetail 
              course={selectedCourse} onBack={() => setSelectedCourse(null)} 
              isTeacherOwner={isTeacherView && selectedCourse.teacherId === currentUser.id}
              onAddModule={() => setIsModuleModalOpen(true)}
              onEditModule={(m) => { setEditingModule(m); setIsModuleModalOpen(true); }}
              onDeleteModule={(id) => updateCourses(courses.map(c => c.id === selectedCourse.id ? {...c, content: c.content.filter(m => m.id !== id)} : c))}
              onAddCategory={(mid) => { setParentId(mid); setIsCategoryModalOpen(true); }}
              onEditCategory={(mid, cat) => { setParentId(mid); setEditingCategory(cat); setIsCategoryModalOpen(true); }}
              onDeleteCategory={(mid, cid) => updateCourses(courses.map(c => c.id === selectedCourse.id ? {...c, content: c.content.map(m => m.id === mid ? {...m, categories: m.categories.filter(ca => ca.id !== cid)} : m)} : c))}
              onAddMaterial={(cid) => { setParentId(cid); setIsMaterialModalOpen(true); }}
              onEditMaterial={(cid, mat) => { setParentId(cid); setEditingMaterial(mat); setIsMaterialModalOpen(true); }}
              onDeleteMaterial={(cid, mid) => updateCourses(courses.map(c => c.id === selectedCourse.id ? {...c, content: c.content.map(m => ({...m, categories: m.categories.map(ca => ca.id === cid ? {...ca, materials: ca.materials.filter(ma => ma.id !== mid)} : ca)}))} : c))}
              onViewMaterial={setViewingMaterial}
            />
          </main>
        )}
      </div>

      <div className="print:hidden">
        <AIChat />
        <Footer />
      </div>

      {/* Modais Adaptativos */}
      {isStudyPlannerOpen && <StudyPlanner onClose={() => setIsStudyPlannerOpen(false)} courses={courses} onPinToHub={handlePinSchedule} />}
      {viewingMaterial && <FilePreviewModal material={viewingMaterial} onClose={() => setViewingMaterial(null)}/>}
      {isCalendarVisible && <FullCalendarView onClose={() => setIsCalendarVisible(false)} events={visibleCalendarEvents} isTeacher={isTeacherView} courses={courses} onAddEvent={(d) => { setSelectedDateForEvent(d); setEditingEvent(null); setIsEventModalOpen(true); }} onEditEvent={(e) => { setEditingEvent(e); setIsEventModalOpen(true); }} onDeleteEvent={(id) => updateEvents(calendarEvents.filter(e => e.id !== id))}/>}
      {isUserManagementVisible && <UserManagement users={users} currentUser={currentUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onClose={() => setIsUserManagementVisible(false)} />}
      {isCourseModalOpen && <CourseFormModal isOpen={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} onSave={handleSaveCourse} courseToEdit={editingCourse}/>}
      {isModuleModalOpen && <ModuleFormModal isOpen={isModuleModalOpen} onClose={() => setIsModuleModalOpen(false)} onSave={(d) => { const updated = courses.map(c => c.id === selectedCourse!.id ? { ...c, content: editingModule ? c.content.map(m => m.id === editingModule.id ? {...m, ...d} : m) : [...c.content, {...d, id: generateId(), categories: []}] } : c); updateCourses(updated); setSelectedCourse(updated.find(c => c.id === selectedCourse!.id)!); setIsModuleModalOpen(false); }} moduleToEdit={editingModule}/>}
      {isCategoryModalOpen && <CategoryFormModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSave={(d) => { const updated = courses.map(c => c.id === selectedCourse!.id ? { ...c, content: c.content.map(m => m.id === parentId ? { ...m, categories: editingCategory ? m.categories.map(ca => ca.id === editingCategory.id ? {...ca, ...d} : ca) : [...m.categories, {...d, id: generateId(), materials: []}] } : m) } : c); updateCourses(updated); setSelectedCourse(updated.find(c => c.id === selectedCourse!.id)!); setIsCategoryModalOpen(false); }} categoryToEdit={editingCategory}/>}
      {isMaterialModalOpen && <MaterialFormModal isOpen={isMaterialModalOpen} onClose={() => setIsMaterialModalOpen(false)} onSave={async (d) => { const updated = courses.map(c => c.id === selectedCourse!.id ? { ...c, content: c.content.map(m => ({ ...m, categories: m.categories.map(ca => ca.id === parentId ? { ...ca, materials: editingMaterial ? ca.materials.map(ma => ma.id === editingMaterial.id ? {...ma, ...d} : ma) : [...ca.materials, {...d, id: generateId()}] } : ca) })) } : c); updateCourses(updated); setSelectedCourse(updated.find(c => c.id === selectedCourse!.id)!); setIsMaterialModalOpen(false); }} materialToEdit={editingMaterial}/>}
      {isSidebarLinkModalOpen && <SidebarLinkFormModal isOpen={isSidebarLinkModalOpen} onClose={() => setIsSidebarLinkModalOpen(false)} onSave={(d) => { if(editingSidebarLink) updateLinks(sidebarLinks.map(l => l.id === editingSidebarLink.id ? {...l, ...d} : l)); else updateLinks([...sidebarLinks, {...d, id: generateId()}]); setIsSidebarLinkModalOpen(false); }} linkToEdit={editingSidebarLink}/>}
      {isEventModalOpen && <EventFormModal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} onSave={(d) => { if(editingEvent) updateEvents(calendarEvents.map(e => e.id === editingEvent.id ? {...e, ...d} : e)); else updateEvents([...calendarEvents, {...d, id: generateId()}]); setIsEventModalOpen(false); }} eventToEdit={editingEvent} selectedDate={selectedDateForEvent} courses={courses}/>}
      {isProfileModalOpen && <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} currentUser={currentUser} onSave={handleSaveProfile}/>}
      {isSimulationModalOpen && <SimulationSetupModal isOpen={isSimulationModalOpen} onClose={() => setIsSimulationModalOpen(false)} onStart={(y, c) => { setSimulationContext({ year: y, classroom: c }); setIsSimulationModalOpen(false); }}/>}
    </div>
  );
};

export default App;
