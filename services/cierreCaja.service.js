import db from '../config/db.js';

const cierreCajaService = {
    /**
     * Registrar un cierre de caja
     */
    registrarCierre: async (datoCierre) => {
        const { usuario_id, efectivo_sistema, efectivo_real, total_ventas, total_gastos, observaciones } = datoCierre;
        
        // Calcular diferencia
        const diferencia = efectivo_real - efectivo_sistema;

        const query = `
            INSERT INTO cierres_caja 
            (usuario_id, efectivo_sistema, efectivo_real, diferencia, total_ventas, total_gastos, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await db.execute(query, [
            usuario_id,
            efectivo_sistema,
            efectivo_real,
            diferencia,
            total_ventas,
            total_gastos,
            observaciones || null
        ]);

        return {
            id: result.insertId,
            diferencia,
            message: 'Cierre de caja registrado exitosamente'
        };
    },

    /**
     * Obtener historial de cierres de caja
     */
    obtenerHistorial: async (limit = 50) => {
        const query = `
            SELECT 
                c.id,
                c.fecha,
                c.efectivo_sistema,
                c.efectivo_real,
                c.diferencia,
                c.total_ventas,
                c.total_gastos,
                c.observaciones,
                u.nombre as usuario
            FROM cierres_caja c
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.fecha DESC
            LIMIT ?
        `;

        const [rows] = await db.execute(query, [parseInt(limit)]);
        return rows;
    },

    /**
     * Obtener cierre por ID
     */
    obtenerPorId: async (id) => {
        const query = `
            SELECT 
                c.*,
                u.nombre as usuario
            FROM cierres_caja c
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.id = ?
        `;

        const [rows] = await db.execute(query, [id]);
        return rows[0];
    }
};

export default cierreCajaService;
