import jwt from 'jsonwebtoken';

// Esta es la misma clave secreta que usaste en usuario.service.js
const JWT_SECRET = 'tu-clave-secreta-deberia-ser-muy-larga-y-segura';

/**
 * Este es nuestro "guardia".
 * Es una función que se ejecuta antes de cualquier controlador protegido.
 */
export const authMiddleware = (req, res, next) => {
    // 1. Buscar el token. Estará en el "encabezado" (header) de la petición.
    // El estándar es enviarlo así: "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Sacamos el token

    // 2. ¿No hay token? Bloquearlo.
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No se proveyó un token.' });
    }

    // 3. ¿Hay token? Verificarlo.
    try {
        // jwt.verify() hace todo:
        // - Revisa si la firma es válida (que no lo hayan alterado).
        // - Revisa si ha expirado.
        const payload = jwt.verify(token, JWT_SECRET);

        // 4. ¡El token es válido!
        // Adjuntamos los datos del usuario (el payload) a la petición (req)
        // para que el *siguiente* controlador pueda saber QUIÉN está haciendo la petición.
        req.usuario = payload; // Ahora req.usuario tiene { id: 1, rol: 'admin' }

        // 5. Dejarlo pasar al siguiente (al controlador).
        next();

    } catch (error) {
        // 6. ¡El token es inválido o expiró! Bloquearlo.
        res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};