import { StoredUser } from '../types';

const USERS_KEY = 'materiaParaVoce_users';

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
  try {
    const usersJson = localStorage.getItem(USERS_KEY);

    // If no users exist (first run), create the default teacher.
    if (!usersJson) {
      const defaultUsers = [createDefaultTeacher()];
      saveUsers(defaultUsers);
      return defaultUsers;
    }

    // If users exist, just parse and return them.
    const users: StoredUser[] = JSON.parse(usersJson);
    
    // Basic validation to prevent app crash on corrupted data
    if (!Array.isArray(users)) {
        console.error("User data in localStorage is corrupted. Resetting to default.");
        const defaultUsers = [createDefaultTeacher()];
        saveUsers(defaultUsers);
        return defaultUsers;
    }
    
    return users;

  } catch (error) {
    console.error("Failed to load or parse users from localStorage", error);
    // If parsing fails, return a safe default to prevent crashing, but don't overwrite.
    return [createDefaultTeacher()];
  }
};

export const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};
