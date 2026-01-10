import ventaService from '../services/venta.service.js';

const ventaController = {
    handleCrearVenta: async (req, res) => {
        try {
            // El `usuario_id` lo sacamos del token (gracias a authMiddleware)
            const usuario_id = req.usuario.id; 
            const { metodo_pago, carrito } = req.body;

            // Validación simple
            if (!metodo_pago || !carrito || carrito.length === 0) {
                return res.status(400).json({ message: 'Datos de venta incompletos.' });
            }

            const ventaData = { metodo_pago, usuario_id, carrito };
            const nuevaVenta = await ventaService.crearVenta(ventaData);
            
            res.status(201).json(nuevaVenta);
        } catch (error) {
            // Si el servicio lanza un error (ej. "Stock insuficiente"),
            // lo atrapamos aquí.
            res.status(400).json({ message: error.message });
        }
    },

    getHistorial: async (req, res) => {
        try {
            const ventas = await ventaService.obtenerHistorial();
            res.json(ventas);
        } catch (error) {
            res.status(500).json({ message: "Error al obtener historial" });
        }
    },

    anular: async (req, res) => {
        try {
            const { id } = req.params;
            await ventaService.anularVenta(id);
            res.json({ message: "Venta anulada correctamente" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al anular venta" });
        }
    }
};

export default ventaController;