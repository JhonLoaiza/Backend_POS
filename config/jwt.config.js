import crypto from 'crypto';

/**
 * Obtiene el JWT_SECRET desde variables de entorno con validación
 * @returns {string} JWT secret validado
 * @throws {Error} Si JWT_SECRET no está configurado o es muy corto
 */
export const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error(
      'JWT_SECRET no está configurado en variables de entorno.\n' +
      'Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  // Validar que sea al menos 256 bits (32 bytes = 64 caracteres hex)
  if (secret.length < 64) {
    throw new Error(
      `JWT_SECRET debe tener al menos 256 bits (64 caracteres).\n` +
      `Longitud actual: ${secret.length} caracteres.\n` +
      `Genera uno nuevo con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
    );
  }
  
  return secret;
};

/**
 * Genera un nuevo JWT_SECRET de 256 bits
 * Usar una vez para generar, luego copiar a .env
 * @returns {string} JWT secret de 64 caracteres hex
 */
export const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Obtiene la duración de expiración del token
 * @returns {string} Duración del token (default: 8h)
 */
export const getJWTExpiresIn = () => {
  return process.env.JWT_EXPIRES_IN || '8h';
};
