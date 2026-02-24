import db from '../config/db.js';

const cierreCajaService = {
    // Obtener datos para el cierre de caja del día
    obtenerDatosCierre: async (fecha) => {
        const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

        // Obtener ventas del día por método de pago
        const [ventas] = await db.execute(
            `SELECT 
                COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END), 0) as efectivo,
                COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END), 0) as tarjeta,
                COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END), 0) as transferencia,
                COALESCE(SUM(total), 0) as total_ventas
             FROM ventas
             WHERE DATE(fecha) = ?`,
            [fechaConsulta]
        );

        // Obtener gastos del día
        const [gastos] = await db.execute(
            `SELECT COALESCE(SUM(monto), 0) as total_gastos FROM gastos WHERE DATE(fecha) = ?`,
            [fechaConsulta]
        );

        const efectivoEsperado = parseFloat(ventas[0].efectivo) - parseFloat(gastos[0].total_gastos);

        return {
            fecha: fechaConsulta,
            efectivo_esperado: efectivoEsperado,
            efectivo_ventas: parseFloat(ventas[0].efectivo),
            tarjeta: parseFloat(ventas[0].tarjeta),
            transferencia: parseFloat(ventas[0].transferencia),
            total_ventas: parseFloat(ventas[0].total_ventas),
            total_gastos: parseFloat(gastos[0].total_gastos)
        };
    },

    // Registrar cierre de caja
    registrarCierre: async (datos) => {
        const {
            usuario_id,
            fecha,
            efectivo_esperado,
            tarjeta_total,
            transferencia_total,
            total_ventas,
            total_gastos,
            efectivo_real,
            observaciones
        } = datos;

        const diferencia = parseFloat(efectivo_real) - parseFloat(efectivo_esperado);

        const [result] = await db.execute(
            `INSERT INTO cierres_caja 
            (usuario_id, fecha, efectivo_esperado, tarjeta_total, transferencia_total, 
             total_ventas, total_gastos, efectivo_real, diferencia, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario_id,
                fecha,
                efectivo_esperado,
                tarjeta_total,
                transferencia_total,
                total_ventas,
                total_gastos,
                efectivo_real,
                diferencia,
                observaciones || null
            ]
        );

        return {
            id: result.insertId,
            diferencia,
            mensaje: diferencia === 0 
                ? 'Cierre de caja cuadrado correctamente' 
                : diferencia > 0 
                    ? `Sobrante de ${Math.abs(diferencia)}` 
                    : `Faltante de ${Math.abs(diferencia)}`
        };
    },

    // Obtener historial de cierres
    obtenerHistorial: async (limite = 30) => {
        const [cierres] = await db.execute(
            `SELECT 
                c.*,
                u.nombre as usuario_nombre
             FROM cierres_caja c
             JOIN usuarios u ON c.usuario_id = u.id
             ORDER BY c.fecha DESC, c.hora_cierre DESC
             LIMIT ?`,
            [limite]
        );

        return cierres;
    },

    // Obtener cierre específico
    obtenerPorId: async (id) => {
        const [cierres] = await db.execute(
            `SELECT 
                c.*,
                u.nombre as usuario_nombre
             FROM cierres_caja c
             JOIN usuarios u ON c.usuario_id = u.id
             WHERE c.id = ?`,
            [id]
        );

        return cierres[0];
    }
};

export default cierreCajaService;
