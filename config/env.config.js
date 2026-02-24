/**
 * Configuración y validación de variables de entorno
 * Este módulo asegura que todas las variables requeridas estén configuradas
 * antes de iniciar el servidor
 */

// Lista de variables de entorno requeridas
const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_NAME',
  'JWT_SECRET',
  'PORT'
];

// Variables que pueden estar vacías en desarrollo
const allowEmptyInDev = ['DB_PASSWORD'];

// Variables opcionales con valores por defecto
const optionalEnvVars = {
  'JWT_EXPIRES_IN': '8h',
  'NODE_ENV': 'development',
  'FRONTEND_URL': 'http://localhost:3000'
};

/**
 * Valida que todas las variables de entorno requeridas estén configuradas
 * @throws {Error} Si alguna variable requerida falta
 */
export const validateEnv = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  // Verificar variables que pueden estar vacías en desarrollo
  const isDev = process.env.NODE_ENV !== 'production';
  allowEmptyInDev.forEach(varName => {
    if (process.env[varName] === undefined && !isDev) {
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    const errorMessage = `
╔════════════════════════════════════════════════════════════════╗
║  ERROR: Variables de entorno faltantes                         ║
╚════════════════════════════════════════════════════════════════╝

Las siguientes variables de entorno son requeridas pero no están configuradas:

${missing.map(v => `  ❌ ${v}`).join('\n')}

📝 Cómo solucionar:

1. Si estás en desarrollo local:
   - Copia .env.example a .env
   - Completa los valores faltantes

2. Si estás en Railway:
   - Ve a tu proyecto en Railway
   - Selecciona el servicio del backend
   - Ve a la pestaña "Variables"
   - Agrega las variables faltantes

3. Para generar JWT_SECRET:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

📚 Documentación: Backend_Tienda/docs/JWT_SECRET_SETUP.md
`;
    
    throw new Error(errorMessage);
  }
  
  // Configurar valores por defecto para variables opcionales
  Object.entries(optionalEnvVars).forEach(([key, defaultValue]) => {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`ℹ️  ${key} no configurado, usando valor por defecto: ${defaultValue}`);
    }
  });
  
  console.log('✅ Todas las variables de entorno están configuradas correctamente');
};

/**
 * Obtiene el valor de una variable de entorno
 * @param {string} key - Nombre de la variable
 * @param {string} defaultValue - Valor por defecto si no está configurada
 * @returns {string} Valor de la variable
 */
export const getEnv = (key, defaultValue = '') => {
  return process.env[key] || defaultValue;
};

/**
 * Verifica si estamos en producción
 * @returns {boolean}
 */
export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

/**
 * Verifica si estamos en desarrollo
 * @returns {boolean}
 */
export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development';
};
