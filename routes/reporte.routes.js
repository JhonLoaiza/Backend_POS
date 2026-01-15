import express from 'express';
import reporteController from '../controllers/reporte.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';

const router = express.Router();

// 1. Reporte Diario (Resumen y Ganancias)
// Seguridad: Solo Admins
router.get('/diario', 
    authMiddleware, 
    adminMiddleware, 
    reporteController.getDiario // CORREGIDO (antes handleGenerarReporteDiario)
);

// 2. Rankings (Más/Menos vendidos)
// Seguridad: Solo logueados (Cajeros o Admins)
router.get('/rankings', 
    authMiddleware, 
    reporteController.getRankings // CORREGIDO (antes handleObtenerRankings)
);

// 3. Gráfico Semanal
router.get('/semana', 
    authMiddleware, 
    reporteController.getVentasSemana // CORREGIDO (antes handleObtenerVentasSemana)
);

// 4. Cierre de Caja (Modal)
// ¡IMPORTANTE! Le agregué authMiddleware para que no sea público
router.get('/cierre-caja', 
    authMiddleware, 
    reporteController.getCierreCaja
);

export default router;