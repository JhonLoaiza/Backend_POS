import compraService from '../services/compra.service.js';

const compraController = {
    handleRegistrarCompra: async (req, res) => {
        try {
            // El usuario lo sacamos del token (authMiddleware)
            const usuario_id = req.usuario.id;
            
            // Los datos vienen del formulario
            const { proveedor, nro_factura, fecha, items } = req.body;

            // Validaciones básicas
            if (!proveedor || !nro_factura || !items || items.length === 0) {
                return res.status(400).json({ message: 'Faltan datos de la compra' });
            }

            const resultado = await compraService.registrarCompra({
                proveedor,
                nro_factura,
                fecha,
                items,
                usuario_id
            });

            res.status(201).json(resultado);

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al registrar la compra' });
        }
    },

    // Obtener lista
    // Obtener lista con filtros
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