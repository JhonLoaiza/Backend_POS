import express from 'express';
import db from '../config/db.js';

const router = express.Router();

/**
 * GET /health
 * Health check endpoint para monitoreo
 * Verifica que el servidor y la base de datos estén funcionando
 */
router.get('/health', async (req, res) => {
  try {
    // Verificar conexión a base de datos
    await db.query('SELECT 1');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

export default router;
