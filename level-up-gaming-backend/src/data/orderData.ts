// level-up-gaming-backend/src/data/orderData.ts

import { CartItem } from '../../../level-up-gaming-frontend/src/context/CartContext'; // Usamos el tipo CartItem del Frontend como referencia

export interface ShippingAddress {
    street: string;
    city: string;
    region: string;
    zipCode?: string;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    shippingAddress: ShippingAddress;
    paymentMethod: 'webpay' | 'transferencia' | 'efectivo';
    totalPrice: number;
    shippingPrice: number;
    isPaid: boolean;
    // 🚨 CAMBIO CRÍTICO: Usaremos un string para el estado
    status: 'Pendiente' | 'Preparacion' | 'Enviada' | 'Entregada'; 
    createdAt: string;
}

// Array mutable para almacenar las órdenes creadas (nuestra "DB" de órdenes)
export let mockOrders: Order[] = [];