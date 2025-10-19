// level-up-gaming-frontend/src/context/CartContext.tsx

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/Product';

// 1. Tipos de Item del Carrito
export interface CartItem {
    product: Product;
    quantity: number;
    isRedeemed?: boolean; // 🚨 NUEVO: True si viene de un canje
    pointsCost?: number;   // 🚨 NUEVO: Costo del canje (para restar al checkout)
}

// 2. Tipos del Contexto
interface CartContextType {
    cartItems: CartItem[];
    cartCount: number;
    totalPrice: number;
    addToCart: (product: Product, quantity?: number, isRedeemed?: boolean, pointsCost?: number) => void; // 🚨 Parámetros actualizados
    removeFromCart: (productId: string) => void;
    increaseQuantity: (productId: string) => void;
    decreaseQuantity: (productId: string) => void;
    clearCart: () => void;
}

// 3. Creación del Contexto
const CartContext = createContext<CartContextType | undefined>(undefined);

// 4. Proveedor del Contexto
interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    // 🚨 Estado principal del carrito (usaremos localStorage para persistencia)
    const [cartItems, setCartItems] = useState<CartItem[]>(() => {
        const storedCart = localStorage.getItem('cart');
        return storedCart ? JSON.parse(storedCart) : [];
    });

    // Función para guardar en localStorage cada vez que cartItems cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);


    // CALCULAR VALORES DERIVADOS
    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    // Nota: Los ítems canjeados tienen precio 0, así que el total es correcto
    const totalPrice = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    // LÓGICA DE MANEJO DE ESTADO
    
    const addToCart = (product: Product, quantity = 1, isRedeemed = false, pointsCost = 0) => {
        setCartItems(prevItems => {
            const exists = prevItems.find(item => item.product.id === product.id);

            if (exists) {
                // Si existe, incrementa la cantidad (revisando stock)
                return prevItems.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: Math.min(item.quantity + quantity, item.product.countInStock) }
                        : item
                );
            } else {
                // Si no existe, añade el nuevo item (revisando stock)
                if (product.countInStock > 0 || isRedeemed) { // Permite añadir el canje aunque el stock sea 0 (es un mock product)
                    return [...prevItems, { 
                        product, 
                        quantity: Math.min(quantity, product.countInStock || 1), // Stock 1 para canje si es 0
                        isRedeemed, 
                        pointsCost 
                    }];
                }
                return prevItems; // No añade si el stock es 0
            }
        });
    };

    const removeFromCart = (productId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
    };

    const increaseQuantity = (productId: string) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId 
                    ? { ...item, quantity: Math.min(item.quantity + 1, item.product.countInStock) } 
                    : item
            )
        );
    };

    const decreaseQuantity = (productId: string) => {
        setCartItems(prevItems =>
            prevItems
                .map(item =>
                    item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                )
                .filter(item => item.quantity > 0) // Elimina si la cantidad llega a 0
        );
    };
    
    const clearCart = () => {
        setCartItems([]);
    };


    const value = {
        cartItems,
        cartCount,
        totalPrice,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        clearCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// 5. Hook Personalizado para Consumir el Contexto
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};