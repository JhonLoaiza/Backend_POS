import express from 'express';
import productoController from '../controllers/producto.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import upload from '../middleware/upload.middleware.js'; // Importamos Multer

const router = express.Router();

router.get('/', authMiddleware, productoController.handleObtenerProductos);

router.post('/', 
    authMiddleware, 
    adminMiddleware, 
    upload.single('imagen'), // <-- AQUÍ
    productoController.handleCrearProducto
);

router.put('/:id', 
    authMiddleware, 
    adminMiddleware, 
    upload.single('imagen'), // <-- AQUÍ
    productoController.handleActualizarProducto
);

router.delete('/:id', authMiddleware, adminMiddleware, productoController.handleEliminarProducto);

export default router;