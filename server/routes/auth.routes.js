import { Router } from 'express';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// REGISTRO
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validar si ya existe
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: "El email ya existe" });

        // Encriptar password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();

        // RESPUESTA ACTUALIZADA: Devolvemos el username explícitamente
        res.json({ 
            message: "Usuario creado", 
            id: savedUser._id,
            username: savedUser.username // <--- AGREGADO
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Usuario no encontrado" });

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) return res.status(400).json({ message: "Contraseña incorrecta" });

        // Crear Token
        const token = jwt.sign({ _id: user._id }, 'mi_secreto_super_seguro');
        
        // RESPUESTA ACTUALIZADA: Estructura plana para facilitar al Frontend
        res.header('auth-token', token).json({ 
            token, 
            id: user._id,
            username: user.username, // <--- AQUÍ ESTÁ LA CLAVE (Sin anidar en 'user')
            email: user.email
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;