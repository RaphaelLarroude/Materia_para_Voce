import { CalendarEvent } from '../types';

const EVENTS_KEY = 'materiaParaVoce_calendarEvents';

export const getEvents = (): CalendarEvent[] => {
  try {
    const eventsJson = localStorage.getItem(EVENTS_KEY);
    return eventsJson ? JSON.parse(eventsJson) : [];
  } catch (error) {
    console.error("Failed to parse events from localStorage", error);
    localStorage.removeItem(EVENTS_KEY);
    return [];
  }
};

export const saveEvents = (events: CalendarEvent[]): void => {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
};
