// level-up-gaming-backend/src/controllers/videoController.ts

import { type Request, type Response } from 'express';
import { mockVideos, Video } from '../data/videoData';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

// @route   GET /api/videos/featured (Para HomePage)
const getFeaturedVideos = (req: Request, res: Response) => {
    // Devuelve solo los marcados como destacados (máximo 2 para el home)
    const featured = mockVideos.filter(v => v.isFeatured).slice(0, 2); 
    res.json(featured);
};

// @route   GET /api/videos (Para Admin)
const getAllVideos = (req: Request, res: Response) => {
    res.json(mockVideos);
};


// ----------------------------------------------------
// ADMINISTRACIÓN (CRUD)
// ----------------------------------------------------

// @route   POST /api/videos/admin (Crear)
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

// @route   PUT /api/videos/:id/admin (Actualizar)
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

// @route   DELETE /api/videos/:id/admin (Eliminar)
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

export { getFeaturedVideos, getAllVideos, createVideo, updateVideo, deleteVideo };