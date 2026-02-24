import axios from 'axios';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno desde .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

/**
 * Script de validación de configuración local
 * Verifica todos los aspectos del checkpoint 3
 */

const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
const results = [];

// Utilidad para agregar resultados
const addResult = (name, passed, message = '') => {
  results.push({ name, passed, message });
  const icon = passed ? '✅' : '❌';
  const color = passed ? chalk.green : chalk.red;
  console.log(color(`${icon} ${name}`));
  if (message) console.log(chalk.gray(`   ${message}`));
};

// 1. Verificar variables de entorno
const checkEnvironmentVariables = () => {
  console.log(chalk.bold('\n📋 1. Verificando variables de entorno...\n'));
  
  const required = [
    'DB_HOST',
    'DB_USER',
    'DB_NAME',
    'JWT_SECRET',
    'PORT',
    'FRONTEND_URL'
  ];
  
  const missing = required.filter(v => !process.env[v]);
  
  if (missing.length === 0) {
    addResult('Variables de entorno', true, 'Todas las variables requeridas están configuradas');
  } else {
    addResult('Variables de entorno', false, `Faltantes: ${missing.join(', ')}`);
  }
  
  // Verificar longitud de JWT_SECRET
  if (process.env.JWT_SECRET) {
    const length = process.env.JWT_SECRET.length;
    if (length >= 64) {
      addResult('JWT_SECRET longitud', true, `${length} caracteres (≥64 requeridos)`);
    } else {
      addResult('JWT_SECRET longitud', false, `${length} caracteres (se requieren ≥64)`);
    }
  }
};

// 2. Verificar health check endpoint
const checkHealthEndpoint = async () => {
  console.log(chalk.bold('\n🏥 2. Verificando health check endpoint...\n'));
  
  try {
    const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
    
    if (response.status === 200 && response.data.status === 'healthy') {
      addResult('Health check endpoint', true, `Database: ${response.data.database}`);
    } else {
      addResult('Health check endpoint', false, `Status: ${response.data.status}`);
    }
  } catch (error) {
    addResult('Health check endpoint', false, error.message);
  }
};

// 3. Verificar rate limiting
const checkRateLimiting = async () => {
  console.log(chalk.bold('\n🚦 3. Verificando rate limiting...\n'));
  
  try {
    console.log(chalk.gray('   Enviando 101 requests para probar límite...'));
    console.log(chalk.gray('   Nota: /health está excluido del rate limiting, probando con /legal/terminos'));
    
    // Hacer 101 requests rápidas a un endpoint que SÍ tiene rate limiting
    const requests = [];
    for (let i = 0; i < 101; i++) {
      requests.push(
        axios.get(`${BASE_URL}/legal/terminos`, { 
          timeout: 5000,
          validateStatus: () => true // Aceptar cualquier status
        })
      );
    }
    
    const responses = await Promise.all(requests);
    const blocked = responses.filter(r => r.status === 429);
    
    if (blocked.length > 0) {
      addResult('Rate limiting', true, `Bloqueó ${blocked.length} requests después del límite`);
      
      // Verificar headers
      const firstBlocked = blocked[0];
      if (firstBlocked.headers['ratelimit-limit']) {
        addResult('Rate limit headers', true, 'Headers RateLimit-* presentes');
      } else {
        addResult('Rate limit headers', false, 'Headers RateLimit-* no encontrados');
      }
    } else {
      addResult('Rate limiting', false, 'No bloqueó requests excesivas');
    }
  } catch (error) {
    addResult('Rate limiting', false, error.message);
  }
};

// 4. Verificar documentos legales
const checkLegalDocuments = async () => {
  console.log(chalk.bold('\n⚖️  4. Verificando documentos legales...\n'));
  
  try {
    const [terminos, privacidad] = await Promise.all([
      axios.get(`${BASE_URL}/legal/terminos`, { timeout: 5000 }),
      axios.get(`${BASE_URL}/legal/privacidad`, { timeout: 5000 })
    ]);
    
    if (terminos.status === 200 && terminos.data.includes('Términos')) {
      addResult('Términos y condiciones', true, 'Documento accesible');
    } else {
      addResult('Términos y condiciones', false, 'Documento no válido');
    }
    
    if (privacidad.status === 200 && privacidad.data.includes('Privacidad')) {
      addResult('Política de privacidad', true, 'Documento accesible');
    } else {
      addResult('Política de privacidad', false, 'Documento no válido');
    }
  } catch (error) {
    addResult('Documentos legales', false, error.message);
  }
};

// 5. Verificar CORS configuration
const checkCorsConfiguration = () => {
  console.log(chalk.bold('\n🌐 5. Verificando configuración CORS...\n'));
  
  if (process.env.FRONTEND_URL) {
    addResult('FRONTEND_URL configurado', true, process.env.FRONTEND_URL);
  } else {
    addResult('FRONTEND_URL configurado', false, 'Variable no configurada');
  }
};

// Función principal
const runValidation = async () => {
  console.log(chalk.bold.cyan('\n╔════════════════════════════════════════════════════════════════╗'));
  console.log(chalk.bold.cyan('║  Validación de Configuración Local - Checkpoint 3             ║'));
  console.log(chalk.bold.cyan('╚════════════════════════════════════════════════════════════════╝\n'));
  
  // Verificaciones síncronas
  checkEnvironmentVariables();
  checkCorsConfiguration();
  
  // Verificaciones asíncronas (requieren servidor corriendo)
  console.log(chalk.yellow('\n⚠️  Las siguientes verificaciones requieren que el servidor esté corriendo...'));
  console.log(chalk.gray(`   Asegúrate de ejecutar: npm start en Backend_Tienda/\n`));
  
  await checkHealthEndpoint();
  await checkLegalDocuments();
  
  // Rate limiting al final porque consume muchos requests
  await checkRateLimiting();
  
  // Resumen final
  console.log(chalk.bold('\n📊 Resumen de Validación:\n'));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = Math.round((passed / total) * 100);
  
  if (passed === total) {
    console.log(chalk.bold.green(`✅ ¡Perfecto! ${passed}/${total} verificaciones pasaron (${percentage}%)`));
    console.log(chalk.green('\n🎉 La configuración local está lista para continuar.\n'));
    process.exit(0);
  } else {
    console.log(chalk.bold.yellow(`⚠️  ${passed}/${total} verificaciones pasaron (${percentage}%)`));
    console.log(chalk.yellow(`\n❌ ${total - passed} verificaciones fallaron. Revisa los errores arriba.\n`));
    process.exit(1);
  }
};

// Ejecutar validación
runValidation().catch(error => {
  console.error(chalk.red('\n❌ Error durante la validación:'), error.message);
  process.exit(1);
});
