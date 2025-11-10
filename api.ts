import { StoredUser, Course, SidebarLink, CalendarEvent } from './types';
import { generateId, simpleHash } from './utils/auth';

// --- Constants for localStorage keys ---
const USERS_KEY = 'materiaParaVoce_users';
const COURSES_KEY = 'materiaParaVoce_courses';
const LINKS_KEY = 'materiaParaVoce_sidebarLinks';
const EVENTS_KEY = 'materiaParaVoce_calendarEvents';

// ===================================================================================
// NOTE TO DEVELOPER:
// This file simulates a backend API using localStorage. In a real-world application,
// all functions in this file should be replaced with actual HTTP requests (e.g., fetch)
// to a real backend server to ensure data is centralized and accessible across devices.
// Example:
//
// export const getCourses = async (): Promise<Course[]> => {
//   const response = await fetch('/api/courses');
//   if (!response.ok) {
//     throw new Error('Failed to fetch courses');
//   }
//   return await response.json();
// };
// ===================================================================================


// --- User Management ---

const createDefaultTeacher = (): StoredUser => ({
    id: 'rapha-admin-id',
    name: 'Raphael Costa',
    email: 'rapha@raphaelcosta.com.br',
    passwordHash: simpleHash('password'),
    role: 'teacher',
    isActive: true,
    year: 9,
    classroom: 'A',
});

export const getUsers = (): StoredUser[] => {
  try {
    const usersJson = localStorage.getItem(USERS_KEY);

    if (!usersJson) {
      const defaultUsers = [createDefaultTeacher()];
      saveUsers(defaultUsers);
      return defaultUsers;
    }

    const users: StoredUser[] = JSON.parse(usersJson);
    
    if (!Array.isArray(users)) {
        console.error("User data in localStorage is corrupted. Resetting to default.");
        const defaultUsers = [createDefaultTeacher()];
        saveUsers(defaultUsers);
        return defaultUsers;
    }
    
    return users;

  } catch (error) {
    console.error("Failed to load or parse users from localStorage", error);
    return [createDefaultTeacher()];
  }
};

export const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// --- Course Management ---

export const getCourses = (): Course[] => {
  try {
    const coursesJson = localStorage.getItem(COURSES_KEY);
    return coursesJson ? JSON.parse(coursesJson) : [];
  } catch (error) {
    console.error("Failed to parse courses from localStorage", error);
    localStorage.removeItem(COURSES_KEY);
    return [];
  }
};

export const saveCourses = (courses: Course[]): void => {
  try {
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (e: any) {
    if (e.name === 'QuotaExceededError' || (e.code && (e.code === 22 || e.code === 1014))) {
      throw new Error('fileTooLargeError');
    }
    throw new Error('fileProcessingError');
  }
};

// --- Sidebar Links Management ---

const getDefaultLinks = (): SidebarLink[] => {
    const defaultTexts: { [key: string]: string } = {
        changePassword: 'ALTERAÇÃO DE SENHA',
        accessEmail: 'ACESSO AO E-MAIL',
        accessCanva: 'ACESSO AO CANVA',
        accessPadlet: 'ACESSO AO PADLET',
        downloadTeams: 'DOWNLOAD DO TEAMS',
        downloadInsight: 'DOWNLOAD DO INSIGHT',
        audioCollection: 'ACERVO DE ÁUDIOS INTEF - YOUTUBE',
        imageCollection: 'ACERVO DE IMAGENS INTEF - PIXABAY',
        accessMatific: 'ACESSO AO MATIFIC',
    };
    const defaultLinkKeys = [
      'changePassword', 'accessEmail', 'accessCanva',
      'accessPadlet', 'downloadTeams', 'downloadInsight',
      'audioCollection', 'imageCollection', 'accessMatific'
    ];
    return defaultLinkKeys.map(key => ({
        id: generateId(),
        text: defaultTexts[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase(),
        url: '#',
    }));
};

export const getLinks = (): SidebarLink[] => {
  try {
    const linksJson = localStorage.getItem(LINKS_KEY);
    if (linksJson) {
      return JSON.parse(linksJson);
    } else {
      const defaultLinks = getDefaultLinks();
      saveLinks(defaultLinks);
      return defaultLinks;
    }
  } catch (error) {
    console.error("Failed to parse links from localStorage", error);
    const defaultLinks = getDefaultLinks();
    saveLinks(defaultLinks);
    return defaultLinks;
  }
};

export const saveLinks = (links: SidebarLink[]): void => {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
};

// --- Calendar Events Management ---

export const getEvents = (): CalendarEvent[] => {
  try {
    const eventsJson = localStorage.getItem(EVENTS_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error("Failed to parse events from localStorage", error);
    localStorage.removeItem(EVENTS_KEY);
    return [];
  }
};

export const saveEvents = (events: CalendarEvent[]): void => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
};
