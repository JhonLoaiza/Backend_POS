import mermaService from '../services/merma.service.js';

/**
 * Controller para gestión de mermas/pérdidas
 */
const mermaController = {
    /**
     * POST /api/mermas
     * Registra una nueva merma
     */
    registrar: async (req, res) => {
        try {
            const { producto_id, cantidad, motivo, descripcion } = req.body;
            
            // Validaciones
            if (!producto_id || !cantidad || !motivo) {
                return res.status(400).json({
                    error: 'Faltan campos requeridos',
                    campos_requeridos: ['producto_id', 'cantidad', 'motivo']
                });
            }
            
            if (cantidad <= 0) {
                return res.status(400).json({
                    error: 'La cantidad debe ser mayor a 0'
                });
            }
            
            const motivos_validos = ['vencido', 'dañado', 'perdido', 'robo', 'otro'];
            if (!motivos_validos.includes(motivo)) {
                return res.status(400).json({
                    error: 'Motivo inválido',
                    motivos_validos
                });
            }
            
            const mermaData = {
                producto_id,
                cantidad: parseInt(cantidad),
                motivo,
                descripcion,
                usuario_id: req.usuario?.id || null
            };
            
            const merma = await mermaService.registrar(mermaData);
            
            res.status(201).json({
                message: 'Merma registrada exitosamente',
                merma
            });
            
        } catch (error) {
            console.error('Error al registrar merma:', error);
            res.status(500).json({
                error: error.message || 'Error al registrar merma'
            });
        }
    },
    
    /**
     * GET /api/mermas
     * Obtiene todas las mermas
     */
    obtenerTodas: async (req, res) => {
        try {
            const mermas = await mermaService.obtenerTodas();
            res.json(mermas);
        } catch (error) {
            console.error('Error al obtener mermas:', error);
            res.status(500).json({
                error: 'Error al obtener mermas'
            });
        }
    },
    
    /**
     * GET /api/mermas/hoy
     * Obtiene mermas del día actual
     */
    obtenerHoy: async (req, res) => {
        try {
            const mermas = await mermaService.obtenerHoy();
            res.json(mermas);
        } catch (error) {
            console.error('Error al obtener mermas de hoy:', error);
            res.status(500).json({
                error: 'Error al obtener mermas de hoy'
            });
        }
    },
    
    /**
     * GET /api/mermas/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
     * Obtiene mermas por rango de fechas
     */
    obtenerPorRango: async (req, res) => {
        try {
            const { fechaInicio, fechaFin } = req.query;
            
            if (!fechaInicio || !fechaFin) {
                return res.status(400).json({
                    error: 'Se requieren fechaInicio y fechaFin'
                });
            }
            
            const mermas = await mermaService.obtenerPorRango(fechaInicio, fechaFin);
            res.json(mermas);
        } catch (error) {
            console.error('Error al obtener mermas por rango:', error);
            res.status(500).json({
                error: 'Error al obtener mermas por rango'
            });
        }
    },
    
    /**
     * GET /api/mermas/estadisticas
     * Obtiene estadísticas de mermas
     */
    obtenerEstadisticas: async (req, res) => {
        try {
            const estadisticas = await mermaService.obtenerEstadisticas();
            res.json(estadisticas);
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({
                error: 'Error al obtener estadísticas'
            });
        }
    },
    
    /**
     * GET /api/mermas/productos-mas-mermas
     * Obtiene productos con más mermas
     */
    obtenerProductosConMasMermas: async (req, res) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const productos = await mermaService.obtenerProductosConMasMermas(limit);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos con más mermas:', error);
            res.status(500).json({
                error: 'Error al obtener productos con más mermas'
            });
        }
    }
};

export default mermaController;
