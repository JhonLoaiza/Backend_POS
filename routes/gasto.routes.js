import express from 'express';
import gastoController from '../controllers/gasto.controller.js';

const router = express.Router();

router.post('/', gastoController.crear);
router.get('/hoy', gastoController.listarHoy);

export default router;