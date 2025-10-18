// level-up-gaming-frontend/src/pages/HomePage.tsx (CÓDIGO COMPLETO)

import React, { useState, useEffect } from 'react'; 
import { Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
import ProductCard from '../components/ProductCard'; 
import HeroSection from '../components/HeroSection'; // IMPORTAR NUEVO HERO
import { Product } from '../types/Product'; 
import { Video } from 'react-feather';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Interfaces (deben coincidir con las APIs consumidas)
interface BlogPost {
    id: string; title: string; excerpt: string; imageUrl: string; author: string; createdAt: string;
}
interface VideoItem { 
    id: string; title: string; embedUrl: string; isFeatured: boolean; 
}


// Componente BlogCard simplificado (muestra noticias)
const NewsCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <Card className="h-100 shadow-sm" style={{ backgroundColor: '#111', color: 'white', border: '1px solid #1E90FF' }}>
        <Card.Body>
            <Card.Title style={{ color: '#1E90FF' }}>
                <Link to={`/blog/${post.id}`} style={{ color: 'inherit' }}>{post.title}</Link>
            </Card.Title>
            <Card.Text className="text-primary">{post.excerpt}</Card.Text>
        </Card.Body>
    </Card>
);


const HomePage: React.FC = () => {
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [loadingTop, setLoadingTop] = useState(true);
    
    const [latestNews, setLatestNews] = useState<BlogPost[]>([]);
    const [loadingNews, setLoadingNews] = useState(true);
    
    const [featuredVideos, setFeaturedVideos] = useState<VideoItem[]>([]);
    const [loadingVideos, setLoadingVideos] = useState(true);


    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                // Fetch de productos destacados
                const response = await fetch('/api/products/top'); 
                const data: Product[] = await response.json();
                // 🚨 Asegurar que solo se muestren 4, aunque la API ya filtra el top selling
                setTopProducts(data.slice(0, 4)); 
            } catch (error) {
                console.error("Error al cargar productos destacados:", error);
            } finally {
                setLoadingTop(false);
            }
        };
        
        const fetchLatestNews = async () => {
            try {
                const response = await axios.get('/api/blog');
                // 🚨 CORRECCIÓN: Tomar solo 3 noticias para el layout
                setLatestNews(response.data.slice(0, 3)); 
            } catch (error) {
                console.error("Error al cargar noticias:", error);
            } finally {
                setLoadingNews(false);
            }
        };

        const fetchFeaturedVideos = async () => {
            try {
                const response = await axios.get('/api/videos/featured'); 
                setFeaturedVideos(response.data.slice(0, 2)); 
            } catch (error) {
                console.error("Error al cargar videos destacados:", error);
            } finally {
                setLoadingVideos(false);
            }
        };

        fetchTopProducts();
        fetchLatestNews();
        fetchFeaturedVideos();
    }, []);

    return (
        <>
            {/* 🚨 1. SECCIÓN PRINCIPAL: HERO SECTION */}
            <HeroSection />
            
            <Container className="py-5">
                {/* 2. SECCIÓN: PRODUCTOS MÁS VENDIDOS */}
                <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-azul-electrico)' }}>🔥 Más Vendidos</h2>
                
                {loadingTop ? (<div className="text-center mb-5"><Spinner animation="grow" size="sm" /></div>) : (
                    <Row xs={1} md={2} lg={4} className="g-4 mb-5">
                        {topProducts.map((product) => (<Col key={product.id}><ProductCard product={product} /></Col>))}
                    </Row>
                )}

                {/* 3. SECCIÓN: NOTICIAS GAMING (Dinámicas de la API) */}
                <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-azul-electrico)' }}>📰 Últimas Noticias Gaming</h2>
                
                {loadingNews ? (<Container className="py-3 text-center"><Spinner animation="border" /></Container>) : (
                    latestNews.length === 0 ? (
                        <Alert variant="secondary" className="text-center">No hay noticias destacadas.</Alert>
                    ) : (
                        <Row xs={1} md={3} className="g-4 mb-5"> {/* 🚨 Layout para 3 noticias */}
                            {latestNews.map((post) => (<Col key={post.id}><NewsCard post={post} /></Col>))}
                        </Row>
                    )
                )}

                {/* 4. SECCIÓN: VIDEOS (Renderizado Iframe Completo) */}
                <h2 className="text-center mb-4 border-bottom pb-2" style={{ color: 'var(--color-azul-electrico)' }}><Video className="me-2"/> Tutoriales y Reviews</h2>
                
                {loadingVideos ? (
                    <Container className="py-3 text-center"><Spinner animation="border" /></Container>
                ) : featuredVideos.length === 0 ? (
                    <Alert variant="secondary" className="text-center">No hay videos destacados para mostrar.</Alert>
                ) : (
                    <Row xs={1} md={2} className="g-4 mb-5">
                        {featuredVideos.map((video) => (
                            <Col key={video.id}>
                                <Card className="h-100 shadow-sm" style={{ backgroundColor: '#111', color: 'white', border: '1px solid var(--color-azul-electrico)' }}>
                                    <Card.Body>
                                        <Card.Title style={{ color: 'var(--color-azul-electrico)' }}>{video.title}</Card.Title>
                                        
                                        <div 
                                            className="ratio ratio-16x9 mb-3" 
                                            dangerouslySetInnerHTML={{ __html: video.embedUrl }} 
                                        />
                                        
                                        <p className="mt-2 text-center text-muted">{video.title}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </>
    );
};

export default HomePage;