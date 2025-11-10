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
