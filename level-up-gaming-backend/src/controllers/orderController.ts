// level-up-gaming-backend/src/controllers/orderController.ts

import { type Request, type Response } from 'express';
import { mockOrders, Order, ShippingAddress } from '../data/orderData';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// LÓGICA DE CREACIÓN Y LECTURA DE ÓRDENES
// ----------------------------------------------------

// @route   POST /api/orders
const addOrderItems = (req: Request, res: Response) => {
    const { userId, items, shippingAddress, paymentMethod, totalPrice, shippingPrice } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No hay artículos en la orden.' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado para crear la orden.' });
    }

    const newOrder: Order = {
        id: uuidv4(),
        userId: userId,
        items: items,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        totalPrice: totalPrice,
        shippingPrice: shippingPrice,
        isPaid: true, 
        status: 'Pendiente', 
        createdAt: new Date().toISOString(),
    };

    mockOrders.push(newOrder); 

    res.status(201).json(newOrder);
};


// @route   GET /api/orders/myorders
const getMyOrders = (req: Request, res: Response) => {
    const userIdToFilter = req.query.userId; 

    if (!userIdToFilter) {
        return res.json([]);
    }

    const userOrders = mockOrders.filter(order => order.userId === userIdToFilter);

    res.json(userOrders);
};


// @route   GET /api/orders
const getAllOrders = (req: Request, res: Response) => {
    res.json(mockOrders);
};

// @route   PUT /api/orders/:id/status
const updateOrderStatus = (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body; 

    const orderIndex = mockOrders.findIndex(o => o.id === id);

    if (orderIndex !== -1) {
        // Asumiendo que el 'status' es un valor válido
        mockOrders[orderIndex].status = status;
        res.json(mockOrders[orderIndex]);
        return;
    }
    res.status(404).json({ message: 'Orden no encontrada.' });
};

export { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus };