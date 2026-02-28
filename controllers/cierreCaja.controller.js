import cierreCajaService from '../services/cierreCaja.service.js';

const cierreCajaController = {
    /**
     * POST /api/cierres-caja
     * Registrar un nuevo cierre de caja
     */
    registrarCierre: async (req, res) => {
        try {
            const { efectivo_sistema, efectivo_real, total_ventas, total_gastos, observaciones } = req.body;
            const usuario_id = req.usuario.id; // Del middleware de autenticación

            // Validaciones
            if (!efectivo_sistema || !efectivo_real || !total_ventas || !total_gastos) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos' 
                });
            }

            const resultado = await cierreCajaService.registrarCierre({
                usuario_id,
                efectivo_sistema,
                efectivo_real,
                total_ventas,
                total_gastos,
                observaciones
            });

            res.status(201).json(resultado);
        } catch (error) {
            console.error('Error al registrar cierre:', error);
            res.status(500).json({ 
                message: 'Error al registrar cierre de caja',
                error: error.message 
            });
        }
    },

    /**
     * GET /api/cierres-caja
     * Obtener historial de cierres
     */
    obtenerHistorial: async (req, res) => {
        try {
            const limit = req.query.limit || 50;
            const cierres = await cierreCajaService.obtenerHistorial(limit);
            res.json(cierres);
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ 
                message: 'Error al obtener historial de cierres',
                error: error.message 
            });
        }
    },

    /**
     * GET /api/cierres-caja/:id
     * Obtener un cierre específico
     */
    obtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const cierre = await cierreCajaService.obtenerPorId(id);
            
            if (!cierre) {
                return res.status(404).json({ 
                    message: 'Cierre no encontrado' 
                });
            }

            res.json(cierre);
        } catch (error) {
            console.error('Error al obtener cierre:', error);
            res.status(500).json({ 
                message: 'Error al obtener cierre',
                error: error.message 
            });
        }
    }
};

export default cierreCajaController;
