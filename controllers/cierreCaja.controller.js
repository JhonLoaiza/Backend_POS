import cierreCajaService from '../services/cierreCaja.service.js';

const cierreCajaController = {
    // Obtener datos para el cierre de caja
    handleObtenerDatos: async (req, res) => {
        try {
            const { fecha } = req.query;
            const datos = await cierreCajaService.obtenerDatosCierre(fecha);
            res.status(200).json(datos);
        } catch (error) {
            console.error('Error al obtener datos de cierre:', error);
            res.status(500).json({ message: 'Error al obtener datos de cierre' });
        }
    },

    // Registrar cierre de caja
    handleRegistrarCierre: async (req, res) => {
        try {
            const usuario_id = req.usuario.id;
            const datosCierre = { ...req.body, usuario_id };
            const resultado = await cierreCajaService.registrarCierre(datosCierre);
            res.status(201).json(resultado);
        } catch (error) {
            console.error('Error al registrar cierre:', error);
            res.status(500).json({ message: 'Error al registrar cierre de caja' });
        }
    },

    // Obtener historial de cierres
    handleObtenerHistorial: async (req, res) => {
        try {
            const { limite } = req.query;
            const cierres = await cierreCajaService.obtenerHistorial(limite);
            res.status(200).json(cierres);
        } catch (error) {
            console.error('Error al obtener historial:', error);
            res.status(500).json({ message: 'Error al obtener historial' });
        }
    },

    // Obtener cierre específico por ID
    handleObtenerPorId: async (req, res) => {
        try {
            const { id } = req.params;
            const cierre = await cierreCajaService.obtenerPorId(id);
            if (!cierre) {
                return res.status(404).json({ message: 'Cierre no encontrado' });
            }
            res.status(200).json(cierre);
        } catch (error) {
            console.error('Error al obtener cierre:', error);
            res.status(500).json({ message: 'Error al obtener cierre' });
        }
    }
};

export default cierreCajaController;
