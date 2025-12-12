import { Router } from 'express';
import Transaction from '../models/transaction.js';
import { authRequired } from '../middleware/auth.js'; 

const router = Router();

// ---------------------------------------------------
// 1. GET SUMMARY: Calcular Balance Total (IMPORTANTE)
// ---------------------------------------------------
// server/routes/transactions.js

// server/routes/transactions.js (Versión PRO Escalable)

import mongoose from 'mongoose'; // Necesario para asegurar el tipo de ID

router.get('/summary', authRequired, async (req, res) => {
    try {
        const userId = req.user._id;
        const { date } = req.query;

        // 1. Construimos el filtro
        // IMPORTANTE: En agregaciones nativas, es mejor asegurar que el ID sea ObjectId
        const matchStage = { 
            user: new mongoose.Types.ObjectId(userId) 
        };

        if (date) {
            matchStage.date = { $lte: date };
        }

        // 2. Le pedimos a MONGO que haga la matemática
        const summary = await Transaction.aggregate([
            { $match: matchStage }, // Filtra primero (Rápido)
            {
                $group: {
                    _id: null, // Agrupa todo lo encontrado en un solo resultado
                    balance: { $sum: "$amount" },
                    totalIncome: {
                        $sum: { 
                            $cond: [{ $eq: ["$type", "ingreso"] }, "$amount", 0] 
                        }
                    },
                    totalExpense: {
                        $sum: { 
                            $cond: [{ $eq: ["$type", "gasto"] }, "$amount", 0] 
                        }
                    }
                }
            }
        ]);

        // 3. Mongo nos devuelve SOLO 3 números (súper ligero para el servidor)
        if (summary.length > 0) {
            return res.json({ 
                balance: summary[0].balance,
                income: summary[0].totalIncome,
                expense: summary[0].totalExpense
            });
        } else {
            return res.json({ balance: 0, income: 0, expense: 0 });
        }

    } catch (error) {
        console.error("Error en summary:", error);
        return res.status(500).json({ message: error.message });
    }
});

// ---------------------------------------------------
// 2. GET: Listar transacciones
// ---------------------------------------------------
router.get('/', authRequired, async (req, res) => {
    try {
        const { from, to } = req.query;
        
        let query = { user: req.user._id }; 

        if (from && to) {
            query.date = { 
                $gte: from, 
                $lte: to 
            };
        }

        const transactions = await Transaction.find(query);
        res.json(transactions);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// ---------------------------------------------------
// 3. POST: Crear transacción
// ---------------------------------------------------
router.post('/', authRequired, async (req, res) => {
    try {
        const { description, amount, category, date, type } = req.body;
        
        const newTransaction = new Transaction({
            description,
            amount,
            category,
            date,
            type,
            user: req.user._id // <--- Asignamos dueño
        });

        await newTransaction.save();
        res.json(newTransaction);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// ---------------------------------------------------
// 4. PUT: Editar transacción (NUEVO: Para que funcione el editar)
// ---------------------------------------------------
router.put('/:id', authRequired, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id }, // Filtro doble seguridad
            req.body,
            { new: true } // Para que devuelva el dato actualizado
        );

        if (!transaction) return res.status(404).json({ message: "No encontrado o sin permiso" });
        
        res.json(transaction);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// ---------------------------------------------------
// 5. DELETE: Borrar transacción
// ---------------------------------------------------
router.delete('/:id', authRequired, async (req, res) => {
    try {
        const transaction = await Transaction.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id 
        });

        if (!transaction) return res.status(404).json({ message: "Transacción no encontrada o no tienes permiso" });
        
        res.json(transaction);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;