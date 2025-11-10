import { StoredUser, Course, SidebarLink, CalendarEvent, StudyMaterial } from './types';
import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

// ===================================================================================
// NOTE TO DEVELOPER:
// This file now connects to a REAL Supabase backend.
// Ensure your Supabase project has the correct tables and RLS policies set up.
// ===================================================================================

// --- User Profile Management (Supabase Auth handles users) ---

export const getUserProfile = async (userId: string): Promise<StoredUser | null> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
    return data;
};

export const getAllUserProfiles = async (): Promise<StoredUser[]> => {
     const { data, error } = await supabase
        .from('profiles')
        .select('*');
    
    if (error) {
        console.error('Error fetching all profiles:', error);
        return [];
    }
    return data;
}

export const updateUserProfile = async (userId: string, profileData: Partial<StoredUser>): Promise<StoredUser> => {
    const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', userId)
        .select()
        .single();
    
    if (error) {
        console.error('Error updating profile:', error);
        throw error;
    }
    return data;
};


// --- Course Management ---

// Fix: Return type reflects that the API provides `iconName` string, not the component.
export const getCourses = async (): Promise<Omit<Course, 'icon'>[]> => {
    const { data, error } = await supabase
        .from('courses')
        .select('*');
    
    if (error) {
        console.error('Error fetching courses:', error);
        return [];
    }
    // Fix: Return raw data; component resolution is a UI concern.
    return data as Omit<Course, 'icon'>[];
};

// Fix: Return type reflects that the API provides `iconName` string, not the component.
export const saveCourse = async (course: Partial<Course>): Promise<Omit<Course, 'icon'>> => {
    const { data, error } = await supabase
        .from('courses')
        .upsert(course)
        .select()
        .single();

    if (error) {
        console.error('Error saving course:', error);
        throw error;
    }
    return data as Omit<Course, 'icon'>;
};

export const deleteCourse = async (courseId: string): Promise<void> => {
    const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
    
    if (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
};

// --- File/Material Upload ---

function base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
}

export const uploadMaterialFile = async (materialData: Omit<StudyMaterial, 'id'>): Promise<string> => {
    if (materialData.type !== 'file' || !materialData.content.startsWith('data:')) {
        throw new Error('Invalid file data for upload.');
    }
    
    const [meta, data] = materialData.content.split(',');
    const mimeType = meta.split(':')[1].split(';')[0];
    const fileBlob = base64ToBlob(data, mimeType);
    const fileName = `${uuidv4()}-${materialData.fileName || 'file'}`;
    
    const { data: uploadData, error } = await supabase.storage
        .from('material-files') // Make sure you have a bucket named 'material-files'
        .upload(fileName, fileBlob, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) {
        console.error("Error uploading file to Supabase Storage", error);
        throw new Error('fileProcessingError');
    }

    const { data: { publicUrl } } = supabase.storage.from('material-files').getPublicUrl(uploadData.path);
    
    return publicUrl;
}


// --- Sidebar Links Management ---

export const getLinks = async (): Promise<SidebarLink[]> => {
    const { data, error } = await supabase
        .from('sidebar_links')
        .select('*');
    
    if (error) {
        console.error('Error fetching links:', error);
        return [];
    }
    return data;
};

export const saveLink = async (link: Partial<SidebarLink>): Promise<SidebarLink> => {
    const { data, error } = await supabase
        .from('sidebar_links')
        .upsert(link)
        .select()
        .single();
    
    if (error) {
        console.error('Error saving link:', error);
        throw error;
    }
    return data;
};

export const deleteLink = async (linkId: string): Promise<void> => {
    const { error } = await supabase
        .from('sidebar_links')
        .delete()
        .eq('id', linkId);

    if (error) {
        console.error('Error deleting link:', error);
        throw error;
    }
};

// --- Calendar Events Management ---

export const getEvents = async (): Promise<CalendarEvent[]> => {
    const { data, error } = await supabase
        .from('calendar_events')
        .select('*');
    
    if (error) {
        console.error('Error fetching events:', error);
        return [];
    }
    return data;
};

export const saveEvent = async (event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const { data, error } = await supabase
        .from('calendar_events')
        .upsert(event)
        .select()
        .single();

    if (error) {
        console.error('Error saving event:', error);
        throw error;
    }
    return data;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);
    
    if (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
};