import { CalendarEvent } from '../types';

// In-memory storage
let storedEvents: CalendarEvent[] = [];

export const getEvents = (): CalendarEvent[] => {
    return storedEvents;
};

export const saveEvents = (events: CalendarEvent[]): void => {
    storedEvents = events;
};