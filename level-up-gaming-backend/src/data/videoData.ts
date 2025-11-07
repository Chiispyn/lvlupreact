// level-up-gaming-backend/src/data/videoData.ts

export interface Video {
    id: string;
    title: string;
    embedUrl: string; // Almacenará el código <iframe> completo
    isFeatured: boolean; 
}

// 🚨 Lista final de videos destacados para la Experiencia 2
import { readFromDb } from '../utils/dbUtils';

export const getVideos = (): Video[] => readFromDb<Video>('video');