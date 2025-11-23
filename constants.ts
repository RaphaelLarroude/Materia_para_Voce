import { Course, CalendarEvent, Notification } from './types';

// NOTE: In a real app, this would be a unique ID from your database
// This ID is used to associate courses with the default admin user.
export const DEFAULT_TEACHER_ID = 'rapha-admin-id';

// The application now starts with no default content.
// Teachers will create all courses, and this list will be populated from localStorage.
export const COURSES: Course[] = [];

// Calendar events are now intended to be dynamic. This constant is empty.
export const CALENDAR_EVENTS: CalendarEvent[] = [];

// Notifications are now intended to be dynamic. This constant is empty.
export const NOTIFICATIONS: Notification[] = [];

export const APP_LOGO_URL = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="%232563EB"/><path stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>';