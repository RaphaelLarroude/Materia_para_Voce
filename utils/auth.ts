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

    // Find any existing admin data, prioritizing the canonical ID, but falling back to email.
    const adminIndex = users.findIndex((u) => u.id === 'rapha-admin-id');
    const adminByEmailIndex = users.findIndex((u) => u.email.toLowerCase() === 'rapha@raphaelcosta.com.br');

    let existingAdminData = {};
    if (adminIndex > -1) {
        existingAdminData = users[adminIndex];
    } else if (adminByEmailIndex > -1) {
        existingAdminData = users[adminByEmailIndex];
    }
    
    // Remove all previous instances of the admin to avoid duplicates, preserving other users.
    const otherUsers = users.filter((u) => u.email.toLowerCase() !== 'rapha@raphaelcosta.com.br');

    // Create a new, consolidated admin user, ensuring it has the correct ID and defaults.
    const updatedAdmin: StoredUser = { ...createDefaultTeacher(), ...existingAdminData, id: 'rapha-admin-id' };
    
    const finalUsers = [...otherUsers, updatedAdmin];
    
    saveUsers(finalUsers);
    return finalUsers;

  } catch (error) {
    console.error("Failed to parse users from localStorage", error);
    // If parsing fails, create a fresh list with the default teacher.
    const defaultUsers = [createDefaultTeacher()];
    saveUsers(defaultUsers);
    return defaultUsers;
  }
};

export const saveUsers = (users: StoredUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};