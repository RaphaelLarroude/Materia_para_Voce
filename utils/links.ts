import { SidebarLink } from '../types';

const LINKS_KEY = 'materiaParaVoce_sidebarLinks';

const getDefaultLinks = (): SidebarLink[] => {
    return [];
};

export const getLinks = (): SidebarLink[] => {
  try {
    const linksJson = localStorage.getItem(LINKS_KEY);
    if (linksJson) {
      return JSON.parse(linksJson);
    } else {
      // First time setup
      const defaultLinks = getDefaultLinks();
      saveLinks(defaultLinks);
      return defaultLinks;
    }
  } catch (error) {
    console.error("Failed to parse links from localStorage", error);
    const defaultLinks = getDefaultLinks();
    saveLinks(defaultLinks);
    return defaultLinks;
  }
};

export const saveLinks = (links: SidebarLink[]): void => {
  localStorage.setItem(LINKS_KEY, JSON.stringify(links));
};