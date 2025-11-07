// level-up-gaming-backend/src/data/blogData.ts

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string; // Contenido completo y detallado
    imageUrl: string;
    author: string;

}

import { readFromDb } from '../utils/dbUtils';

export const getBlogPosts = (): BlogPost[] => readFromDb<BlogPost>('blog');