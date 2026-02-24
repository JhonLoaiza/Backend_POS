import express from 'express';
import cierreCajaController from '../controllers/cierreCaja.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = express.Router();

// Obtener datos para el cierre de caja del día
// Seguridad: Solo usuarios autenticados
router.get('/datos', 
    authMiddleware, 
    cierreCajaController.handleObtenerDatos
);

// Registrar cierre de caja
// Seguridad: Solo usuarios autenticados
router.post('/', 
    authMiddleware, 
    cierreCajaController.handleRegistrarCierre
);

// Obtener historial de cierres
// Seguridad: Solo admins
router.get('/historial', 
    authMiddleware, 
    adminMiddleware,
    cierreCajaController.handleObtenerHistorial
);

// Obtener cierre específico por ID
// Seguridad: Solo admins
router.get('/:id', 
    authMiddleware, 
    adminMiddleware,
    cierreCajaController.handleObtenerPorId
);

export default router;
