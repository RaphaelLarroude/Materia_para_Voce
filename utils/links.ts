import { SidebarLink } from '../types';
import { generateId } from './auth';

const LINKS_KEY = 'materiaParaVoce_sidebarLinks';

const defaultLinkKeys = [
  'changePassword', 'accessEmail', 'accessCanva',
  'accessPadlet', 'downloadTeams', 'downloadInsight',
  'audioCollection', 'imageCollection', 'accessMatific'
];

const getDefaultLinks = (): SidebarLink[] => {
    const defaultTexts: { [key: string]: string } = {
        changePassword: 'ALTERAÇÃO DE SENHA',
        accessEmail: 'ACESSO AO E-MAIL',
        accessCanva: 'ACESSO AO CANVA',
        accessPadlet: 'ACESSO AO PADLET',
        downloadTeams: 'DOWNLOAD DO TEAMS',
        downloadInsight: 'DOWNLOAD DO INSIGHT',
        audioCollection: 'ACERVO DE ÁUDIOS INTEF - YOUTUBE',
        imageCollection: 'ACERVO DE IMAGENS INTEF - PIXABAY',
        accessMatific: 'ACESSO AO MATIFIC',
    };
    return defaultLinkKeys.map(key => ({
        id: generateId(),
        text: defaultTexts[key] || key.replace(/([A-Z])/g, ' $1').toUpperCase(),
        url: '#', // Default URL is empty
    }));
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
