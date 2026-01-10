import reporteService from '../services/reporte.service.js';

const reporteController = {
    handleGenerarReporteDiario: async (req, res) => {
        try {
            // La fecha vendrá como un "query parameter"
            // Ej: /api/reportes/diario?fecha=2025-11-02
            const { fecha } = req.query;

            if (!fecha) {
                return res.status(400).json({ message: 'Se requiere una fecha.' });
            }

            // (Validación simple de formato YYYY-MM-DD)
            const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
            if (!regexFecha.test(fecha)) {
                return res.status(400).json({ message: 'Formato de fecha inválido. Usar YYYY-MM-DD.' });
            }

            const reporte = await reporteService.generarReporteDiario(fecha);
            res.status(200).json(reporte);

        } catch (error) {
            console.error("Error al generar reporte:", error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }, 

    // ... (otros handlers)
    
    handleObtenerRankings: async (req, res) => {
        try {
            const datos = await reporteService.obtenerRankings();
            res.status(200).json(datos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    handleObtenerVentasSemana: async (req, res) => {
        try {
            const datos = await reporteService.obtenerVentasSemana();
            res.status(200).json(datos);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    getCierreCaja: async (req, res) => {
        try {
            // Si no mandan fecha, usamos hoy
            const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
            const datos = await reporteService.obtenerCierreDia(fecha);
            res.json(datos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al calcular cierre" });
        }
    },
};

export default reporteController;