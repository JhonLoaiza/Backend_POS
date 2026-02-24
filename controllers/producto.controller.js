// backend/src/controllers/producto.controller.js
import productoService from '../services/producto.service.js';

const productoController = {
    
    // --- CREAR PRODUCTO ---
    handleCrearProducto: async (req, res) => {
        try {
            console.log("Body recibido:", req.body);
            console.log("Archivo recibido:", req.file);

            // Determinar la URL de la imagen según el tipo de almacenamiento
            let imagenUrl = null;
            if (req.file) {
                // Si es Cloudinary, req.file.path es la URL completa
                // Si es local, guardamos la ruta relativa sin slash inicial
                imagenUrl = req.file.path.startsWith('http') 
                    ? req.file.path 
                    : `uploads/${req.file.filename}`;
            }

            // Parseo de datos: FormData envía todo como string
            const productoData = {
                ...req.body,
                precio_costo: parseFloat(req.body.precio_costo),
                precio_venta: parseFloat(req.body.precio_venta),
                stock: parseInt(req.body.stock),
                stock_minimo: parseInt(req.body.stock_minimo),
                imagen: imagenUrl
            };
            
            const producto = await productoService.crear(productoData);
            res.status(201).json(producto);
        } catch (error) {
            console.error(error);
            
            // Manejo específico de errores de duplicado
            if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Ya existe')) {
                return res.status(409).json({ 
                    message: error.message || 'El código de barras ya está registrado' 
                });
            }
            
            res.status(400).json({ message: error.message });
        }
    },

    // --- ACTUALIZAR PRODUCTO ---
    handleActualizarProducto: async (req, res) => {
        try {
            const { id } = req.params;
            
            // Determinar la URL de la imagen si hay una nueva
            let imagenUrl = undefined;
            if (req.file) {
                imagenUrl = req.file.path.startsWith('http') 
                    ? req.file.path 
                    : `uploads/${req.file.filename}`;
            }

            const productoData = { 
                ...req.body
            };

            // Solo agregamos la imagen al objeto si existe una nueva
            if (imagenUrl) {
                productoData.imagen = imagenUrl;
            }

            // Convertimos números si vienen en la petición
            if (req.body.precio_costo) productoData.precio_costo = parseFloat(req.body.precio_costo);
            if (req.body.precio_venta) productoData.precio_venta = parseFloat(req.body.precio_venta);
            if (req.body.stock) productoData.stock = parseInt(req.body.stock);
            if (req.body.stock_minimo) productoData.stock_minimo = parseInt(req.body.stock_minimo);

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