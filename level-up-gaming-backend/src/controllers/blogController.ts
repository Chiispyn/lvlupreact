// level-up-gaming-backend/src/controllers/blogController.ts

import { type Request, type Response } from 'express';
import { mockBlogPosts, BlogPost } from '../data/blogData'; 
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

const getBlogPosts = (req: Request, res: Response) => {
    try {
        if (!mockBlogPosts) { return res.status(200).json([]); }
        
        const sortedPosts = mockBlogPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.json(sortedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al procesar blog.' });
    }
};

const getBlogPostById = (req: Request, res: Response) => {
    const { id } = req.params;
    const post = mockBlogPosts.find(p => p.id === id); // Busca el post por ID

    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ message: 'Post no encontrado.' });
    }
};

// ----------------------------------------------------
// ADMINISTRACIÓN (CRUD)
// ----------------------------------------------------

// ... (Funciones createBlogPost, updateBlogPost, deleteBlogPost) ...

const createBlogPost = (req: Request, res: Response) => {
    try {
        const { title, excerpt, content, imageUrl, author } = req.body;

        if (!title || !content) { return res.status(400).json({ message: 'Faltan campos obligatorios: título y contenido.' }); }

        const newPost: BlogPost = {
            id: uuidv4(),
            title: title,
            excerpt: excerpt || 'Sin resumen',
            content: content,
            imageUrl: imageUrl || 'https://picsum.photos/id/500/300/200',
            author: author || 'Admin',
            createdAt: new Date().toISOString(),
        };

        mockBlogPosts.push(newPost);
        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al crear post.' });
    }
};

const updateBlogPost = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const postIndex = mockBlogPosts.findIndex(p => p.id === id);

        if (postIndex !== -1) {
            mockBlogPosts[postIndex] = { ...mockBlogPosts[postIndex], ...updateData };
            res.json(mockBlogPosts[postIndex]);
            return;
        }
        res.status(404).json({ message: 'Post no encontrado para actualizar.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al actualizar post.' });
    }
};

const deleteBlogPost = (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = mockBlogPosts.length;
    
    mockBlogPosts.splice(0, mockBlogPosts.length, ...mockBlogPosts.filter(p => p.id !== id)); 

    if (mockBlogPosts.length < initialLength) {
        res.status(200).json({ message: 'Post eliminado.' });
    } else {
        res.status(404).json({ message: 'Post no encontrado.' });
    }
};

// 🚨 EXPORTAR LA NUEVA FUNCIÓN
export { getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost };