// level-up-gaming-backend/src/controllers/videoController.ts

import { type Request, type Response } from 'express';
import { mockVideos, Video } from '../data/videoData';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

const getFeaturedVideos = (req: Request, res: Response) => {
    try {
        if (!mockVideos) { return res.status(200).json([]); }
        const featured = mockVideos.filter(v => v.isFeatured).slice(0, 2); 
        res.json(featured);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al procesar videos destacados.' });
    }
};

const getAllVideos = (req: Request, res: Response) => {
    try {
        // 🚨 ESTA RUTA DEBE DEVOLVER EL ARRAY COMPLETO PARA EL ADMIN
        res.json(mockVideos); 
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al procesar videos.' });
    }
};


// ----------------------------------------------------
// ADMINISTRACIÓN (CRUD)
// ----------------------------------------------------

const createVideo = (req: Request, res: Response) => {
    try {
        const { title, embedUrl, isFeatured } = req.body;

        if (!title || !embedUrl) {
            return res.status(400).json({ message: 'Faltan campos obligatorios: título y URL de incrustación.' });
        }

        const newVideo: Video = {
            id: uuidv4(),
            title: title,
            embedUrl: embedUrl,
            isFeatured: isFeatured || false,
        };

        mockVideos.push(newVideo);
        res.status(201).json(newVideo);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al crear video.' });
    }
};

const updateVideo = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const videoIndex = mockVideos.findIndex(v => v.id === id);

        if (videoIndex !== -1) {
            mockVideos[videoIndex] = { ...mockVideos[videoIndex], ...updateData };
            res.json(mockVideos[videoIndex]);
            return;
        }
        res.status(404).json({ message: 'Video no encontrado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al actualizar video.' });
    }
};

const deleteVideo = (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = mockVideos.length;
    
    mockVideos.splice(0, mockVideos.length, ...mockVideos.filter(v => v.id !== id)); 

    if (mockVideos.length < initialLength) {
        res.status(200).json({ message: 'Video eliminado.' });
    } else {
        res.status(404).json({ message: 'Video no encontrado.' });
    }
};

const toggleVideoFeature = (req: Request, res: Response) => {
    const { id } = req.params;

    const videoIndex = mockVideos.findIndex(v => v.id === id);

    if (videoIndex !== -1) {
        // 🚨 Simulación: Invertir el estado 'isFeatured'
        mockVideos[videoIndex].isFeatured = !mockVideos[videoIndex].isFeatured;
        
        // Devolvemos el objeto actualizado
        res.json(mockVideos[videoIndex]);
        return;
    }
    res.status(404).json({ message: 'Video no encontrado.' });
};

export { getFeaturedVideos, getAllVideos, createVideo, updateVideo, deleteVideo, toggleVideoFeature };