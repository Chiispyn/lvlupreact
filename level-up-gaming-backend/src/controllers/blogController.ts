// level-up-gaming-backend/src/controllers/blogController.ts

import { type Request, type Response } from 'express';
import { getBlogPosts as readBlogPosts, BlogPost } from '../data/blogData'; 
import { v4 as uuidv4 } from 'uuid';
import { writeToDb } from '../utils/dbUtils';

// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

const getBlogPosts = (req: Request, res: Response) => {
    try {
        const blogPosts = readBlogPosts();
        if (!blogPosts) { return res.status(200).json([]); }
        
        const sortedPosts = blogPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        res.json(sortedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al procesar blog.' });
    }
};

const getBlogPostById = (req: Request, res: Response) => {
    const { id } = req.params;
    const blogPosts = readBlogPosts();
    const post = blogPosts.find(p => p.id === id); // Busca el post por ID

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

        const blogPosts = readBlogPosts();
        blogPosts.push(newPost);
        writeToDb('blog', blogPosts);
        res.status(201).json(newPost);

    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al crear post.' });
    }
};

const updateBlogPost = (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const blogPosts = readBlogPosts();
        const postIndex = blogPosts.findIndex(p => p.id === id);

        if (postIndex !== -1) {
            blogPosts[postIndex] = { ...blogPosts[postIndex], ...updateData };
            writeToDb('blog', blogPosts);
            res.json(blogPosts[postIndex]);
            return;
        }
        res.status(404).json({ message: 'Post no encontrado para actualizar.' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor al actualizar post.' });
    }
};

const deleteBlogPost = (req: Request, res: Response) => {
    const { id } = req.params;
    let blogPosts = readBlogPosts();
    const initialLength = blogPosts.length;
    
    blogPosts = blogPosts.filter(p => p.id !== id); 
    writeToDb('blog', blogPosts);

    if (blogPosts.length < initialLength) {
        res.status(200).json({ message: 'Post eliminado.' });
    } else {
        res.status(404).json({ message: 'Post no encontrado.' });
    }
};

// 🚨 EXPORTAR LA NUEVA FUNCIÓN
export { getBlogPosts, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost };