import express from 'express';
import usuarioController from '../controllers/usuario.controller.js';
// ¡Importamos a nuestro guardia!
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Rutas Públicas (Cualquiera puede acceder) ---
// POST /api/usuarios/registro
router.post('/', usuarioController.crear);
router.get('/', usuarioController.listar);
router.delete('/:id', usuarioController.eliminar);
router.post('/registro', usuarioController.handleRegistro);

// POST /api/usuarios/login
router.post('/login', usuarioController.handleLogin);

// --- Rutas Protegidas (Solo con token válido) ---
// GET /api/usuarios/perfil
// 1. La petición llega a esta URL.
// 2. Express primero llama al `authMiddleware` (el guardia).
// 3. Si el guardia dice `next()`, entonces llama a la siguiente función.
router.get('/perfil', authMiddleware, (req, res) => {
    // Gracias al middleware, ahora tenemos `req.usuario`
    res.json({
        message: 'Acceso permitido a ruta protegida',
        usuario: req.usuario // Esto es el payload: { id: 1, rol: 'admin' }
    });
});

export default router;