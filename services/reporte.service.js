import db from '../config/db.js';

const reporteService = {

    /**
     * R-3.1: Genera el Reporte de Cierre de Caja
     */
    getReporteDiario: async (fecha) => {
        // Si no mandan fecha, usamos hoy
        const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

        // --- Consulta A: Desglose por Método de Pago ---
        // TABLA: ventas (Esta no cambió)
        const [desglosePagos] = await db.execute(
            `SELECT 
                metodo_pago, 
                COALESCE(SUM(total), 0) AS total_por_metodo
             FROM ventas
             WHERE DATE(fecha) = ?
             GROUP BY metodo_pago`,
            [fechaConsulta]
        );

        // --- Consulta B: Ganancia Bruta (CORREGIDA) ---
        // 1. Usamos 'detalles_venta' (La tabla nueva)
        // 2. Unimos con 'productos' para obtener el 'precio_costo' real
        const [ganancias] = await db.execute(
            `SELECT 
                SUM(dv.subtotal) AS total_vendido_bruto,
                SUM(dv.cantidad * p.precio_costo) AS total_costo_bruto
             FROM detalles_venta dv
             JOIN ventas v ON dv.venta_id = v.id
             JOIN productos p ON dv.producto_id = p.id
             WHERE DATE(v.fecha) = ?`,
            [fechaConsulta]
        );

        // --- Formatear la Respuesta ---
        const reporte = {
            fecha: fechaConsulta,
            resumen_pagos: desglosePagos,
            total_ventas: 0,
            ganancia_bruta: 0,
            dinero_en_caja: 0
        };

        // Calculamos totales
        if (desglosePagos.length > 0) {
            reporte.total_ventas = desglosePagos.reduce((acc, pago) => acc + parseFloat(pago.total_por_metodo), 0);
            
            // Calculamos solo efectivo para "Dinero en caja"
            const efectivo = desglosePagos.find(p => p.metodo_pago === 'efectivo');
            if (efectivo) reporte.dinero_en_caja = parseFloat(efectivo.total_por_metodo);
        }

        // Calculamos ganancia
        if (ganancias.length > 0 && ganancias[0].total_vendido_bruto) {
            const totalVendido = parseFloat(ganancias[0].total_vendido_bruto);
            const totalCosto = parseFloat(ganancias[0].total_costo_bruto || 0);
            reporte.ganancia_bruta = totalVendido - totalCosto;
        }

        return reporte;
    },

    obtenerRankings: async () => {
        // CORREGIDO: detalles_venta
        const [top] = await db.execute(`
            SELECT p.nombre, SUM(dv.cantidad) as total
            FROM detalles_venta dv
            JOIN productos p ON dv.producto_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY total DESC
            LIMIT 5
        `);

        // CORREGIDO: detalles_venta
        const [menos] = await db.execute(`
            SELECT p.nombre, SUM(dv.cantidad) as total
            FROM detalles_venta dv
            JOIN productos p ON dv.producto_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY total ASC
            LIMIT 5
        `);

        // CORREGIDO: detalles_venta
        const [sinMovimiento] = await db.execute(`
            SELECT p.nombre, p.stock
            FROM productos p
            LEFT JOIN detalles_venta dv ON p.id = dv.producto_id
            WHERE dv.id IS NULL
            LIMIT 5
        `);

        return { top, menos, sinMovimiento };
    },

    obtenerVentasSemana: async () => {
        const query = `
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m-%d') as fecha_venta, 
                SUM(total) as total 
            FROM ventas
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY fecha_venta
            ORDER BY fecha_venta ASC
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    obtenerCierreDia: async (fecha) => {
        const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

        // 1. Ventas
        const queryVentas = `
            SELECT 
                COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END), 0) as total_efectivo,
                COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END), 0) as total_tarjeta,
                COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END), 0) as total_transferencia,
                COALESCE(SUM(total), 0) as gran_total
            FROM ventas 
            WHERE DATE(fecha) = ?
        `;
        
        // 2. Gastos (Manejo de error por si la tabla gastos no existe aún)
        let total_gastos = 0;
        try {
            // Asegúrate de haber creado la tabla gastos si quieres usar esto
            const [gastos] = await db.execute(`SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE DATE(fecha) = ?`, [fechaConsulta]);
            total_gastos = parseFloat(gastos[0].total);
        } catch (error) {
            console.warn("Tabla gastos no existe o error en consulta, asumiendo 0 gastos.");
        }

        const [ventas] = await db.execute(queryVentas, [fechaConsulta]);
        const v = ventas[0];

        return {
            ventas: v,
            gastos: total_gastos,
            dinero_en_caja: parseFloat(v.total_efectivo) - total_gastos
        };
    }
};

export default reporteService;