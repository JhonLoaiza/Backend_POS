// backend/middleware/admin.middleware.js

/**
 * Este middleware se ejecuta DESPUÉS de authMiddleware.
 * Revisa si el usuario que ya fue autenticado tiene el rol de 'admin'.
 */
export const adminMiddleware = (req, res, next) => {
    // Damos por hecho que authMiddleware ya se ejecutó,
    // por lo tanto, deberíamos tener req.usuario
    if (req.usuario && req.usuario.rol === 'admin') {
        // ¡Es admin! Déjalo pasar.
        next();
    } else {
        // No es admin. Bloquearlo.
        res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
    }
};