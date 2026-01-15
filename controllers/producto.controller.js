// backend/src/controllers/producto.controller.js
import productoService from '../services/producto.service.js';

const productoController = {
    
    // --- CREAR PRODUCTO ---
    handleCrearProducto: async (req, res) => {
        try {
            console.log("Body recibido:", req.body);
            console.log("Archivo recibido:", req.file);

            // 1. CLOUDINARY: req.file.path ya es la URL de internet (https://res.cloudinary...)
            const imagenUrl = req.file ? req.file.path : null;

            // 2. PARSEO DE DATOS:
            // Al enviar archivos (FormData), todo llega como string. 
            // Convertimos precio y stock a números para evitar errores en la BD.
            const productoData = {
                ...req.body,
                precio: parseFloat(req.body.precio),
                stock: parseInt(req.body.stock),
                imagen: imagenUrl // Guardamos la URL directa
            };
            
            const producto = await productoService.crear(productoData);
            res.status(201).json(producto);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: error.message });
        }
    },

    // --- ACTUALIZAR PRODUCTO ---
    handleActualizarProducto: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Si subieron foto nueva, req.file.path tiene la nueva URL.
            // Si no, es undefined y no tocamos la foto.
            const imagenUrl = req.file ? req.file.path : undefined;

            const productoData = { 
                ...req.body
            };

            // Solo agregamos la imagen al objeto si existe una nueva
            if (imagenUrl) {
                productoData.imagen = imagenUrl;
            }

            // Convertimos números si vienen en la petición
            if (req.body.precio) productoData.precio = parseFloat(req.body.precio);
            if (req.body.stock) productoData.stock = parseInt(req.body.stock);

            const producto = await productoService.actualizar(id, productoData);
            res.status(200).json(producto);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: error.message });
        }
    },
    
    // --- OBTENER TODOS ---
    handleObtenerProductos: async (req, res) => {
        try {
            const productos = await productoService.obtenerTodos();
            res.status(200).json(productos);
        } catch (error) { 
            res.status(500).json({ message: error.message }); 
        }
    },

    // --- ELIMINAR ---
    handleEliminarProducto: async (req, res) => {
        try {
            const resultado = await productoService.eliminar(req.params.id);
            res.status(200).json(resultado);
        } catch (error) { 
            res.status(404).json({ message: error.message }); 
        }
    }
};

export default productoController;