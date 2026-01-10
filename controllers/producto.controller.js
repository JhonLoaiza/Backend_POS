import productoService from '../services/producto.service.js';

const productoController = {
    handleCrearProducto: async (req, res) => {
        try {
            const imagenRuta = req.file ? req.file.path : null;
            const productoData = { ...req.body, imagen: imagenRuta }; // Unimos datos + imagen
            
            const producto = await productoService.crear(productoData);
            res.status(201).json(producto);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    handleActualizarProducto: async (req, res) => {
        try {
            const imagenRuta = req.file ? req.file.path : undefined;
            const productoData = { 
                ...req.body, 
                ...(imagenRuta && { imagen: imagenRuta }) // Solo añadimos si hay imagen nueva
            };

            const producto = await productoService.actualizar(req.params.id, productoData);
            res.status(200).json(producto);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },
    
    // (El resto de funciones quedan igual: handleObtenerProductos, etc.)
    handleObtenerProductos: async (req, res) => {
        try {
            const productos = await productoService.obtenerTodos();
            res.status(200).json(productos);
        } catch (error) { res.status(500).json({ message: error.message }); }
    },
    handleEliminarProducto: async (req, res) => {
        try {
            const resultado = await productoService.eliminar(req.params.id);
            res.status(200).json(resultado);
        } catch (error) { res.status(404).json({ message: error.message }); }
    }
};

export default productoController;