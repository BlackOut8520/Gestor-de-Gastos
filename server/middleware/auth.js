import jwt from 'jsonwebtoken';

export const authRequired = (req, res, next) => {
    // El token suele venir en una cookie o en el header
    // Para simplificar, asumiremos que el frontend lo manda en un header
    const token = req.header('auth-token'); 

    if (!token) return res.status(401).json({ message: "Acceso denegado. No hay token." });

    try {
        // 'SECRET_KEY' debería estar en tu .env, por ahora usamos un string fijo de prueba
        const verified = jwt.verify(token, 'mi_secreto_super_seguro');
        req.user = verified; // Guardamos los datos del usuario en la petición
        next(); // Continúa a la siguiente función (la ruta)
    } catch (error) {
        res.status(400).json({ message: "Token inválido" });
    }
};