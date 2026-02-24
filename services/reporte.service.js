import db from '../config/db.js';

const reporteService = {

    /**
     * R-3.1: Genera el Reporte de Cierre de Caja Completo
     */
    getReporteDiario: async (fecha) => {
        const fechaConsulta = fecha || new Date().toISOString().split('T')[0];

        // --- Consulta A: Desglose por Método de Pago ---
        const [desglosePagos] = await db.execute(
            `SELECT 
                metodo_pago, 
                COALESCE(SUM(total), 0) AS total_por_metodo
             FROM ventas
             WHERE DATE(fecha) = ?
             GROUP BY metodo_pago`,
            [fechaConsulta]
        );

        // --- Consulta B: Ganancia Bruta ---
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

        // --- Consulta C: Gastos del día ---
        let total_gastos = 0;
        try {
            const [gastos] = await db.execute(
                `SELECT COALESCE(SUM(monto), 0) as total FROM gastos WHERE DATE(fecha) = ?`,
                [fechaConsulta]
            );
            total_gastos = parseFloat(gastos[0].total);
        } catch (error) {
            console.warn("Error al consultar gastos:", error.message);
        }

        // --- Consulta D: Compras del día ---
        let total_compras = 0;
        try {
            const [compras] = await db.execute(
                `SELECT COALESCE(SUM(total_compra), 0) as total FROM compras WHERE DATE(fecha) = ?`,
                [fechaConsulta]
            );
            total_compras = parseFloat(compras[0].total);
        } catch (error) {
            console.warn("Error al consultar compras:", error.message);
        }

        // --- Consulta E: Mermas del día ---
        let total_mermas = 0;
        let cantidad_mermas = 0;
        try {
            const [mermas] = await db.execute(
                `SELECT 
                    COALESCE(SUM(m.cantidad * p.precio_costo), 0) as total_valor,
                    COALESCE(SUM(m.cantidad), 0) as total_cantidad
                 FROM mermas m
                 JOIN productos p ON m.producto_id = p.id
                 WHERE DATE(m.fecha) = ?`,
                [fechaConsulta]
            );
            total_mermas = parseFloat(mermas[0].total_valor);
            cantidad_mermas = parseInt(mermas[0].total_cantidad);
        } catch (error) {
            console.warn("Error al consultar mermas:", error.message);
        }

        // --- Formatear la Respuesta ---
        const reporte = {
            fecha: fechaConsulta,
            resumen_pagos: desglosePagos,
            total_ventas: 0,
            ganancia_bruta: 0,
            dinero_en_caja: 0,
            gastos: total_gastos,
            compras: total_compras,
            mermas: {
                valor: total_mermas,
                cantidad: cantidad_mermas
            },
            flujo_caja_neto: 0
        };

        // Calculamos totales de ventas
        if (desglosePagos.length > 0) {
            reporte.total_ventas = desglosePagos.reduce((acc, pago) => acc + parseFloat(pago.total_por_metodo), 0);
            
            // Dinero en caja (solo efectivo)
            const efectivo = desglosePagos.find(p => p.metodo_pago === 'efectivo');
            if (efectivo) reporte.dinero_en_caja = parseFloat(efectivo.total_por_metodo);
        }

        // Calculamos ganancia bruta
        if (ganancias.length > 0 && ganancias[0].total_vendido_bruto) {
            const totalVendido = parseFloat(ganancias[0].total_vendido_bruto);
            const totalCosto = parseFloat(ganancias[0].total_costo_bruto || 0);
            reporte.ganancia_bruta = totalVendido - totalCosto;
        }

        // Flujo de caja neto = Ventas - (Compras + Gastos + Mermas)
        reporte.flujo_caja_neto = reporte.total_ventas - (total_compras + total_gastos + total_mermas);

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