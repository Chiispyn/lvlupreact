// level-up-gaming-frontend/src/pages/ProductsPage.tsx

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Alert, Button } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import { Product } from '../types/Product';

const API_URL = '/api/products';
// 🚨 Lista de Categorías (Debe ser consistente con el Backend)
const CATEGORIES = ['Consolas', 'Juegos', 'Accesorios', 'Laptops', 'Computadores', 'Juegos de Mesa'];


const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // 🚨 Estado para el filtro seleccionado
    const [selectedCategory, setSelectedCategory] = useState<string>(''); 

    // 🚨 FUNCIÓN DE FETCH: Ahora depende del 'categoryFilter' pasado como argumento
    const fetchProducts = async (categoryFilter: string) => {
        setLoading(true);
        setError(null);
        
        // Construir URL: si hay filtro, añade ?category=X
        const url = categoryFilter 
            ? `${API_URL}?category=${categoryFilter}` 
            : API_URL;

        try {
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('No se pudieron cargar los productos del servidor.');
            }

            const data: Product[] = await response.json();
            setProducts(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 🚨 Carga inicial: El useEffect llama a fetchProducts con el estado actual
        fetchProducts(selectedCategory); 
    }, [selectedCategory]); // 🚨 CLAVE: El hook se ejecuta CADA VEZ que selectedCategory cambia
    
    
    // Handler para los botones de filtro
    const handleCategoryFilter = (category: string) => {
        // 🚨 CAMBIO CLAVE: SÓLO actualizamos el estado. El useEffect hará el fetch.
        setSelectedCategory(category); 
    };


    if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
    if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;

    return (
        <Container className="py-5">
            <h1 style={{ color: 'var(--color-azul-electrico)' }}>Catálogo de Productos</h1>
            
            {/* SECCIÓN DE FILTROS */}
            <Row className="mb-4">
                <Col>
                    <Button 
                        variant={selectedCategory === '' ? 'primary' : 'outline-secondary'} 
                        onClick={() => handleCategoryFilter('')} 
                        className="me-2 mb-2"
                    >
                        Todos
                    </Button>
                    {CATEGORIES.map(cat => (
                        <Button 
                            key={cat}
                            variant={selectedCategory === cat ? 'primary' : 'outline-secondary'} 
                            onClick={() => handleCategoryFilter(cat)} // Llama al handler para cambiar el estado
                            className="me-2 mb-2"
                        >
                            {cat}
                        </Button>
                    ))}
                </Col>
            </Row>


            {/* LISTADO DE PRODUCTOS */}
            {products.length === 0 ? (
                <Alert variant="info">No hay productos disponibles en esta categoría.</Alert>
            ) : (
                <Row xs={1} md={2} lg={3} xl={4} className="g-4 mt-3">
                    {products.map((product) => (
                        <Col key={product.id}>
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </Container>
    );
};

export default ProductsPage;