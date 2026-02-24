/**
 * Sistema de logging estructurado
 * Genera logs en formato JSON para facilitar análisis y monitoreo
 */

/**
 * Formatea un log en JSON estructurado
 * @param {string} level - Nivel del log (info, error, warn)
 * @param {string} message - Mensaje del log
 * @param {Object} metadata - Datos adicionales
 * @returns {string} Log en formato JSON
 */
const formatLog = (level, message, metadata = {}) => {
  return JSON.stringify({
    level,
    timestamp: new Date().toISOString(),
    message,
    ...metadata
  });
};

/**
 * Logger con métodos para diferentes niveles
 */
const logger = {
  /**
   * Log de información general
   * @param {string} message - Mensaje informativo
   * @param {Object} metadata - Datos adicionales
   */
  info: (message, metadata = {}) => {
    console.log(formatLog('info', message, metadata));
  },
  
  /**
   * Log de errores
   * @param {string} message - Mensaje de error
   * @param {Error} error - Objeto de error
   * @param {Object} metadata - Datos adicionales
   */
  error: (message, error, metadata = {}) => {
    const errorData = {
      error: error.message,
      stack: error.stack,
      ...metadata
    };
    console.error(formatLog('error', message, errorData));
  },
  
  /**
   * Log de advertencias
   * @param {string} message - Mensaje de advertencia
   * @param {Object} metadata - Datos adicionales
   */
  warn: (message, metadata = {}) => {
    console.warn(formatLog('warn', message, metadata));
  },
  
  /**
   * Log de debug (solo en desarrollo)
   * @param {string} message - Mensaje de debug
   * @param {Object} metadata - Datos adicionales
   */
  debug: (message, metadata = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatLog('debug', message, metadata));
    }
  }
};

export default logger;
