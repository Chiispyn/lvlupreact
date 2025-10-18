// level-up-gaming-backend/src/controllers/eventController.ts

import { type Request, type Response } from 'express';
import { mockEvents, Event } from '../data/eventData'; 
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

const getEvents = (req: Request, res: Response) => {
    try {
        if (!mockEvents) {
            return res.status(200).json([]);
        }
        
        const sortedEvents = mockEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        res.json(sortedEvents);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al procesar eventos.' });
    }
};


// ----------------------------------------------------
// ADMINISTRACIÓN (CRUD)
// ----------------------------------------------------

const createEvent = (req: Request, res: Response) => {
    try {
        const { title, date, time, location, mapEmbed } = req.body;

        if (!title || !date || !location) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: título, fecha y ubicación.' });
        }

        const newEvent: Event = {
            id: uuidv4(),
            title: title,
            date: date,
            time: time || '18:00', 
            location: location,
            mapEmbed: mapEmbed || '', 
        };

        mockEvents.push(newEvent);
        res.status(201).json(newEvent);

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al crear evento.' });
    }
};

const updateEvent = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const eventIndex = mockEvents.findIndex(e => e.id === id);

        if (eventIndex !== -1) {
            const currentEvent = mockEvents[eventIndex];
            
            mockEvents[eventIndex] = { 
                ...currentEvent, 
                ...updateData,
                mapEmbed: updateData.mapEmbed !== undefined ? updateData.mapEmbed : currentEvent.mapEmbed,
            };
            res.json(mockEvents[eventIndex]);
            return;
        }
        res.status(404).json({ message: 'Evento no encontrado para actualizar.' });

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al actualizar evento.' });
    }
};

const deleteEvent = (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = mockEvents.length;
    
    mockEvents.splice(0, mockEvents.length, ...mockEvents.filter(e => e.id !== id)); 

    if (mockEvents.length < initialLength) {
        res.status(200).json({ message: 'Evento eliminado.' });
    } else {
        res.status(404).json({ message: 'Evento no encontrado.' });
    }
};

export { getEvents, createEvent, updateEvent, deleteEvent };