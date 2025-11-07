// level-up-gaming-backend/src/controllers/videoController.ts

import { type Request, type Response } from 'express';
import { getVideos as readVideos, Video } from '../data/videoData';
import { v4 as uuidv4 } from 'uuid';
import { writeToDb } from '../utils/dbUtils';

// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

const getFeaturedVideos = (req: Request, res: Response) => {
    try {
        const videos = readVideos();
        if (!videos) { return res.status(200).json([]); }
        const featured = videos.filter(v => v.isFeatured).slice(0, 2); 
        res.json(featured);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al procesar videos destacados.' });
    }
};

const getAllVideos = (req: Request, res: Response) => {
    try {
        res.json(readVideos()); 
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

        const videos = readVideos();
        videos.push(newVideo);
        writeToDb('video', videos);
        res.status(201).json(newVideo);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al crear video.' });
    }
};

const updateVideo = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const videos = readVideos();
        const videoIndex = videos.findIndex(v => v.id === id);

        if (videoIndex !== -1) {
            videos[videoIndex] = { ...videos[videoIndex], ...updateData };
            writeToDb('video', videos);
            res.json(videos[videoIndex]);
            return;
        }
        res.status(404).json({ message: 'Video no encontrado.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al actualizar video.' });
    }
};

const deleteVideo = (req: Request, res: Response) => {
    const { id } = req.params;
    let videos = readVideos();
    const initialLength = videos.length;
    
    videos = videos.filter(v => v.id !== id); 
    writeToDb('video', videos);

    if (videos.length < initialLength) {
        res.status(200).json({ message: 'Video eliminado.' });
    } else {
        res.status(404).json({ message: 'Video no encontrado.' });
    }
};

const toggleVideoFeature = (req: Request, res: Response) => {
    const { id } = req.params;

    const videos = readVideos();
    const videoIndex = videos.findIndex(v => v.id === id);

    if (videoIndex !== -1) {
        videos[videoIndex].isFeatured = !videos[videoIndex].isFeatured;
        writeToDb('video', videos);
        res.json(videos[videoIndex]);
        return;
    }
    res.status(404).json({ message: 'Video no encontrado.' });
};

export { getFeaturedVideos, getAllVideos, createVideo, updateVideo, deleteVideo, toggleVideoFeature };