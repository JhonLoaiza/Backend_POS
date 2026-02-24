import express from 'express';
import mermaController from '../controllers/merma.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * POST /api/mermas
 * Registra una nueva merma
 */
router.post('/', mermaController.registrar);

/**
 * GET /api/mermas
 * Obtiene todas las mermas
 */
router.get('/', mermaController.obtenerTodas);

/**
 * GET /api/mermas/hoy
 * Obtiene mermas del día actual
 */
router.get('/hoy', mermaController.obtenerHoy);

/**
 * GET /api/mermas/rango
 * Obtiene mermas por rango de fechas
 */
router.get('/rango', mermaController.obtenerPorRango);

/**
 * GET /api/mermas/estadisticas
 * Obtiene estadísticas de mermas
 */
router.get('/estadisticas', mermaController.obtenerEstadisticas);

/**
 * GET /api/mermas/productos-mas-mermas
 * Obtiene productos con más mermas
 */
router.get('/productos-mas-mermas', mermaController.obtenerProductosConMasMermas);

export default router;
