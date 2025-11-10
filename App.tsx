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
import { generateId } from './utils/auth';
import { 
    getCourses, saveCourse, deleteCourse,
    getAllUserProfiles, updateUserProfile,
    getLinks, saveLink, deleteLink,
    getEvents, saveEvent, deleteEvent,
    uploadMaterialFile 
} from './api';
import { supabase } from './supabaseClient';
// Fix: Import icons to map iconName string to component
import { PlusIcon, BookOpenIcon, BeakerIcon, GlobeAltIcon, AcademicCapIcon, PaintBrushIcon, RunningIcon } from './components/icons';

// Fix: Create a map of icon components to resolve from iconName string
const icons: { [key: string]: React.ComponentType<{ className?: string }> } = { BookOpenIcon, BeakerIcon, GlobeAltIcon, AcademicCapIcon, PaintBrushIcon, RunningIcon };

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
  const [isLoading, setIsLoading] = useState(true);


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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setIsLoading(true);
        if (session?.user) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (profile && profile.isActive) {
                setCurrentUser(profile);
                loadInitialData();
            } else {
                setCurrentUser(null);
                await supabase.auth.signOut();
            }
        } else {
            setCurrentUser(null);
        }
        setIsLoading(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const loadInitialData = async () => {
    try {
        const [allUsers, coursesFromApi, allLinks, allEvents] = await Promise.all([
            getAllUserProfiles(),
            getCourses(),
            getLinks(),
            getEvents()
        ]);

        // Fix: Map iconName string from API to icon component for UI
        const allCourses: Course[] = coursesFromApi.map(c => ({
            ...c,
            icon: icons[c.iconName] || BookOpenIcon,
        }));

        setUsers(allUsers);
        setCourses(allCourses);
        setSidebarLinks(allLinks);
        setCalendarEvents(allEvents);
    } catch (error) {
        console.error("Failed to load initial data", error);
    }
  };


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


  // --- Auth Handlers ---
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setSimulationContext(null);
    setSelectedCourse(null);
  };
  
  // --- Profile Update Handler ---
  const handleSaveProfile = async (updatedData: Partial<User>, passwordData?: { current: string, new: string }): Promise<void> => {
      if (!currentUser) throw new Error("No user logged in");
      
      // Handle password change
      if (passwordData?.new) {
          const { error } = await supabase.auth.updateUser({ password: passwordData.new });
          if (error) throw new Error(error.message);
      }
      
      const { data: updatedProfile, error: profileError } = await supabase
          .from('profiles')
          .update(updatedData)
          .eq('id', currentUser.id)
          .select()
          .single();

      if (profileError) throw profileError;
      
      setCurrentUser(updatedProfile);
  }


  // --- User Management Handlers ---
  const handleUpdateUser = async (updatedUser: StoredUser) => {
    await updateUserProfile(updatedUser.id, updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  }
  const handleDeleteUser = async (userId: string) => {
    // Note: Deleting users should be handled with care, maybe just deactivating.
    // Supabase user deletion is more complex. For now, we just deactivate.
    const userToDeactivate = users.find(u => u.id === userId);
    if(userToDeactivate) {
        await handleUpdateUser({ ...userToDeactivate, isActive: false });
    }
  }

  // --- Course CRUD Handlers ---
  const handleSaveCourse = async (courseData: Omit<Course, 'id' | 'teacher' | 'teacherId' | 'content' | 'status' | 'progress' | 'iconName'> & { classrooms?: Classroom[], years?: SchoolYear[], icon: any }) => {
    if (!currentUser) return;

    let courseToSave: Partial<Course>;
    if (editingCourse) { // Update
      courseToSave = { ...editingCourse, ...courseData, iconName: courseData.icon.name };
    } else { // Create
      courseToSave = {
        ...courseData,
        id: generateId(),
        teacher: currentUser.name,
        teacherId: currentUser.id,
        content: [],
        status: t('notStartedYet'),
        progress: 0,
        classrooms: courseData.classrooms || [],
        years: courseData.years || [],
        iconName: courseData.icon.name,
      };
    }
    
    // @ts-ignore
    delete courseToSave.icon; // Don't save component to DB
    
    const savedCourseFromApi = await saveCourse(courseToSave);

    // Fix: Reconstruct the full course object with the icon component for local state
    const saved: Course = {
      ...savedCourseFromApi,
      icon: icons[savedCourseFromApi.iconName] || BookOpenIcon,
    };

    if (editingCourse) {
        setCourses(courses.map(c => c.id === saved.id ? saved : c));
    } else {
        setCourses([...courses, saved]);
    }

    setIsCourseModalOpen(false);
    setEditingCourse(null);
  }
  const handleDeleteCourse = async (course: Course) => {
    if (window.confirm(t('confirmDeleteCourseMessage'))) {
      await deleteCourse(course.id);
      setCourses(courses.filter(c => c.id !== course.id));
    }
  }

  // --- Course Content CRUD Handlers (Immutable Updates) ---
  const handleSaveModule = async (moduleData: Omit<CourseModule, 'id' | 'categories'>) => {
    if (!selectedCourse) return;
    
    let updatedCourse: Course;
    if (editingModule) { // Update
        const newContent = selectedCourse.content.map(m => m.id === editingModule.id ? { ...m, ...moduleData } : m);
        updatedCourse = { ...selectedCourse, content: newContent };
    } else { // Create
        const newModule: CourseModule = { ...moduleData, id: generateId(), categories: [], classrooms: moduleData.classrooms || [], years: moduleData.years || [] };
        updatedCourse = { ...selectedCourse, content: [...selectedCourse.content, newModule] };
    }
  
    const saved = await saveCourse(updatedCourse);
    const savedWithIcon: Course = { ...saved, icon: icons[saved.iconName] || BookOpenIcon };
    setCourses(courses.map(c => c.id === savedWithIcon.id ? savedWithIcon : c));
    setSelectedCourse(savedWithIcon);
    setIsModuleModalOpen(false);
    setEditingModule(null);
  };
  
  const handleDeleteModule = async (moduleId: string) => {
    if (!selectedCourse) return;
    const newContent = selectedCourse.content.filter(m => m.id !== moduleId);
    const updatedCourse = { ...selectedCourse, content: newContent };
    
    const saved = await saveCourse(updatedCourse);
    const savedWithIcon: Course = { ...saved, icon: icons[saved.iconName] || BookOpenIcon };
    setCourses(courses.map(c => c.id === savedWithIcon.id ? savedWithIcon : c));
    setSelectedCourse(savedWithIcon);
  };

  const handleSaveCategory = async (categoryData: Omit<StudyMaterialCategory, 'id' | 'materials'>) => {
    if (!selectedCourse || !parentId) return; // parentId is moduleId here
    
    const newContent = selectedCourse.content.map(module => {
        if (module.id !== parentId) return module;
        let newCategories;
        if (editingCategory) { // Update
            newCategories = module.categories.map(cat => cat.id === editingCategory.id ? { ...cat, ...categoryData } : cat);
        } else { // Create
            const newCategory: StudyMaterialCategory = { ...categoryData, id: generateId(), materials: [], classrooms: categoryData.classrooms || [], years: categoryData.years || [] };
            newCategories = [...module.categories, newCategory];
        }
        return { ...module, categories: newCategories };
    });

    const updatedCourse = { ...selectedCourse, content: newContent };
    const saved = await saveCourse(updatedCourse);
    const savedWithIcon: Course = { ...saved, icon: icons[saved.iconName] || BookOpenIcon };
    setCourses(courses.map(c => c.id === savedWithIcon.id ? savedWithIcon : c));
    setSelectedCourse(savedWithIcon);
    
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setParentId(null);
  }

  const handleDeleteCategory = async (moduleId: string, categoryId: string) => {
    if (!selectedCourse) return;
    const newContent = selectedCourse.content.map(module => {
        if (module.id !== moduleId) return module;
        const newCategories = module.categories.filter(cat => cat.id !== categoryId);
        return { ...module, categories: newCategories };
    });

    const updatedCourse = { ...selectedCourse, content: newContent };
    const saved = await saveCourse(updatedCourse);
    const savedWithIcon: Course = { ...saved, icon: icons[saved.iconName] || BookOpenIcon };
    setCourses(courses.map(c => c.id === savedWithIcon.id ? savedWithIcon : c));
    setSelectedCourse(savedWithIcon);
  }

  const handleSaveMaterial = async (materialData: Omit<StudyMaterial, 'id'> & { id?: string }): Promise<void> => {
    if (!selectedCourse || !parentId) {
      throw new Error("Course or parent not selected");
    }

    let materialToSave = { ...materialData };

    // Handle file upload to Supabase Storage
    if (materialToSave.type === 'file' && materialToSave.content.startsWith('data:')) {
        const publicUrl = await uploadMaterialFile(materialToSave as Omit<StudyMaterial, 'id'>);
        materialToSave.content = publicUrl;
    }

    const newContent = selectedCourse.content.map(module => {
        const newCategories = module.categories.map(category => {
            if (category.id !== parentId) return category;

            let newMaterials;
            if (editingMaterial) { // Update
                newMaterials = category.materials.map(mat => mat.id === editingMaterial.id ? { ...mat, ...materialToSave } : mat);
            } else { // Create
                const { id, ...restOfData } = materialToSave;
                const newMaterial: StudyMaterial = { ...restOfData as Omit<StudyMaterial, 'id'>, id: generateId(), classrooms: materialData.classrooms || [], years: materialData.years || [] };
                newMaterials = [...(category.materials || []), newMaterial];
            }
            return { ...category, materials: newMaterials };
        });
        return { ...module, categories: newCategories };
    });
    
    const updatedCourse = { ...selectedCourse, content: newContent };
    const saved = await saveCourse(updatedCourse);
    const savedWithIcon: Course = { ...saved, icon: icons[saved.iconName] || BookOpenIcon };
    setCourses(courses.map(c => c.id === savedWithIcon.id ? savedWithIcon : c));
    setSelectedCourse(savedWithIcon);
  };

   const handleDeleteMaterial = async (categoryId: string, materialId: string) => {
    if (!selectedCourse) return;
    const newContent = selectedCourse.content.map(module => {
        const newCategories = module.categories.map(category => {
            if (category.id !== categoryId) return category;
            const newMaterials = category.materials.filter(mat => mat.id !== materialId);
            return { ...category, materials: newMaterials };
        });
        return { ...module, categories: newCategories };
    });

    const updatedCourse = { ...selectedCourse, content: newContent };
    const saved = await saveCourse(updatedCourse);
    const savedWithIcon: Course = { ...saved, icon: icons[saved.iconName] || BookOpenIcon };
    setCourses(courses.map(c => c.id === savedWithIcon.id ? savedWithIcon : c));
    setSelectedCourse(savedWithIcon);
  }
  
  // --- Sidebar Link Handlers ---
  const handleSaveSidebarLink = async (linkData: Omit<SidebarLink, 'id'>) => {
      let linkToSave: Partial<SidebarLink> = editingSidebarLink ? { ...editingSidebarLink, ...linkData } : { ...linkData, id: generateId() };
      const saved = await saveLink(linkToSave);
      
      if (editingSidebarLink) {
          setSidebarLinks(sidebarLinks.map(l => l.id === saved.id ? saved : l));
      } else {
          setSidebarLinks([...sidebarLinks, saved]);
      }
      setIsSidebarLinkModalOpen(false);
      setEditingSidebarLink(null);
  }

  const handleDeleteSidebarLink = async (linkId: string) => {
      await deleteLink(linkId);
      setSidebarLinks(sidebarLinks.filter(l => l.id !== linkId));
  }
  
  // --- Calendar Event Handlers ---
    const handleSaveEvent = async (eventData: Omit<CalendarEvent, 'id'>) => {
        let eventToSave: Partial<CalendarEvent> = editingEvent ? { ...editingEvent, ...eventData } : { ...eventData, id: generateId() };
        const saved = await saveEvent(eventToSave);

        if (editingEvent) {
            setCalendarEvents(calendarEvents.map(e => e.id === saved.id ? saved : e));
        } else {
            setCalendarEvents([...calendarEvents, saved]);
        }
        setIsEventModalOpen(false);
        setEditingEvent(null);
        setSelectedDateForEvent(null);
    };

    const handleDeleteEvent = async (eventId: string) => {
        if (window.confirm(t('confirmDeleteEvent'))) {
            await deleteEvent(eventId);
            setCalendarEvents(calendarEvents.filter(e => e.id !== eventId));
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

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue-500"></div>
        </div>
    );
  }

  if (!currentUser) {
    return <Auth />;
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
                      onDelete={() => handleDeleteCourse(course)}
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