import express from 'express';
import reporteController from '../controllers/reporte.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = express.Router();

// GET /api/reportes/diario
// Seguridad: Solo Admins
router.get('/diario',
    authMiddleware,     // 1. ¿Está logueado?
    adminMiddleware,    // 2. ¿Es admin?
    reporteController.handleGenerarReporteDiario
);
router.get('/rankings', authMiddleware, reporteController.handleObtenerRankings);
router.get('/semana', authMiddleware, reporteController.handleObtenerVentasSemana);
router.get('/cierre-caja', reporteController.getCierreCaja);

export default router;