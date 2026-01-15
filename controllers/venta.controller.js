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

    // --- OBTENER HISTORIAL (MODIFICADO) ---
    getHistorial: async (req, res) => {
        try {
            // Leemos la página de la URL (ej: /api/ventas?page=2)
            // Si no viene, asumimos página 1
            const page = req.query.page || 1;
            const limit = 10; // Puedes cambiar esto a 20 o 50 si prefieres

            const resultado = await ventaService.getVentas(page, limit);
            res.json(resultado);
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