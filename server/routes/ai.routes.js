import { Router } from 'express';
import Transaction from '../models/transaction.js';
import Chat from '../models/Chat.js';
import { authRequired } from '../middleware/auth.js';
import { askGemini } from '../services/aiService.js';

const router = Router();

// 1. GET: Recuperar historial para la interfaz
router.get('/history', authRequired, async (req, res) => {
    try {
        const history = await Chat.find({ user: req.user._id }).sort({ timestamp: 1 });
        res.json(history);
    } catch (error) {
        console.error("Error al cargar historial:", error);
        res.status(500).json({ message: "Error al cargar historial" });
    }
});

// 2. POST: Chat con lógica de ahorro y persistencia
router.post('/chat', authRequired, async (req, res) => {
    try {
        const { pregunta, historial } = req.body;

        // A. GUARDAR PREGUNTA (Costo 0 tokens)
        // Guardamos antes de llamar a la IA para asegurar que el rastro quede si algo falla
        await Chat.create({ 
            user: req.user._id, 
            role: 'user', 
            text: pregunta 
        });

        // B. OBTENER TRANSACCIONES
        const transactions = await Transaction.find({ 
            user: req.user._id 
        })
        .sort({ date: 1 }) 
        .limit(200);

        // C. ESTRATEGIA DE AHORRO (Poda)
        // Solo enviamos los últimos 4 mensajes (2 vueltas de chat) para no quemar la capa gratuita
        const historialReducido = (historial || []).slice(-4);

        console.log(`[IA] Procesando: ${transactions.length} txs y ${historialReducido.length} msgs de contexto.`);

        // D. LLAMADA A GEMINI
        const respuestaIA = await askGemini(pregunta, transactions, historialReducido);

        // E. GUARDAR RESPUESTA DE IA
        // Solo guardamos el campo 'texto' para la memoria del chat
        if (respuestaIA && respuestaIA.texto) {
            await Chat.create({ 
                user: req.user._id, 
                role: 'model', 
                text: respuestaIA.texto 
            });
        }

        res.json({ respuesta: respuestaIA });

    } catch (error) {
        console.error("Error crítico en AI Chat:", error);
        res.status(500).json({ message: "Error al procesar la solicitud de IA" });
    }
});

export default router;