// level-up-gaming-frontend/src/pages/BlogPostPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'react-feather';
import axios from 'axios';

// Interface (debe coincidir con el Backend)
interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string; // 🚨 CONTENIDO COMPLETO DEL POST
    imageUrl: string;
    author: string;
    createdAt: string;
}

const BlogPostPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); 
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!id) return;

            try {
                // 🚨 LLAMADA A LA API para obtener el post por ID
                const { data } = await axios.get(`/api/blog/${id}`);
                setPost(data);
            } catch (err: any) {
                setError('No se pudo encontrar el artículo.');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [id]);


    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert><Link to="/blog"><Button variant="secondary" className="mt-3">Volver al Blog</Button></Link></Container>;
    if (!post) return <Container className="py-5"><Alert variant="danger">Artículo no encontrado.</Alert><Link to="/blog"><Button variant="secondary" className="mt-3">Volver al Blog</Button></Link></Container>;

    return (
        <Container className="py-5">
            <Link to="/blog" className="text-decoration-none">
                <Button variant="outline-secondary" size="sm" className="mb-4">
                    <ArrowLeft size={16} className="me-2"/> Volver al Blog
                </Button>
            </Link>

            <h1 className="display-5 mb-3" style={{ color: '#39FF14' }}>{post.title}</h1>
            <div className="mb-4 text-muted">
                Por **{post.author}** el {new Date(post.createdAt).toLocaleDateString()}
            </div>
            
            <img 
                src={post.imageUrl} 
                alt={post.title} 
                className="img-fluid rounded shadow-sm mb-5" 
                style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }}
            />

            {/* 🚨 RENDERIZADO DEL CONTENIDO COMPLETO */}
            <div 
                className="blog-content lead text-white" 
                // Inyecta el contenido HTML guardado en el Backend
                dangerouslySetInnerHTML={{ __html: post.content }} 
            />

            <footer className="mt-5 pt-3 border-top">
                 <Link to="/blog"><Button variant="secondary">Más Artículos</Button></Link>
            </footer>

        </Container>
    );
};

export default BlogPostPage;