// level-up-gaming-backend/src/controllers/rewardController.ts

import { type Request, type Response } from 'express';
import { mockRewards, Reward } from '../data/rewardData';
import { v4 as uuidv4 } from 'uuid';

// ----------------------------------------------------
// LECTURA (GET)
// ----------------------------------------------------

// @route   GET /api/rewards (Devuelve solo las ACTIVAS para el cliente)
const getActiveRewards = (req: Request, res: Response) => {
    const activeRewards = mockRewards.filter(r => r.isActive);
    res.json(activeRewards);
};

// @route   GET /api/rewards/admin (Devuelve TODAS para el administrador)
const getAllRewards = (req: Request, res: Response) => {
    res.json(mockRewards);
};


// ----------------------------------------------------
// ADMINISTRACIÓN (CRUD)
// ----------------------------------------------------

// @route   POST /api/rewards/admin (Crear)
const createReward = (req: Request, res: Response) => {
    const { name, type, pointsCost, description, isActive, season, imageUrl } = req.body;

    // 🚨 VALIDACIÓN: Nombre, Costo e Imagen
    if (!name || name.length < 3) { return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres.' }); } 
    if (!pointsCost || pointsCost < 1) { return res.status(400).json({ message: 'El costo debe ser mayor a 0 puntos.' }); }
    if (!imageUrl) { return res.status(400).json({ message: 'Debe proporcionar una imagen para la recompensa.' }); }


    const newReward: Reward = {
        id: uuidv4(),
        name: name,
        type: type,
        pointsCost: pointsCost,
        description: description,
        isActive: isActive !== undefined ? isActive : true,
        season: season || 'Standard',
        imageUrl: imageUrl, // Guarda Base64/URL
    };

    mockRewards.push(newReward);
    res.status(201).json(newReward);
};

// @route   PUT /api/rewards/:id/admin (Actualizar)
const updateReward = (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData = req.body;
    const rewardIndex = mockRewards.findIndex(r => r.id === id);

    if (rewardIndex !== -1) {
        if (updateData.name && updateData.name.length < 3) {
             return res.status(400).json({ message: 'El nombre debe tener al menos 3 caracteres.' });
        }
        
        mockRewards[rewardIndex] = { 
            ...mockRewards[rewardIndex], 
            ...updateData,
            pointsCost: Number(updateData.pointsCost) || mockRewards[rewardIndex].pointsCost,
        };
        res.json(mockRewards[rewardIndex]);
        return;
    }
    res.status(404).json({ message: 'Recompensa no encontrada.' });
};

// @route   DELETE /api/rewards/:id/admin (Eliminar)
const deleteReward = (req: Request, res: Response) => {
    const { id } = req.params;
    const initialLength = mockRewards.length;
    
    mockRewards.splice(0, mockRewards.length, ...mockRewards.filter(r => r.id !== id)); 
    res.status(200).json({ message: 'Recompensa eliminada.' });
};

export { getActiveRewards, getAllRewards, createReward, updateReward, deleteReward };