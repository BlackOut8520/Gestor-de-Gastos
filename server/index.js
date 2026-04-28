import dotenv from 'dotenv';
import express from 'express';

import cors from 'cors';
import connectDB from './config/db.js';

// Importamos las rutas
import transactionRoutes from './routes/transactions.js'; 
import categoryRoutes from './routes/categories.js';    
import authRoutes from './routes/auth.routes.js';
import aiRoutes from './routes/ai.routes.js'; // Asegúrate de que el archivo se llame ai.js

dotenv.config();
connectDB();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Registro de rutas
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/ai', aiRoutes); // <--- La ruta de tu IA

app.get('/', (req, res) => {
    res.send('API funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});