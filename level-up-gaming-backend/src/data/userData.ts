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
export let mockUsers: User[] = [
    {
        id: 'u1',
        name: 'Administrador Principal',
        email: 'admin@levelup.com',
        rut: '1-9', age: 30, password: 'admin123', role: 'admin', hasDuocDiscount: false, points: 100000, referralCode: 'ADMIN1000',
        address: {
            street: 'Av. Siempre Viva 742',
            city: 'Springfield',
            region: 'Metropolitana',
            zipCode: '1234567', // Se mantiene aquí, pero el Frontend ya no lo envía
        },
        token: "MOCK_ADMIN_TOKEN_12345",
        isActive: true
    },
];