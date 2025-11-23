import { SidebarLink } from '../types';

const getDefaultLinks = (): SidebarLink[] => {
    return [];
};

// In-memory storage
let storedLinks: SidebarLink[] = getDefaultLinks();

export const getLinks = (): SidebarLink[] => {
    return storedLinks;
};

export const saveLinks = (links: SidebarLink[]): void => {
    storedLinks = links;
};