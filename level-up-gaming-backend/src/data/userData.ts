// level-up-gaming-backend/src/data/userData.ts

export interface Address {
    street: string;
    city: string;
    region: string;
    zipCode?: string; // Hacemos zipCode opcional en el modelo (ya no se usa en el Frontend)
}

export interface User {
    id: string;
    name: string;
    email: string;
    rut: string; 
    age: number; 
    role: 'admin' | 'customer' | 'seller';
    password?: string;
    token: string;
    hasDuocDiscount: boolean;
    points: number; 
    referralCode: string; 
    address: Address,
    isActive: true; 
}

// 🚨 Lista inicial de usuarios (mutable para mocking)
// level-up-gaming-backend/src/data/userData.ts

// ... (Interfaces existentes: User, ShippingAddress, etc.) ...

export const mockUsers: User[] = [
    {
        id: 'u1',
        name: 'Administrador Principal',
        email: 'admin@levelup.com',
        password: 'admin123',
        rut: '123456789',
        age: 35,
        role: 'admin',
        token: 'MOCK_ADMIN_TOKEN_123',
        hasDuocDiscount: true,
        points: 500,
        referralCode: 'ADMIN1000',
        isActive: true,
        // 🚨 DIRECCIÓN CORREGIDA: Duoc UC Sede Concepción
        address: { 
            street: 'Paicaví 3280', 
            city: 'Concepción', 
            region: 'Biobío', 
            zipCode: '4030000' 
        }, 
    },
    // ... (Otros usuarios si los tienes) ...
];