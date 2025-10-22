// level-up-gaming-backend/src/controllers/userController.ts

import { type Request, type Response } from 'express';
import { mockUsers, type User } from '../data/userData'; 
import { v4 as uuidv4 } from 'uuid'; 

// Función auxiliar para generar un código de referido simple
const generateReferralCode = (name: string) => {
    const namePrefix = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `${namePrefix}${randomSuffix}`;
};

// ----------------------------------------------------
// LÓGICA DE AUTENTICACIÓN
// ----------------------------------------------------

const authUser = (req: Request, res: Response) => {
    const { loginIdentifier, password } = req.body;
    const user = mockUsers.find(
        u => u.email === loginIdentifier || u.name === loginIdentifier
    );
    
    if (user && user.password === password) { 
        res.json(user);
        return;
    }
    res.status(401).json({ message: 'Credenciales inválidas o usuario no encontrado.' });
};

// ----------------------------------------------------
// LÓGICA DE REGISTRO DE CLIENTE
// ----------------------------------------------------

const registerUser = (req: Request, res: Response) => {
    const { name, email, password, rut, age, address, referredBy } = req.body;

    if (mockUsers.some(u => u.email === email)) {
        return res.status(400).json({ message: 'El correo ya está registrado.' });
    }
    
    const hasDuocDiscount = email.toLowerCase().endsWith('@duocuc.cl');
    
    let startingPoints = 100; 
    const referralCode = generateReferralCode(name); 

    if (referredBy) {
        const referringUserIndex = mockUsers.findIndex(u => u.referralCode === referredBy);
        
        if (referringUserIndex !== -1) {
            startingPoints += 50;
            mockUsers[referringUserIndex].points += 50; 
        }
    }


    if (!address || !address.street || !address.city || !address.region) {
        return res.status(400).json({ message: 'Faltan datos de dirección para el registro.' });
    }

    const newUser: User = {
        id: uuidv4(), name: name, email: email, password: password,
        rut: rut, age: parseInt(age), role: 'customer', token: `MOCK_CUSTOMER_TOKEN_${uuidv4().slice(0, 8)}`,
        hasDuocDiscount: hasDuocDiscount, points: startingPoints, referralCode: referralCode,
        address: address,
        isActive: true
    };

    mockUsers.push(newUser); 

    res.status(201).json(newUser);
};

// ----------------------------------------------------
// LÓGICA DE EDICIÓN DE PERFIL DEL CLIENTE
// ----------------------------------------------------

const updateUserProfile = (req: Request, res: Response) => {
    const { userId, name, age, address } = req.body; 
    
    const userIndex = mockUsers.findIndex(u => u.id === userId); 

    if (userIndex !== -1) {
        const user = mockUsers[userIndex];
        
        mockUsers[userIndex] = {
            ...user,
            name: name || user.name,
            age: parseInt(age) || user.age,
            address: address || user.address,
        };
        
        const updatedUser = mockUsers[userIndex];
        res.json(updatedUser);
        return;
    }

    res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
};


// ----------------------------------------------------
// LÓGICA DE ADMINISTRACIÓN: CREACIÓN Y EDICIÓN
// ----------------------------------------------------

const createUser = (req: Request, res: Response) => {
    const { name, email, password, role, rut, age, address } = req.body; 

    if (mockUsers.some(u => u.email === email)) {
        return res.status(400).json({ message: 'El correo ya está registrado.' });
    }

    const newUser: User = {
        id: uuidv4(), name: name, email: email, password: password,
        rut: rut || 'NO ASIGNADO', age: parseInt(age) || 0,
        role: role, token: `MOCK_ADMIN_CREATED_${uuidv4().slice(0, 8)}`,
        hasDuocDiscount: email.toLowerCase().endsWith('@duocuc.cl'),
        points: 0, referralCode: generateReferralCode(name),
        address: address || { street: 'N/A', city: 'N/A', region: 'N/A', zipCode: 'N/A' },
        isActive: true
    };

    mockUsers.push(newUser); 
    res.status(201).json(newUser); 
};

const updateUserByAdmin = (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, role, rut, age, address } = req.body; 
    
    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex !== -1) {
        if (id === 'u1' && role !== mockUsers[userIndex].role) {
            return res.status(403).json({ message: 'No se puede cambiar el rol del administrador principal.' });
        }
        
        mockUsers[userIndex] = {
            ...mockUsers[userIndex],
            name: name || mockUsers[userIndex].name,
            email: email || mockUsers[userIndex].email,
            role: role || mockUsers[userIndex].role,
            rut: rut || mockUsers[userIndex].rut,
            age: parseInt(age) || mockUsers[userIndex].age,
            address: address || mockUsers[userIndex].address,
        };

        const updatedUser = mockUsers[userIndex];
        res.json(updatedUser); 
        return;
    }

    res.status(404).json({ message: 'Usuario no encontrado para actualizar.' });
};

const getUsers = (req: Request, res: Response) => {
    res.json(mockUsers);
};


// ----------------------------------------------------
// FUNCIÓN DE PUNTOS: RETORNA EL OBJETO COMPLETO
// ----------------------------------------------------

const updatePoints = (req: Request, res: Response) => {
    const { id } = req.params;
    const { pointsToAdd } = req.body; 

    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex !== -1 && pointsToAdd !== 0) {
        const currentPoints = mockUsers[userIndex].points;
        const newBalance = currentPoints + pointsToAdd;

        if (newBalance < 0) {
            return res.status(400).json({ message: 'Puntos insuficientes para realizar la operación.' });
        }
        
        mockUsers[userIndex].points = newBalance; 

        const updatedUser = mockUsers[userIndex];
        res.json(updatedUser);
        return;
    }

    res.status(404).json({ message: 'Usuario no encontrado o cambio de puntos inválido.' });
};
const toggleUserStatus = (req: Request, res: Response) => {
    const { id } = req.params;
    const { isActive } = req.body; // Recibe el nuevo estado (true/false)

    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex !== -1) {
        if (id === 'u1') {
            return res.status(403).json({ message: 'No se puede desactivar al administrador principal.' });
        }
        
        mockUsers[userIndex].isActive = isActive; // 🚨 CAMBIO DE ESTADO
        
        res.json(mockUsers[userIndex]);
        return;
    }
    res.status(404).json({ message: 'Usuario no encontrado.' });
};


const deleteUser = (req: Request, res: Response) => {
    // 🚨 Redireccionamos a la lógica de desactivación
    req.body.isActive = false;
    return toggleUserStatus(req, res);
};


// 🚨 EXPORTACIÓN FINAL COMPLETA DE TODAS LAS FUNCIONES
export { authUser, registerUser, updateUserProfile, getUsers, createUser, updateUserByAdmin, updatePoints, toggleUserStatus, deleteUser };