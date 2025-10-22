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
export let mockRewards: Reward[] = [
    { id: '101', type: 'Producto', name: 'Taza Gamer Edición Limitada', pointsCost: 2800, description: 'Canjea tus puntos por una taza exclusiva de Level-Up.', isActive: true, season: 'Standard', imageUrl: '/images/taza-gamer.png' },
    { id: '102', type: 'Descuento', name: 'Cupón de $5.000 CLP', pointsCost: 6000, description: 'Descuento aplicable a tu próxima compra.', isActive: true, season: 'Standard', imageUrl: '/images/cupon.png' },
    { id: '103', type: 'Producto', name: 'Mousepad RGB Extendido', pointsCost: 18000, description: 'Mousepad amplio con iluminación RGB.', isActive: true, season: 'Standard', imageUrl: '/images/mousepad-razer-chroma.png' },
    
    // Recompensas adicionales
    { id: '104', type: 'Envio', name: 'Envío Express Gratuito', pointsCost: 3500, description: 'Cubre el costo de tu envío express (Valor: $5.000 CLP).', isActive: true, season: 'Standard', imageUrl: '/images/truck.png' },
    { id: '105', type: 'Producto', name: 'Polera Gamer Level-Up', pointsCost: 15000, description: 'Polera con diseño del logo de la tienda.', isActive: true, season: 'Standard', imageUrl: '/images/polera-gamer-personalizada.png' },
    { id: '106', type: 'Descuento', name: 'Cupón de 15% OFF', pointsCost: 35000, description: 'Descuento del 15% para una compra grande.', isActive: true, season: 'Standard', imageUrl: '/images/descuento.png' },

    // Recompensa Estacional (ejemplo)
    { id: 'H01', type: 'Descuento', name: 'Cupón 20% OFF HALLOWEEN', pointsCost: 8000, description: 'Cupón especial de temporada: 20% OFF.', isActive: true, season: 'Halloween', imageUrl: '/images/halloween.png' },
];