import mermaService from '../services/merma.service.js';

const mermaController = {
    /**
     * POST /api/mermas
     * Registrar una nueva merma
     */
    registrar: async (req, res) => {
        try {
            const { producto_id, cantidad, motivo, observaciones } = req.body;
            const usuario_id = req.usuario.id;

            // Validaciones
            if (!producto_id || !cantidad || !motivo) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: producto_id, cantidad, motivo' 
                });
            }

            if (cantidad <= 0) {
                return res.status(400).json({ 
                    message: 'La cantidad debe ser mayor a 0' 
                });
            }

            const resultado = await mermaService.registrar({
                producto_id,
                cantidad,
                motivo,
                observaciones,
                usuario_id
            });

            res.status(201).json(resultado);
        } catch (error) {
            console.error('Error al registrar merma:', error);
            res.status(500).json({ 
                message: 'Error al registrar merma',
                error: error.message 
            });
        }
    },

    /**
     * GET /api/mermas
     * Obtener todas las mermas
     */
    obtenerTodas: async (req, res) => {
        try {
            const mermas = await mermaService.obtenerTodas();
            res.json(mermas);
        } catch (error) {
            console.error('Error al obtener mermas:', error);
            res.status(500).json({ 
                message: 'Error al obtener mermas',
                error: error.message 
            });
        }
    },

    /**
     * GET /api/mermas/hoy
     * Obtener mermas del día actual
     */
    obtenerHoy: async (req, res) => {
        try {
            const mermas = await mermaService.obtenerHoy();
            res.json(mermas);
        } catch (error) {
            console.error('Error al obtener mermas de hoy:', error);
            res.status(500).json({ 
                message: 'Error al obtener mermas de hoy',
                error: error.message 
            });
        }
    },

    /**
     * GET /api/mermas/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
     * Obtener mermas por rango de fechas
     */
    obtenerPorRango: async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.query;

            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({ 
                    message: 'Se requieren fechaInicio y fechaFin' 
                });
            }

            const mermas = await mermaService.obtenerPorRango(fechaInicio, fechaFin);
            res.json(mermas);
        } catch (error) {
            console.error('Error al obtener mermas por rango:', error);
            res.status(500).json({ 
                message: 'Error al obtener mermas por rango',
                error: error.message 
            });
        }
    },

    /**
     * GET /api/mermas/estadisticas
     * Obtener estadísticas de mermas
     */
    obtenerEstadisticas: async (req, res) => {
        try {
            const estadisticas = await mermaService.obtenerEstadisticas();
            res.json(estadisticas);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ 
                message: 'Error al obtener estadísticas',
                error: error.message 
            });
        }
    },

    /**
     * GET /api/mermas/productos-mas-mermas?limit=10
     * Obtener productos con más mermas
     */
    obtenerProductosConMasMermas: async (req, res) => {
        try {
            const limit = req.query.limit || 10;
            const productos = await mermaService.obtenerProductosConMasMermas(limit);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos con más mermas:', error);
            res.status(500).json({ 
                message: 'Error al obtener productos con más mermas',
                error: error.message 
            });
        }
    }
};

export default mermaController;
