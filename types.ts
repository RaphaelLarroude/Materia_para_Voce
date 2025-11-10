import type { ComponentType } from 'react';

export type Classroom = 'A' | 'B' | 'C' | 'D' | 'E';
export type SchoolYear = 6 | 7 | 8 | 9;
export type UserRole = 'student' | 'teacher';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  classroom: Classroom;
  year: SchoolYear;
  profilePictureUrl?: string;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  type: 'file' | 'link';
  content: string; // Data URL for file, or http link for link
  fileName?: string; // e.g., 'chapter-1.pdf'
  fileType?: string; // e.g., 'application/pdf'
  classrooms?: Classroom[];
  years?: SchoolYear[];
}

export interface StudyMaterialCategory {
  id: string;
  title: string;
  illustrationUrl: string;
  materials: StudyMaterial[];
  classrooms?: Classroom[];
  years?: SchoolYear[];
}

export interface CourseModule {
  id: string;
  title: string;
  illustrationUrl: string;
  categories: StudyMaterialCategory[];
  classrooms?: Classroom[];
  years?: SchoolYear[];
}

export interface Course {
  id: string;
  title: string;
  teacher: string;
  teacherId: string;
  icon: ComponentType<{ className?: string }>;
  content: CourseModule[];
  imageUrl: string;
  status: string;
  progress: number;
  classrooms?: Classroom[];
  years?: SchoolYear[];
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  course: string;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'pink';
  classrooms?: Classroom[];
  years?: SchoolYear[];
}

export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface SidebarLink {
  id:string;
  text: string;
  url: string;
  classrooms?: Classroom[];
  years?: SchoolYear[];
}

export type Language = 'PT_BR' | 'EN' | 'ES';