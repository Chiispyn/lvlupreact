// level-up-gaming-backend/src/data/rewardData.ts

export interface Reward {
    id: string;
    name: string;
    type: 'Producto' | 'Descuento' | 'Envio';
    pointsCost: number;
    description: string;
    isActive: boolean; // Para activarlas/desactivarlas
    season: 'Standard' | 'Halloween' | 'Navidad'; // Para la gestión
    imageUrl: string; // Campo para Base64/URL
}

// Lista mutable de recompensas
import { readFromDb } from '../utils/dbUtils';

export const getRewards = (): Reward[] => readFromDb<Reward>('reward');