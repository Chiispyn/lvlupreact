// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// 1. Definición de Tipos de Dirección y Usuario
interface Address { 
    street: string; 
    city: string; 
    region: string; 
    zipCode?: string; 
}

export interface User {
    id: string; 
    name: string; 
    email: string; 
    rut: string; 
    age: number;
    role: 'admin' | 'customer' | 'seller'; 
    token: string; 
    hasDuocDiscount: boolean;
    points: number; 
    referralCode: string; 
    address: Address; // 🚨 Incluido para la gestión de envío
}

interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (loginIdentifier: string, password: string) => Promise<boolean>;
    logout: () => void;
    // 🚨 Función para guardar el usuario tras registro o actualización de perfil (PUT)
    setUserFromRegistration: (userData: User) => void; 
}

// 2. Creación del Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Proveedor del Contexto
interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // Inicializar el estado leyendo desde localStorage
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    
    const isLoggedIn = !!user;

    // Persistir el usuario en localStorage cada vez que cambie
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Función de Login que llama a la API de tu Backend
    const login = async (loginIdentifier: string, password: string): Promise<boolean> => {
        try {
            // Usa el identificador para login (email o nombre)
            const res = await axios.post('/api/users/login', { loginIdentifier, password });
            const userData: User = res.data;
            
            setUser(userData);
            return true;
        } catch (error) {
            setUser(null);
            return false;
        }
    };

    // 🚨 FUNCIÓN PARA GUARDAR EL ESTADO DIRECTAMENTE (Usada en Registro y Edición de Perfil)
    const setUserFromRegistration = (userData: User) => {
        setUser(userData);
    };

    // Función de Logout
    const logout = () => {
        setUser(null);
    };

    const value = {
        user,
        isLoggedIn,
        login,
        logout,
        setUserFromRegistration, 
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 4. Hook Personalizado para usar el Contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};