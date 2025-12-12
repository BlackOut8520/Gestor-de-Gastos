import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

// --- NUEVO: Importamos el archivo de rutas que acabas de crear ---
import transactionRoutes from './routes/transactions.js'; 
import categoryRoutes from './routes/categories.js';    
import authRoutes from './routes/auth.routes.js';




dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());

// --- NUEVO: Usamos las rutas de autenticación ---
app.use('/api/auth', authRoutes);
// --- NUEVO: Definimos el punto de entrada ---
// Le decimos: "Cualquier petición que empiece con /api/transactions, mándala al archivo transactionRoutes"
app.use('/api/transactions', transactionRoutes);

app.use('/api/categories', categoryRoutes);

app.get('/', (req, res) => {
    res.send('API funcionando');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});