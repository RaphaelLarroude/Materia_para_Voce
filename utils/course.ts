import { Course } from '../types';

const COURSES_KEY = 'materiaParaVoce_courses';

export const getCourses = (): Course[] => {
  try {
    const coursesJson = localStorage.getItem(COURSES_KEY);
    // If no courses in localStorage, return an empty array.
    // The app starts fresh.
    return coursesJson ? JSON.parse(coursesJson) : [];
  } catch (error) {
    console.error("Failed to parse courses from localStorage", error);
    // If data is corrupted, clear it and start fresh.
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