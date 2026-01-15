import reporteService from '../services/reporte.service.js';

const reporteController = {
    
    // 1. Reporte Diario (Resumen, Pagos, Ganancia)
    // Se debe llamar "getDiario" para coincidir con la ruta que te di antes
    getDiario: async (req, res) => {
        try {
            // Recibimos fecha opcional (?fecha=2023-01-01)
            const { fecha } = req.query;

            // Llamamos al servicio con el nombre CORRECTO: getReporteDiario
            const reporte = await reporteService.getReporteDiario(fecha);
            
            res.status(200).json(reporte);

        } catch (error) {
            console.error("Error al generar reporte:", error);
            res.status(500).json({ message: 'Error interno del servidor.' });
        }
    }, 

    // 2. Rankings (Más vendidos, Menos vendidos, Sin movimiento)
    getRankings: async (req, res) => {
        try {
            const datos = await reporteService.obtenerRankings();
            res.status(200).json(datos);
        } catch (error) {
            console.error("Error rankings:", error);
            res.status(500).json({ message: error.message });
        }
    },

    // 3. Gráfico Semanal
    getVentasSemana: async (req, res) => {
        try {
            const datos = await reporteService.obtenerVentasSemana();
            res.status(200).json(datos);
        } catch (error) {
            console.error("Error semana:", error);
            res.status(500).json({ message: error.message });
        }
    },

    // 4. Cierre de Caja (Modal específico)
    getCierreCaja: async (req, res) => {
        try {
            // Si no mandan fecha, el servicio ya maneja el default (hoy)
            const { fecha } = req.query;
            const datos = await reporteService.obtenerCierreDia(fecha);
            res.json(datos);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error al calcular cierre" });
        }
    },
};

export default reporteController;