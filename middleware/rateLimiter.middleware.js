import rateLimit from 'express-rate-limit';

/**
 * Rate limiter middleware para proteger contra abuso y ataques de fuerza bruta
 * Configuración ajustada según entorno:
 * - Desarrollo: 500 requests por 15 minutos
 * - Producción: 100 requests por 15 minutos
 */
const isDevelopment = process.env.NODE_ENV !== 'production';

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos en milisegundos
  max: isDevelopment ? 500 : 100, // Más permisivo en desarrollo
  message: {
    error: 'Demasiadas peticiones desde esta IP, intente más tarde',
    retryAfter: '15 minutos'
  },
  standardHeaders: true, // Incluir headers RateLimit-* estándar
  legacyHeaders: false, // Deshabilitar headers X-RateLimit-* legacy
  // Handler cuando se excede el límite
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiadas peticiones desde esta IP',
      message: `Has excedido el límite de ${isDevelopment ? 500 : 100} peticiones por 15 minutos`,
      retryAfter: '15 minutos'
    });
  },
  // Skip para health checks y endpoints públicos específicos
  skip: (req) => {
    // No aplicar rate limiting a health check
    return req.path === '/health';
  }
});

export default rateLimiter;
