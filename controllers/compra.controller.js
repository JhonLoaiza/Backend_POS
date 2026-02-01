import compraService from '../services/compra.service.js';

const compraController = {
    // CREAR COMPRA SIMPLE
    crear: async (req, res) => {
        try {
            const { proveedor, nro_factura, fecha, total, nombre_repartidor } = req.body;
            
            const idCompra = await compraService.crearCompra({
                proveedor,
                nro_factura,
                fecha,
                total_compra: total,
                nombre_repartidor,
                usuario_id: req.usuario.id
            });

            res.status(201).json({ message: "Compra registrada", id: idCompra });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al registrar compra" });
        }
    },

    // REGISTRAR COMPRA COMPLETA (con items)
    handleRegistrarCompra: async (req, res) => {
        try {
            // --- AGREGA ESTO ---
        console.log("-----------------------------------");
        console.log("INTENTO DE REGISTRO DE COMPRA");
        console.log("REPARTIDOR RECIBIDO:", req.body.nombre_repartidor); 
        console.log("BODY COMPLETO:", req.body);
        console.log("-----------------------------------");
        // -------------------
            const usuario_id = req.usuario.id;
            const { proveedor, nro_factura, fecha, items, nombre_repartidor } = req.body;

            if (!proveedor || !nro_factura || !items || items.length === 0) {
                return res.status(400).json({ message: 'Faltan datos de la compra' });
            }

            const resultado = await compraService.registrarCompra({
                proveedor,
                nro_factura,
                fecha,
                items,
                usuario_id,
                nombre_repartidor
            });

            res.status(201).json(resultado);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar la compra' });
        }
    },

    // OBTENER HISTORIAL SIMPLE
    getHistorial: async (req, res) => {
        try {
            const compras = await compraService.getHistorial();
            res.status(200).json(compras);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    // OBTENER COMPRAS CON FILTROS
    handleObtenerCompras: async (req, res) => {
        try {
            // Recibimos ?desde=2025-01-01&hasta=2025-01-31
            const { desde, hasta } = req.query;

            // Si no envían fechas, definimos un default (últimos 30 días)
            // Esto es solo un fallback de seguridad
            const hoy = new Date();
            const hace30dias = new Date();
            hace30dias.setDate(hoy.getDate() - 30);

            const fechaFin = hasta || hoy.toISOString().split('T')[0];
            const fechaInicio = desde || hace30dias.toISOString().split('T')[0];

            const compras = await compraService.obtenerTodas(fechaInicio, fechaFin);
            res.status(200).json(compras);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
    // Obtener detalle por ID
    handleObtenerDetalleCompra: async (req, res) => {
        try {
            const detalles = await compraService.obtenerDetalle(req.params.id);
            res.status(200).json(detalles);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};

export default compraController;