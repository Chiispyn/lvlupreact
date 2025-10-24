// level-up-gaming-frontend/src/context/CartContext.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { CartProvider, useCart } from './CartContext';
import { Product } from '../types/Product'; // Asumiendo que la interfaz Product está aquí

// Mock de localStorage (necesario para persistencia)
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value.toString(); }),
        clear: vi.fn(() => { store = {}; })
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Componente Wrapper para el hook
const MockWrapper = ({ children }: { children: ReactNode }) => (
    <CartProvider>{children}</CartProvider>
);

// 🚨 CORRECCIÓN CRÍTICA: Definiciones de productos COMPLETAS para la interfaz Product

const createMockProduct = (id: string, name: string, price: number, countInStock: number, isRedeemed = false): Product => ({
    id: id,
    name: name,
    description: `Descripción para ${name}`, 
    price: price, 
    imageUrl: `/images/${id}.png`, 
    rating: 4.5, 
    numReviews: 10,
    isTopSelling: true,
    countInStock: countInStock,
    specifications: '{}',
    category: 'Consolas', 
    reviews: [],
    // Añadimos un campo "image" si tu interfaz Product lo tiene, si no, se ignora.
    // image: `/images/${id}.png`, 
});


const mockProductA: Product = createMockProduct('p1', 'Product A', 10000, 5);
const mockProductB: Product = createMockProduct('p2', 'Product B', 50000, 2);
const mockRedeemed: Product = {
    ...createMockProduct('r1', '[CANJE] Recompensa', 0, 1, true),
    reviews: [], // Asegura reviews es un array si la interfaz lo requiere
    category: 'Reward',
    specifications: '{}',
    numReviews: 0,
    rating: 0,
};


describe('CartContext: Lógica de Carrito y Totales', () => {
    
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    it('1. Deberia inicializar con un carrito empty(vacio) y contar 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });
        
        expect(result.current.cartCount).toBe(0);
        expect(result.current.totalPrice).toBe(0);
        expect(result.current.cartItems).toHaveLength(0);
    });

    it('2.Deberia agregar un producto y calcular el precio correcto', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 2);
        });
        
        expect(result.current.cartCount).toBe(2);
        expect(result.current.totalPrice).toBe(20000); 
        expect(result.current.cartItems).toHaveLength(1);
    });

    it('3. Deberia incrementar la cantidad de un producto existente(hasta el limite de su stock)', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductB, 1);
        });
        
        // Stock es 2.
        act(() => {
            result.current.increaseQuantity(mockProductB.id); // Cantidad ahora es 2
        });
        // La siguiente llamada debe ser ignorada ya que la cantidad es igual al stock
        act(() => {
            result.current.increaseQuantity(mockProductB.id); 
        });
        
        // La cantidad máxima debe ser 2 (stock)
        expect(result.current.cartItems[0].quantity).toBe(2);
        expect(result.current.totalPrice).toBe(100000); 
    });
    
    it('4. deberia remover el item cuando la cantidad disminuye a 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 1);
            result.current.decreaseQuantity(mockProductA.id); 
        });
        
        expect(result.current.cartCount).toBe(0);
        expect(result.current.cartItems).toHaveLength(0);
    });
    
    it('5. "Vaciar carrito" deberia vaciar el carrito completo', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            result.current.addToCart(mockProductA, 1);
            result.current.addToCart(mockProductB, 1);
            result.current.clearCart(); 
        });
        
        expect(result.current.cartCount).toBe(0);
        expect(result.current.totalPrice).toBe(0);
    });

    it('6. Deberia manejar la adicion de puntos a recompensas y dejar el producto en precio 0', () => {
        const { result } = renderHook(() => useCart(), { wrapper: MockWrapper });

        act(() => {
            // Producto A con precio normal
            result.current.addToCart(mockProductA, 1); 
            // Producto C (Canjeado) con precio 0, costo de puntos 1000
            result.current.addToCart(mockRedeemed, 1, true, 1000);
        });
        
        // Total Price debe ser solo de A (10000). Points cost debe ser 1000.
        expect(result.current.cartItems).toHaveLength(2);
        expect(result.current.totalPrice).toBe(10000); 
        expect(result.current.cartItems.find(i => i.isRedeemed)?.pointsCost).toBe(1000);
    });
});