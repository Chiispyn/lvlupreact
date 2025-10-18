// level-up-gaming-backend/src/controllers/orderController.ts (Código Completo)

import { type Request, type Response } from 'express';
import { mockOrders, Order, ShippingAddress } from '../data/orderData';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// LÓGICA DE CREACIÓN Y LECTURA DE ÓRDENES
// ----------------------------------------------------

// @route   POST /api/orders
const addOrderItems = (req: Request, res: Response) => {
    const { userId, items, shippingAddress, paymentMethod, totalPrice, shippingPrice } = req.body;

    if (!items || items.length === 0) { res.status(400).json({ message: 'No hay artículos en la orden.' }); return; }

    const newOrder: Order = {
        id: uuidv4(),
        userId: userId,
        items: items,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        totalPrice: totalPrice,
        shippingPrice: shippingPrice,
        isPaid: true,
        // 🚨 Estado Inicial: Pendiente
        status: 'Pendiente', 
        createdAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder); 

    res.status(201).json(newOrder);
};


// @route   GET /api/orders/myorders
const getMyOrders = (req: Request, res: Response) => {
    const userIdToFilter = req.query.userId || 'u1'; 
    const userOrders = mockOrders.filter(order => order.userId === userIdToFilter);
    res.json(userOrders);
};


// ----------------------------------------------------
// LÓGICA DE ADMINISTRACIÓN (Actualizar Estado)
// ----------------------------------------------------

// @route   GET /api/orders
const getAllOrders = (req: Request, res: Response) => {
    res.json(mockOrders);
};

// @route   PUT /api/orders/:id/status
// @desc    Actualizar el estado de la orden por Admin
const updateOrderStatus = (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; // Nuevo estado: 'Preparacion', 'Enviada', etc.

    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex !== -1) {
        mockOrders[orderIndex].status = status;
        res.json(mockOrders[orderIndex]);
        return;
    }
    res.status(404).json({ message: 'Orden no encontrada.' });
};

export { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus };