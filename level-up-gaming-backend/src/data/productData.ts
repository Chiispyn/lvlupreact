// level-up-gaming-backend/src/data/productData.ts

// 🚨 Interface de Comentarios (debe ser la misma que en el Frontend)
export interface Review {
    id: string;
    name: string;
    rating: number; // 1 a 5
    comment: string;
    createdAt: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number; // Precio en CLP
    imageUrl: string;
    rating: number; 
    numReviews: number;
    isTopSelling: boolean;
    countInStock: number;
    specifications: string; // Datos técnicos (JSON string)
    category: string; 
    reviews: Review[];
}

export const products: Product[] = [
    {
      id: 'JM001',
      name: "Catan",
      description: "Un clásico juego de estrategia donde los jugadores compiten por colonizar y expandirse en la isla de Catan. Perfecto para 3-4 jugadores, con una duración promedio de 60-90 minutos.",
      price: 29990, 
      imageUrl: '/images/juego-catan.png', 
      rating: 4.8,
      numReviews: 156,
      isTopSelling: true, // 🚨 TOP SELLING
      countInStock: 20,
      category: 'Juegos de Mesa',
      specifications: '{"Jugadores": "3-4", "Tiempo": "60-90 min", "Estrategia": "Alta"}',
      reviews: [
          { id: 'r1-1', name: "Carlos M.", rating: 5, comment: "Excelente juego, muy entretenido para jugar en familia.", createdAt: "2024-11-15T00:00:00Z" },
          { id: 'r1-2', name: "María P.", rating: 5, comment: "Mi juego favorito! Siempre es diferente cada partida.", createdAt: "2024-11-10T00:00:00Z" },
      ],
    },
    {
      id: 'JM002',
      name: "Carcassonne",
      description: "Un juego de colocación de fichas donde los jugadores construyen el paisaje alrededor de la fortaleza medieval. Es ideal para 2-5 jugadores.",
      price: 24990,
      imageUrl: '/images/juego-carcassonne.png',
      rating: 4.5,
      numReviews: 89,
      isTopSelling: false,
      countInStock: 15,
      category: 'Juegos de Mesa',
      specifications: '{"Jugadores": "2-5", "Tiempo": "35 min", "Tipo": "Colocación de Fichas"}',
      reviews: [],
    },
    {
      id: 'AC001',
      name: "Controlador Inalámbrico Xbox Series X",
      description: "Ofrece una experiencia de juego cómoda con botones mapeables y una respuesta táctil mejorada.",
      price: 59990,
      imageUrl: '/images/controlador-xbox.png',
      rating: 4.9,
      numReviews: 215,
      isTopSelling: true, // 🚨 TOP SELLING
      countInStock: 40,
      category: 'Accesorios',
      specifications: '{"Conectividad": "Inalámbrica/Bluetooth", "Batería": "AA/Recargable"}',
      reviews: [
          { id: 'r3-1', name: "Pedro A.", rating: 5, comment: "Es el mejor control que he tenido.", createdAt: "2024-11-25T00:00:00Z" },
      ],
    },
    {
      id: 'AC002',
      name: "Auriculares Gamer HyperX Cloud II",
      description: "Proporcionan un sonido envolvente de calidad con un micrófono desmontable y almohadillas de espuma viscoelástica.",
      price: 79990,
      imageUrl: '/images/auriculares-hyperx.png',
      rating: 4.7,
      numReviews: 190,
      isTopSelling: true, // 🚨 TOP SELLING
      countInStock: 30,
      category: 'Accesorios',
      specifications: '{"Sonido": "7.1 Surround", "Micrófono": "Desmontable"}',
      reviews: [
          { id: 'r4-1', name: "Felipe T.", rating: 5, comment: "El sonido 7.1 es increíble.", createdAt: "2024-11-24T00:00:00Z" },
      ],
    },
    {
      id: 'CO001',
      name: "PlayStation 5",
      description: "La consola de última generación de Sony, que ofrece gráficos impresionantes en 4K y tiempos de carga ultrarrápidos.",
      price: 549990,
      imageUrl: '/images/playstation-5-console.png',
      rating: 4.9,
      numReviews: 350,
      isTopSelling: true, // 🚨 TOP SELLING
      countInStock: 5,
      category: 'Consolas',
      specifications: '{"CPU": "8x Zen 2 Cores", "GPU": "10.28 TFLOPS", "SSD": "825GB Custom"}',
      reviews: [
          { id: 'r5-1', name: "Isabel B.", rating: 5, comment: "Una consola increíble. Los gráficos son de otro nivel.", createdAt: "2024-11-26T00:00:00Z" },
      ],
    },
    {
      id: 'CG001',
      name: "PC Gamer ASUS ROG Strix",
      description: "Un potente equipo diseñado para los gamers más exigentes, equipado con los últimos componentes.",
      price: 1299990,
      imageUrl: '/images/pc-gamer-asus.png',
      rating: 5.0,
      numReviews: 45,
      isTopSelling: false,
      countInStock: 3,
      category: 'Computadores',
      specifications: '{"Procesador": "Intel Core i9", "GPU": "RTX 4080", "RAM": "32GB"}',
      reviews: [
          { id: 'r6-1', name: "Daniel P.", rating: 5, comment: "Una bestia. Corre todos mis juegos en ultra.", createdAt: "2024-11-28T00:00:00Z" },
      ],
    },
    {
      id: 'SG001',
      name: "Silla Gamer Secretlab Titan",
      description: "Diseñada para el máximo confort, con un soporte ergonómico y reclinación multi-ángulo.",
      price: 349990,
      imageUrl: '/images/silla-gamer-secretlab.png',
      rating: 4.8,
      numReviews: 110,
      isTopSelling: false,
      countInStock: 12,
      category: 'Accesorios',
      specifications: '{"Soporte": "Lumbar incorporado", "Material": "Cuero sintético"}',
      reviews: [
          { id: 'r7-1', name: "José M.", rating: 5, comment: "Es increíblemente cómoda.", createdAt: "2024-11-23T00:00:00Z" },
      ],
    },
    {
      id: 'MS001',
      name: "Mouse Gamer Logitech G502 HERO",
      description: "Con sensor de alta precisión y botones personalizables, ideal para gamers que buscan control preciso.",
      price: 49990,
      imageUrl: '/images/mouse-logitech-g502.png',
      rating: 4.9,
      numReviews: 250,
      isTopSelling: false,
      countInStock: 60,
      category: 'Accesorios',
      specifications: '{"Sensor": "HERO 25K", "DPI": "25600", "Peso": "Ajustable"}',
      reviews: [
          { id: 'r8-1', name: "Gabriel N.", rating: 5, comment: "El mejor mouse para gaming.", createdAt: "2024-11-27T00:00:00Z" },
      ],
    },
];