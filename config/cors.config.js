/**
 * Configuración de CORS para producción
 * Permite requests solo desde el frontend configurado
 */

/**
 * Obtiene las opciones de CORS según el entorno
 * @returns {Object} Opciones de CORS para express
 */
export const getCorsOptions = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  
  return {
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }
      
      // Permitir el frontend configurado
      if (origin === frontendUrl) {
        callback(null, true);
      } else {
        // En desarrollo, permitir localhost en cualquier puerto
        if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
          callback(null, true);
        } else {
          callback(new Error(`Origen ${origin} no permitido por CORS`));
        }
      }
    },
    credentials: true, // Permitir cookies y headers de autenticación
    optionsSuccessStatus: 200, // Para navegadores legacy
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
};
