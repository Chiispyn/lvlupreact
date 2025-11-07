// level-up-gaming-backend/src/controllers/orderController.ts

import { type Request, type Response } from 'express';
import { type Order } from '../data/orderData';
import { type User } from '../data/userData';
import { v4 as uuidv4 } from 'uuid';
import { readFromDb, writeToDb } from '../utils/dbUtils';

// ----------------------------------------------------
// LÓGICA DE CREACIÓN Y LECTURA DE ÓRDENES
// ----------------------------------------------------

const addOrderItems = (req: Request, res: Response) => {
    const { userId, items, shippingAddress, paymentMethod, totalPrice, shippingPrice } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No hay artículos en la orden.' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Usuario no autenticado para crear la orden.' });
    }

    let orders = readFromDb<Order>('orders');
    if (!Array.isArray(orders)) {
        console.warn('Orders data is not an array, initializing as empty array.');
        orders = [];
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
    console.log('Type of orders before push:', typeof orders, 'Value:', orders);
    orders.push(newOrder);
    writeToDb<Order>('orders', orders);

    // 2. Asignar puntos al usuario por la compra
    try {
        const users = readFromDb<User>('users');
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex !== -1) {
            // Regla: 1 punto por cada $1000 CLP gastados en el total de la orden
            const pointsEarned = Math.floor(totalPrice / 1000);
            if (pointsEarned > 0) {
                users[userIndex].points += pointsEarned;
                writeToDb<User>('users', users);
            }
        }
    } catch (error) {
        // Si falla la asignación de puntos, la orden ya fue creada.
        // Se puede registrar el error para una revisión manual.
        console.error(`Error al asignar puntos al usuario ${userId} por la orden ${newOrder.id}:`, error);
    }

    res.status(201).json(newOrder);
};

const getMyOrders = (req: Request, res: Response) => {
    const userIdToFilter = req.query.userId; 
    const orders = readFromDb<Order>('orders');

    if (!userIdToFilter) {
        return res.json([]);
    }

    const userOrders = orders.filter(order => order.userId === userIdToFilter);
    res.json(userOrders);
};

const getAllOrders = (req: Request, res: Response) => {
    const orders = readFromDb<Order>('orders');
    res.json(orders);
};

const updateOrderStatus = (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const orders = readFromDb<Order>('orders');
    const orderIndex = orders.findIndex(o => o.id === id);

    if (orderIndex !== -1) {
        orders[orderIndex].status = status;
        writeToDb<Order>('orders', orders);
        res.json(orders[orderIndex]);
        return;
    }
    res.status(404).json({ message: 'Orden no encontrada.' });
};

export { addOrderItems, getMyOrders, getAllOrders, updateOrderStatus };