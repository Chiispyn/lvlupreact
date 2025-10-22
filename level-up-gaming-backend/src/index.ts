// level-up-gaming-backend/src/index.ts (CÓDIGO COMPLETO)

import 'dotenv/config'; 
import express, { Request, Response } from 'express';
import cors from 'cors'; 
import productRoutes from './routes/productRoutes';
import userRoutes from './routes/userRoutes';
import orderRoutes from './routes/orderRoutes'; 
import blogRoutes from './routes/blogRoutes';
import eventRoutes from './routes/eventRoutes'; 
import videoRoutes from './routes/videoRoutes';
import rewardRoutes from './routes/rewardRoutes';

const PORT = process.env.PORT || 5000; 
const app = express();

// Middleware
app.use(cors()); 
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// Rutas
app.get('/', (req: Request, res: Response) => { 
    res.send('API de Level-Up Gaming en Modo Mocking (SWC)!'); 
});

// Conexión de los módulos de la API
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes); 
app.use('/api/blog', blogRoutes);
app.use('/api/events', eventRoutes); 
app.use('/api/videos', videoRoutes); // 🚨 La última línea que puede fallar
app.use('/api/rewards', rewardRoutes); // 🚨 La última línea que puede fallar

// Manejador de Errores
app.use((err: any, req: Request, res: Response, next: any) => {
    console.error(err.stack);
    res.status(500).send({ message: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});