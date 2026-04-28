import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';

// Importamos las rutas
import transactionRoutes from './routes/transactions.js'; 
import categoryRoutes from './routes/categories.js';    
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js'; 

dotenv.config();
connectDB();

const app = express();

// --- CONFIGURACIÓN MEJORADA DE CORS ---
const corsOptions = {
    origin: [
        'http://localhost:5173', // Para desarrollo local
        'https://tu-proyecto.vercel.app' // ¡CAMBIA ESTO por tu URL de Vercel (sin la / al final)!
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'auth-token'],
    credentials: true // Permite el envío de headers de autenticación
};

// Middlewares
app.use(express.json());
app.use(cors(corsOptions)); // Aplicamos la mejora aquí

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes); 

app.get('/', (req, res) => {
    res.send('API funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});