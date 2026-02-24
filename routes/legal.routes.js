import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// Obtener __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /legal/terminos
 * Sirve el documento de términos y condiciones
 */
router.get('/terminos', (req, res) => {
  const filePath = path.join(__dirname, '../public/legal/terminos.html');
  res.sendFile(filePath);
});

/**
 * GET /legal/privacidad
 * Sirve el documento de política de privacidad
 */
router.get('/privacidad', (req, res) => {
  const filePath = path.join(__dirname, '../public/legal/privacidad.html');
  res.sendFile(filePath);
});

export default router;
