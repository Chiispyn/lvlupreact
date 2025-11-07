// level-up-gaming-backend/src/data/eventData.ts

export interface Event {
    id: string;
    title: string;
    date: string; 
    time: string; 
    location: string;
    mapEmbed: string;
    notes:String
}

import { readFromDb } from '../utils/dbUtils';

export const getEvents = (): Event[] => readFromDb<Event>('event');