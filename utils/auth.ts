
import { StoredUser } from '../types';

const USERS_KEY = 'mpv_users';

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

/**
 * A simple, non-secure hash function for demonstration purposes.
 * DO NOT use this in a real application.
 */
export const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

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
    const saved = localStorage.getItem(USERS_KEY);
    if (!saved) {
        const defaults = [createDefaultTeacher()];
        saveUsers(defaults);
        return defaults;
    }
    try {
        return JSON.parse(saved);
    } catch {
        return [createDefaultTeacher()];
    }
};

export const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
