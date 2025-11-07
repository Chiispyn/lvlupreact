// level-up-gaming-backend/src/controllers/eventController.ts

import { type Request, type Response } from 'express';
import { getEvents as readEvents, Event } from '../data/eventData'; 
import { v4 as uuidv4 } from 'uuid';
import { writeToDb } from '../utils/dbUtils';

// 🚨 FUNCIÓN AUXILIAR: Extrae la URL de incrustación del iframe completo
const extractEmbedSrc = (fullCode: string): string => {
    const match = fullCode.match(/src="([^"]+)"/);
    return match ? match[1] : fullCode.includes('http') ? fullCode : ''; 
};


// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

const getEvents = (req: Request, res: Response) => {
    try {
        const events = readEvents();
        if (!events) { return res.status(200).json([]); }
        
        const sortedEvents = events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        res.json(sortedEvents);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al procesar eventos.' });
    }
};


// ----------------------------------------------------
// ADMINISTRACIÓN (CRUD)
// ----------------------------------------------------

// @route   POST /api/events/admin
const createEvent = (req: Request, res: Response) => {
    try {
        const { title, date, time, location, mapEmbed, notes } = req.body; 

        if (!title || !date || !location) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: título, fecha y ubicación.' });
        }
        
        const finalEmbedUrl = extractEmbedSrc(mapEmbed);

        const newEvent: Event = {
            id: uuidv4(),
            title: title,
            date: date,
            time: time || '18:00', 
            location: location,
            mapEmbed: finalEmbedUrl, 
            notes: notes || '',
        };

        const events = readEvents();
        events.push(newEvent);
        writeToDb('event', events);
        res.status(201).json(newEvent);

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al crear evento.' });
    }
};

const updateEvent = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const events = readEvents();
        const eventIndex = events.findIndex(e => e.id === id);
        
        if (eventIndex !== -1) {
            const currentEvent = events[eventIndex];
            
            if (updateData.mapEmbed) {
                updateData.mapEmbed = extractEmbedSrc(updateData.mapEmbed);
            }

            events[eventIndex] = { 
                ...currentEvent, 
                ...updateData,
                date: updateData.date || currentEvent.date,
                time: updateData.time || currentEvent.time,
                mapEmbed: updateData.mapEmbed !== undefined ? updateData.mapEmbed : currentEvent.mapEmbed,
                notes: updateData.notes !== undefined ? updateData.notes : currentEvent.notes,
            };
            writeToDb('event', events);
            res.json(events[eventIndex]);
            return;
        }
        res.status(404).json({ message: 'Evento no encontrado para actualizar.' });

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al actualizar evento.' });
    }
};

// @route   DELETE /api/events/:id/admin
const deleteEvent = (req: Request, res: Response) => {
    const { id } = req.params;
    let events = readEvents();
    const initialLength = events.length;
    
    events = events.filter(e => e.id !== id); 
    writeToDb('event', events);

    if (events.length < initialLength) {
        res.status(200).json({ message: 'Evento eliminado.' });
    } else {
        res.status(404).json({ message: 'Evento no encontrado.' });
    }
};

export { getEvents, createEvent, updateEvent, deleteEvent };