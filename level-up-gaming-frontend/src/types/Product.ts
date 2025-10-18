// level-up-gaming-frontend/src/types/Product.ts

// 🚨 Interfaz de Comentarios (debe ser la misma que en el Backend)
export interface Review {
    id: string;
    name: string;
    rating: number; // 1 a 5
    comment: string;
    createdAt: string;
}

// 🚨 Interfaz Principal del Producto
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // Precio en CLP
    imageUrl: string;
    rating: number; 
    numReviews: number;
    isTopSelling: boolean;
    countInStock: number;
    
    // Campos añadidos
    specifications: string; // Datos técnicos (JSON string)
    category: string; 
    reviews: Review[]; // Lista de comentarios para la página de detalle
}