import ventaService from '../services/venta.service.js';

const ventaController = {
    
    // --- CREAR VENTA ---
    handleCrearVenta: async (req, res) => {
        try {
            // El usuario_id viene del token (authMiddleware)
            const usuario_id = req.usuario.id; 
            const { metodo_pago, carrito } = req.body;

            if (!metodo_pago || !carrito || carrito.length === 0) {
                return res.status(400).json({ message: 'El carrito está vacío o faltan datos.' });
            }

            // Llamamos al servicio
            const nuevaVenta = await ventaService.crearVenta({ metodo_pago, usuario_id, carrito });
            
            res.status(201).json(nuevaVenta);
        } catch (error) {
            console.error("Error al crear venta:", error);
            res.status(400).json({ message: error.message });
        }
    },

    // --- OBTENER HISTORIAL ---
    getHistorial: async (req, res) => {
        try {
            // Llamamos a 'getVentas' del servicio
            const ventas = await ventaService.getVentas();
            res.json(ventas);
        } catch (error) {
            console.error("Error al obtener historial:", error);
            res.status(500).json({ message: "Error al obtener el historial" });
        }
    },

    // --- ANULAR VENTA ---
    anular: async (req, res) => {
        try {
            const { id } = req.params;
            await ventaService.anularVenta(id);
            res.json({ message: "Venta anulada correctamente" });
        } catch (error) {
            console.error("Error al anular:", error);
            res.status(500).json({ message: error.message || "Error al anular venta" });
        }
    }
};

export default ventaController;