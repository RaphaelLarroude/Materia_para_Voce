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
    let users: StoredUser[] = usersJson ? JSON.parse(usersJson) : [];
    
    // Ensure users is a valid array
    if (!Array.isArray(users)) {
        users = [];
    }

    // Defensively find admin user and filter out malformed entries
    const adminIndex = users.findIndex((u) => u && u.id === 'rapha-admin-id');
    const adminByEmailIndex = users.findIndex((u) => u && u.email?.toLowerCase() === 'rapha@raphaelcosta.com.br');

    let existingAdminData = {};
    if (adminIndex > -1) {
        existingAdminData = users[adminIndex];
    } else if (adminByEmailIndex > -1) { // Typo fixed here
        existingAdminData = users[adminByEmailIndex];
    }
    
    // Filter out any malformed users and the old admin account to prevent duplicates
    const otherUsers = users.filter((u) => u && u.email && u.email.toLowerCase() !== 'rapha@raphaelcosta.com.br');
    
    const updatedAdmin: StoredUser = { ...createDefaultTeacher(), ...existingAdminData, id: 'rapha-admin-id' };
    
    const finalUsers = [...otherUsers, updatedAdmin];
    
    saveUsers(finalUsers);
    return finalUsers;

  } catch (error) {
    console.error("Failed to load or parse users from localStorage", error);
    // If anything fails, reset to a clean state with the default teacher
    const defaultUsers = [createDefaultTeacher()];
    saveUsers(defaultUsers);
    return defaultUsers;
  }
};

export const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};