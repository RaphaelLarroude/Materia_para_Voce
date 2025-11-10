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
import { useLanguage } from './languageContext';
import { simpleHash, generateId } from './utils/auth';
import { getCourses, saveCourses, getUsers, saveUsers, getLinks, saveLinks, getEvents, saveEvents } from './api';
import { PlusIcon } from './components/icons';

const isItemVisibleToStudent = (item: { classrooms?: Classroom[], years?: SchoolYear[] }, student: User | null): boolean => {
    if (!student || student.role !== 'student') return true; // always visible to teachers or if no user
    
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
  
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isUserManagementVisible, setIsUserManagementVisible] = useState(false);
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


  const [parentId, setParentId] = useState<string | null>(null); // For creating nested content


  const { t } = useLanguage();

  useEffect(() => {
    // Load all data on initial mount
    const allUsers = getUsers();
    const allCourses = getCourses();
    const allLinks = getLinks();
    const allEvents = getEvents();
    setUsers(allUsers);
    setCourses(allCourses);
    setSidebarLinks(allLinks);
    setCalendarEvents(allEvents);

    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        const fullUser = allUsers.find(u => u.id === user.id);
        if (fullUser && fullUser.isActive) {
          setCurrentUser(fullUser);
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('currentUser');
    }
  }, []);

  const isTeacherView = !simulationContext && currentUser?.role === 'teacher';
  
  const viewingUser = useMemo(() => {
      if (simulationContext && currentUser) {
          return {
              ...currentUser,
              role: 'student',
              year: simulationContext.year,
              classroom: simulationContext.classroom,
          } as User;
      }
      return currentUser;
  }, [currentUser, simulationContext]);


  const updateUsers = (updatedUsers: StoredUser[]) => {
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
  }

  const updateCourses = (updatedCourses: Course[]) => {
    setCourses(updatedCourses);
    saveCourses(updatedCourses);
  }

  const updateLinks = (updatedLinks: SidebarLink[]) => {
    setSidebarLinks(updatedLinks);
    saveLinks(updatedLinks);
  }
  
  const updateEvents = (updatedEvents: CalendarEvent[]) => {
    setCalendarEvents(updatedEvents);
    saveEvents(updatedEvents);
  };

  // --- Auth Handlers ---
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSimulationContext(null);
    localStorage.removeItem('currentUser');
    setSelectedCourse(null);
  };
  
  // --- Profile Update Handler ---
  const handleSaveProfile = (updatedData: Partial<User>, passwordData?: { current: string, new: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!currentUser) return reject(new Error("No user logged in"));
        
        const userToUpdate = users.find(u => u.id === currentUser.id);
        if (!userToUpdate) return reject(new Error("User not found"));

        let updatedUser = { ...userToUpdate, ...updatedData };
        
        // Handle password change
        if (passwordData && passwordData.current && passwordData.new) {
            if (simpleHash(passwordData.current) !== userToUpdate.passwordHash) {
                return reject(new Error(t('currentPasswordIncorrect')));
            }
            updatedUser.passwordHash = simpleHash(passwordData.new);
        }
        
        const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        updateUsers(updatedUsers);

        const { passwordHash, ...userForSession } = updatedUser;
        setCurrentUser(userForSession);
        localStorage.setItem('currentUser', JSON.stringify(userForSession));
        
        resolve();
    });
  }


  // --- User Management Handlers ---
  const handleUpdateUser = (updatedUser: StoredUser) => {
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    updateUsers(updatedUsers);
  }
  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    updateUsers(updatedUsers);
  }

  // --- Course CRUD Handlers ---
  const handleSaveCourse = (courseData: Omit<Course, 'id' | 'teacher' | 'teacherId' | 'content' | 'status' | 'progress'> & { classrooms?: Classroom[], years?: SchoolYear[] }) => {
    if (!currentUser) return;
    if (editingCourse) { // Update
      const updatedCourses = courses.map(c => c.id === editingCourse.id ? { ...c, ...courseData } : c);
      updateCourses(updatedCourses);
    } else { // Create
      const newCourse: Course = {
        ...courseData,
        id: generateId(),
        teacher: currentUser.name,
        teacherId: currentUser.id,
        content: [],
        status: t('notStartedYet'),
        progress: 0,
        classrooms: courseData.classrooms || [],
        years: courseData.years || [],
      };
      updateCourses([...courses, newCourse]);
    }
    setIsCourseModalOpen(false);
    setEditingCourse(null);
  }
  const handleDeleteCourse = (course: Course) => {
    if (window.confirm(t('confirmDeleteCourseMessage'))) {
      const updatedCourses = courses.filter(c => c.id !== course.id);
      updateCourses(updatedCourses);
    }
  }

  // --- Course Content CRUD Handlers (Immutable Updates) ---
  const handleSaveModule = (moduleData: Omit<CourseModule, 'id' | 'categories'>) => {
    if (!selectedCourse) return;
    const newCourses = courses.map(course => {
      if (course.id !== selectedCourse.id) return course;
  
      let newContent;
      if (editingModule) { // Update
        newContent = course.content.map(m =>
          m.id === editingModule.id
            ? { ...m, ...moduleData }
            : m
        );
      } else { // Create
        const newModule: CourseModule = { ...moduleData, id: generateId(), categories: [], classrooms: moduleData.classrooms || [], years: moduleData.years || [] };
        newContent = [...course.content, newModule];
      }
      return { ...course, content: newContent };
    });
  
    const updatedCourse = newCourses.find(c => c.id === selectedCourse.id);
    if (updatedCourse) setSelectedCourse(updatedCourse);
  
    updateCourses(newCourses);
    setIsModuleModalOpen(false);
    setEditingModule(null);
  };
  
  const handleDeleteModule = (moduleId: string) => {
    if (!selectedCourse) return;
    const newCourses = courses.map(course => {
      if (course.id !== selectedCourse.id) return course;
      const newContent = course.content.filter(m => m.id !== moduleId);
      return { ...course, content: newContent };
    });
  
    const updatedCourse = newCourses.find(c => c.id === selectedCourse.id);
    if (updatedCourse) setSelectedCourse(updatedCourse);
    updateCourses(newCourses);
  };

  const handleSaveCategory = (categoryData: Omit<StudyMaterialCategory, 'id' | 'materials'>) => {
    if (!selectedCourse || !parentId) return; // parentId is moduleId here
    const newCourses = courses.map(course => {
        if (course.id !== selectedCourse.id) return course;

        const newContent = course.content.map(module => {
            if (module.id !== parentId) return module;
            
            let newCategories;
            if (editingCategory) { // Update
                newCategories = module.categories.map(cat => 
                    cat.id === editingCategory.id 
                    ? { ...cat, ...categoryData }
                    : cat
                );
            } else { // Create
                const newCategory: StudyMaterialCategory = { ...categoryData, id: generateId(), materials: [], classrooms: categoryData.classrooms || [], years: categoryData.years || [] };
                newCategories = [...module.categories, newCategory];
            }
            return { ...module, categories: newCategories };
        });
        return { ...course, content: newContent };
    });

    const updatedCourse = newCourses.find(c => c.id === selectedCourse.id);
    if (updatedCourse) setSelectedCourse(updatedCourse);
    
    updateCourses(newCourses);
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setParentId(null);
  }

  const handleDeleteCategory = (moduleId: string, categoryId: string) => {
    if (!selectedCourse) return;
     const newCourses = courses.map(course => {
        if (course.id !== selectedCourse.id) return course;

        const newContent = course.content.map(module => {
            if (module.id !== moduleId) return module;
            const newCategories = module.categories.filter(cat => cat.id !== categoryId);
            return { ...module, categories: newCategories };
        });
        return { ...course, content: newContent };
    });

    const updatedCourse = newCourses.find(c => c.id === selectedCourse.id);
    if (updatedCourse) setSelectedCourse(updatedCourse);
    updateCourses(newCourses);
  }

  const handleSaveMaterial = (materialData: Omit<StudyMaterial, 'id'> & { id?: string }): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        if (!selectedCourse || !parentId) {
          return reject(new Error("Course or parent not selected"));
        }
  
        const newCourses = courses.map(course => {
          if (course.id !== selectedCourse.id) return course;
  
          const newContent = course.content.map(module => {
            const newCategories = module.categories.map(category => {
              if (category.id !== parentId) return category;
  
              let newMaterials;
              if (editingMaterial) { // Update
                newMaterials = category.materials.map(mat =>
                  mat.id === editingMaterial.id ? { ...mat, ...materialData } : mat
                );
              } else { // Create
                const { id, ...restOfData } = materialData;
                const newMaterial: StudyMaterial = { ...restOfData as Omit<StudyMaterial, 'id'>, id: generateId(), classrooms: materialData.classrooms || [], years: materialData.years || [] };
                newMaterials = [...(category.materials || []), newMaterial];
              }
              return { ...category, materials: newMaterials };
            });
            return { ...module, categories: newCategories };
          });
          return { ...course, content: newContent };
        });
  
        const updatedCourse = newCourses.find(c => c.id === selectedCourse.id);
        if (updatedCourse) setSelectedCourse(updatedCourse);
  
        updateCourses(newCourses);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

   const handleDeleteMaterial = (categoryId: string, materialId: string) => {
    if (!selectedCourse) return;
     const newCourses = courses.map(course => {
        if (course.id !== selectedCourse.id) return course;
        
        const newContent = course.content.map(module => {
            const newCategories = module.categories.map(category => {
                if (category.id !== categoryId) return category;
                const newMaterials = category.materials.filter(mat => mat.id !== materialId);
                return { ...category, materials: newMaterials };
            });
            return { ...module, categories: newCategories };
        });
        return { ...course, content: newContent };
    });

    const updatedCourse = newCourses.find(c => c.id === selectedCourse.id);
    if (updatedCourse) setSelectedCourse(updatedCourse);
    updateCourses(newCourses);
  }
  
  // --- Sidebar Link Handlers ---
  const handleSaveSidebarLink = (linkData: Omit<SidebarLink, 'id'>) => {
      if (editingSidebarLink) { // Update
          const updatedLinks = sidebarLinks.map(l => l.id === editingSidebarLink.id ? { ...l, ...linkData } : l);
          updateLinks(updatedLinks);
      } else { // Create
          const newLink: SidebarLink = { ...linkData, id: generateId(), classrooms: linkData.classrooms || [], years: linkData.years || [] };
          updateLinks([...sidebarLinks, newLink]);
      }
      setIsSidebarLinkModalOpen(false);
      setEditingSidebarLink(null);
  }

  const handleDeleteSidebarLink = (linkId: string) => {
      const updatedLinks = sidebarLinks.filter(l => l.id !== linkId);
      updateLinks(updatedLinks);
  }
  
  // --- Calendar Event Handlers ---
    const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
        if (editingEvent) { // Update
            const updatedEvents = calendarEvents.map(e => e.id === editingEvent.id ? { ...e, ...eventData } : e);
            updateEvents(updatedEvents);
        } else { // Create
            const newEvent: CalendarEvent = { ...eventData, id: generateId(), classrooms: eventData.classrooms || [], years: eventData.years || [] };
            updateEvents([...calendarEvents, newEvent]);
        }
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setSelectedDateForEvent(null);
    };

    const handleDeleteEvent = (eventId: string) => {
        if (window.confirm(t('confirmDeleteEvent'))) {
            const updatedEvents = calendarEvents.filter(e => e.id !== eventId);
            updateEvents(updatedEvents);
        }
    };


  // --- UI Handlers ---
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
    } else {
        setSelectedCourse(course);
    }
  };

  const handleBackToDashboard = () => setSelectedCourse(null);

  const handleStartSimulation = (year: SchoolYear, classroom: Classroom) => {
    setSelectedCourse(null);
    setSimulationContext({ year, classroom });
    setIsSimulationModalOpen(false);
  };
  const handleEndSimulation = () => setSimulationContext(null);


  const filteredCourses = useMemo(() => {
    const baseCourses = (currentUser?.role === 'teacher' && !simulationContext)
      ? courses.filter(c => c.teacherId === currentUser.id)
      : courses.filter(course => isItemVisibleToStudent(course, viewingUser));
      
    if (!searchQuery) return baseCourses;
    
    return baseCourses.filter(course => 
      course.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, courses, currentUser, simulationContext, viewingUser]);
  
  const visibleSidebarLinks = useMemo(() => sidebarLinks.filter(link => isItemVisibleToStudent(link, viewingUser)), [sidebarLinks, viewingUser]);
  const visibleCalendarEvents = useMemo(() => calendarEvents.filter(event => isItemVisibleToStudent(event, viewingUser)), [calendarEvents, viewingUser]);


  if (!currentUser) {
    return <Auth onLoginSuccess={handleLogin} />;
  }
  
  const getDashboardTitle = () => {
      if (simulationContext) return t('studentDashboardSimulation');
      if (currentUser.role === 'teacher') return t('teacherDashboard');
      return t('myCoursesAsStudent');
  }

  return (
    <div className="min-h-screen font-sans text-white flex flex-col">
      {simulationContext && <SimulationBanner onExit={handleEndSimulation} simulationContext={simulationContext} />}
      <Header 
        user={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
        onShowUserManagement={() => setIsUserManagementVisible(true)}
        onShowProfile={() => setIsProfileModalOpen(true)}
        isTeacherView={isTeacherView}
        onOpenSimulationModal={() => setIsSimulationModalOpen(true)}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow">
        {!selectedCourse ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <main className="flex-1 py-4 sm:py-6 lg:py-8">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-white text-left">
                  {getDashboardTitle()}
                </h1>
                {isTeacherView && (
                  <button onClick={() => setIsCourseModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      <PlusIcon className="w-5 h-5"/>
                      {t('createCourse')}
                  </button>
                )}
              </div>

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onClick={handleSelectCourse} 
                      isTeacherOwner={isTeacherView && course.teacherId === currentUser.id}
                      onEdit={() => { setEditingCourse(course); setIsCourseModalOpen(true); }}
                      onDelete={handleDeleteCourse}
                    />
                  ))}
                </div>
              ) : (
                 <div className="text-center py-16 bg-white/5 rounded-2xl">
                    <p className="text-gray-300">{currentUser.role === 'teacher' ? t('noCoursesCreated') : 'No courses available.'}</p>
                 </div>
              )}
            </main>
            <div className="flex-shrink-0 py-4 sm:py-6 lg:py-8 w-full lg:w-72">
               <Sidebar 
                  onShowCalendar={() => setIsCalendarVisible(true)} 
                  links={visibleSidebarLinks}
                  isTeacher={isTeacherView}
                  onAddLink={() => { setEditingSidebarLink(null); setIsSidebarLinkModalOpen(true); }}
                  onEditLink={(link) => { setEditingSidebarLink(link); setIsSidebarLinkModalOpen(true); }}
                  onDeleteLink={handleDeleteSidebarLink}
                  calendarEvents={visibleCalendarEvents}
                />
            </div>
          </div>
        ) : (
          <main className="py-4 sm:py-6 lg:py-8">
            <CourseDetail 
              course={selectedCourse} 
              onBack={handleBackToDashboard} 
              isTeacherOwner={isTeacherView && selectedCourse.teacherId === currentUser.id}
              onAddModule={() => setIsModuleModalOpen(true)}
              onEditModule={(module) => { setEditingModule(module); setIsModuleModalOpen(true); }}
              onDeleteModule={handleDeleteModule}
              onAddCategory={(moduleId) => { setParentId(moduleId); setIsCategoryModalOpen(true); }}
              onEditCategory={(moduleId, category) => { setParentId(moduleId); setEditingCategory(category); setIsCategoryModalOpen(true); }}
              onDeleteCategory={handleDeleteCategory}
              onAddMaterial={(categoryId) => { setParentId(categoryId); setIsMaterialModalOpen(true); }}
              onEditMaterial={(categoryId, material) => { setParentId(categoryId); setEditingMaterial(material); setIsMaterialModalOpen(true); }}
              onDeleteMaterial={handleDeleteMaterial}
              onViewMaterial={(material) => setViewingMaterial(material)}
            />
          </main>
        )}
      </div>

      {/* Modals */}
      {viewingMaterial && 
        <FilePreviewModal 
            material={viewingMaterial} 
            onClose={() => setViewingMaterial(null)}
        />
      }
      {isCalendarVisible && 
        <FullCalendarView 
            onClose={() => setIsCalendarVisible(false)} 
            events={visibleCalendarEvents}
            isTeacher={isTeacherView}
            courses={courses}
            onAddEvent={(date) => { setSelectedDateForEvent(date); setEditingEvent(null); setIsEventModalOpen(true); }}
            onEditEvent={(event) => { setEditingEvent(event); setSelectedDateForEvent(null); setIsEventModalOpen(true); }}
            onDeleteEvent={handleDeleteEvent}
        />
      }
      {isUserManagementVisible && <UserManagement users={users} currentUser={currentUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onClose={() => setIsUserManagementVisible(false)} />}
      
      {isCourseModalOpen && (
        <CourseFormModal 
          isOpen={isCourseModalOpen} 
          onClose={() => { setIsCourseModalOpen(false); setEditingCourse(null); }}
          onSave={handleSaveCourse}
          courseToEdit={editingCourse}
        />
      )}
      {isModuleModalOpen && (
        <ModuleFormModal
          isOpen={isModuleModalOpen}
          onClose={() => { setIsModuleModalOpen(false); setEditingModule(null); }}
          onSave={handleSaveModule}
          moduleToEdit={editingModule}
        />
      )}
      {isCategoryModalOpen && (
        <CategoryFormModal
          isOpen={isCategoryModalOpen}
          onClose={() => { setIsCategoryModalOpen(false); setEditingCategory(null); setParentId(null); }}
          onSave={handleSaveCategory}
          categoryToEdit={editingCategory}
        />
      )}
      {isMaterialModalOpen && (
          <MaterialFormModal
            isOpen={isMaterialModalOpen}
            onClose={() => { setIsMaterialModalOpen(false); setEditingMaterial(null); setParentId(null); }}
            onSave={async (data) => {
              try {
                await handleSaveMaterial(data);
                setIsMaterialModalOpen(false);
                setEditingMaterial(null);
                setParentId(null);
              } catch(e) {
                // error is handled inside the modal
              }
            }}
            materialToEdit={editingMaterial}
          />
      )}
      {isSidebarLinkModalOpen && (
        <SidebarLinkFormModal
            isOpen={isSidebarLinkModalOpen}
            onClose={() => { setIsSidebarLinkModalOpen(false); setEditingSidebarLink(null); }}
            onSave={handleSaveSidebarLink}
            linkToEdit={editingSidebarLink}
        />
    )}
    {isEventModalOpen && (
        <EventFormModal 
            isOpen={isEventModalOpen}
            onClose={() => { setIsEventModalOpen(false); setEditingEvent(null); setSelectedDateForEvent(null); }}
            onSave={handleSaveEvent}
            eventToEdit={editingEvent}
            selectedDate={selectedDateForEvent}
            courses={courses}
        />
    )}
    {isProfileModalOpen && (
        <ProfileModal 
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            onSave={handleSaveProfile}
        />
    )}
    {isSimulationModalOpen && (
        <SimulationSetupModal
            isOpen={isSimulationModalOpen}
            onClose={() => setIsSimulationModalOpen(false)}
            onStart={handleStartSimulation}
        />
    )}
    <Footer />
    </div>
  );
};

export default App;
