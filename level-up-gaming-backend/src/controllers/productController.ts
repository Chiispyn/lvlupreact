// level-up-gaming-backend/src/controllers/productController.ts

import { type Request, type Response } from 'express';
import { products, type Product } from '../data/productData'; 
import { v4 as uuidv4 } from 'uuid'; 

// ----------------------------------------------------
// LECTURA Y UTILIDADES
// ----------------------------------------------------

const getProducts = (req: Request, res: Response) => {
    const { category } = req.query; // 🚨 Capturar el query parameter

    let filteredProducts = products;

    if (category) {
        // Filtrar por la categoría enviada por el Frontend
        filteredProducts = products.filter(p => 
            p.category.toLowerCase() === (category as string).toLowerCase()
        );
    }
    
    res.json(filteredProducts);
};

const getTopProducts = (req: Request, res: Response) => {
    const topProducts = products.filter(p => p.isTopSelling).slice(0, 4); 
    res.json(topProducts);
};

const getProductById = (req: Request, res: Response) => {
    const product = products.find(p => p.id === req.params.id);
    if (product) { res.json(product); } else { res.status(404).json({ message: 'Producto no encontrado' }); }
};

// ----------------------------------------------------
// ADMINISTRACIÓN (CRUD MOCKING)
// ----------------------------------------------------

// @route   POST /api/products (Crear)
const createProduct = (req: Request, res: Response) => {
    const { name, description, price, countInStock, isTopSelling, imageUrl, specifications, category } = req.body; 

    const newProduct: Product = {
        id: uuidv4(),
        name: name || 'Producto Nuevo',
        description: description || 'Descripción por defecto',
        price: price || 0,
        countInStock: countInStock || 0,
        isTopSelling: isTopSelling || false,
        rating: 0,
        numReviews: 0,
        specifications: specifications || '', // 🚨 Guardar el nuevo campo
        category: category || 'Accesorios', // 🚨 Guardar el nuevo campo
        imageUrl: imageUrl || 'https://via.placeholder.com/300x200/000000/FFFFFF?text=FOTO+DEL+PRODUCTO',
        reviews: []
    };

    products.push(newProduct); 
    res.status(201).json(newProduct);
};

// @route   PUT /api/products/:id (Actualizar)
const updateProduct = (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const index = products.findIndex(p => p.id === id);

    if (index !== -1) {
        const currentProduct = products[index];

        products[index] = { 
            ...currentProduct, 
            ...updateData,
            imageUrl: updateData.imageUrl || currentProduct.imageUrl,
            countInStock: Number(updateData.countInStock) || currentProduct.countInStock,
            price: Number(updateData.price) || currentProduct.price,
            specifications: updateData.specifications || currentProduct.specifications, // 🚨 Actualizar Specs
            category: updateData.category || currentProduct.category, // 🚨 Actualizar Categoría
        };
        res.json(products[index]);
        return;
    }

    res.status(404).json({ message: 'Producto no encontrado.' });
};

// @route   DELETE /api/products/:id (Eliminar)
const deleteProduct = (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = products.length;
    
    products.splice(0, products.length, ...products.filter(p => p.id !== id)); 

    if (products.length < initialLength) {
        res.status(200).json({ message: 'Producto eliminado.' });
    } else {
        res.status(404).json({ message: 'Producto no encontrado para eliminar.' });
    }
};

export { 
    getProducts, 
    getProductById, 
    getTopProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct 
};