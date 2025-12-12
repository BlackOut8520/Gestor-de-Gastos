import { Router } from 'express';
import Category from '../models/Category.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

// ---------------------------------------------------
// GET: Obtener Categorías (Globales + Personales)
// ---------------------------------------------------
router.get('/', authRequired, async (req, res) => {
    try {
        // Buscamos categorías donde:
        // 1. El usuario sea NULL (Globales por defecto)
        // 2. O el usuario sea EL MÍO (Privadas)
        const categories = await Category.find({
            $or: [
                { user: null },              // Globales
                { user: req.user._id }       // Mías
            ]
        }).sort({ type: 1, name: 1 }); // Ordenadas para que se vean bonitas

        res.json(categories);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

// ---------------------------------------------------
// POST: Crear Categoría Personalizada
// ---------------------------------------------------
router.post('/', authRequired, async (req, res) => {
    try {
        const { name, type, color } = req.body;

        // Verificar si ya existe PARA ESTE USUARIO o si es GLOBAL
        const existingCategory = await Category.findOne({
            name,
            type,
            $or: [
                { user: null },
                { user: req.user._id }
            ]
        });

        if (existingCategory) {
            return res.status(400).json({ message: "La categoría ya existe en tu lista" });
        }

        const newCategory = new Category({
            name,
            type,
            color,
            user: req.user._id // <--- ¡AQUÍ LA HACEMOS PRIVADA!
        });

        await newCategory.save();
        res.json(newCategory);

    } catch (error) {
        // Manejo de error de duplicado (por si el índice falla)
        if (error.code === 11000) {
            return res.status(400).json({ message: "La categoría ya existe" });
        }
        return res.status(500).json({ message: error.message });
    }
});

// ---------------------------------------------------
// DELETE: Borrar Categoría (Solo si es mía)
// ---------------------------------------------------
router.delete('/:id', authRequired, async (req, res) => {
    try {
        // Solo permitimos borrar si el usuario coincide.
        // Así nadie puede borrar las categorías Globales por error.
        const category = await Category.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id 
        });

        if (!category) {
            return res.status(404).json({ message: "No se encontró la categoría o es una categoría global protegida" });
        }

        res.json(category);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

export default router;