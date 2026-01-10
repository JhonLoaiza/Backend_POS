import db from '../config/db.js';

const reporteService = {
    /**
     * R-3.1: Genera el Reporte de Cierre de Caja para una fecha específica.
     * @param {string} fecha - La fecha en formato 'YYYY-MM-DD'
     */
    generarReporteDiario: async (fecha) => {
        // --- Consulta A: Desglose por Método de Pago (Números 1 y 2) ---
        // Usamos DATE() para ignorar la hora del timestamp
        const [desglosePagos] = await db.execute(
            `SELECT 
                metodo_pago, 
                SUM(total) AS total_por_metodo
             FROM ventas
             WHERE DATE(fecha) = ?
             GROUP BY metodo_pago`,
            [fecha]
        );

        // --- Consulta B: Ganancia Bruta (Número 3) ---
        // Unimos ventas y venta_detalles, filtramos por fecha
        const [ganancias] = await db.execute(
            `SELECT 
                SUM(vd.cantidad * vd.precio_unitario) AS total_vendido_bruto,
                SUM(vd.cantidad * vd.costo_unitario) AS total_costo_bruto
             FROM venta_detalles vd
             JOIN ventas v ON vd.venta_id = v.id
             WHERE DATE(v.fecha) = ?`,
            [fecha]
        );

        // --- Formatear la Respuesta ---
        const reporte = {
            fecha: fecha,
            resumen_pagos: desglosePagos,
            total_ventas: 0,
            ganancia_bruta: 0
        };

        // Calculamos el total de ventas sumando el desglose
        if (desglosePagos.length > 0) {
            reporte.total_ventas = desglosePagos.reduce((acc, pago) => acc + parseFloat(pago.total_por_metodo), 0);
        }

        // Calculamos la ganancia
        if (ganancias.length > 0 && ganancias[0].total_vendido_bruto) {
            const totalVendido = parseFloat(ganancias[0].total_vendido_bruto);
            const totalCosto = parseFloat(ganancias[0].total_costo_bruto);
            reporte.ganancia_bruta = totalVendido - totalCosto;
        }

        return reporte;
    },

    obtenerRankings: async () => {
        // 1. Más Vendidos
        const [top] = await db.execute(`
            SELECT p.nombre, SUM(vd.cantidad) as total
            FROM venta_detalles vd
            JOIN productos p ON vd.producto_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY total DESC
            LIMIT 5
        `);

        // 2. Menos Vendidos (De los que tienen al menos 1 venta)
        const [menos] = await db.execute(`
            SELECT p.nombre, SUM(vd.cantidad) as total
            FROM venta_detalles vd
            JOIN productos p ON vd.producto_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY total ASC
            LIMIT 5
        `);

        // 3. Sin Movimientos (Nunca se han vendido)
        const [sinMovimiento] = await db.execute(`
            SELECT p.nombre, p.stock
            FROM productos p
            LEFT JOIN venta_detalles vd ON p.id = vd.producto_id
            WHERE vd.id IS NULL
            LIMIT 5
        `);

        return { top, menos, sinMovimiento };
    },

   obtenerVentasSemana: async () => {
        // SQL CORREGIDO: Usamos 'total' en lugar de 'total_venta'
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
        // 1. Sumar ventas desglosadas por método de pago
        const queryVentas = `
            SELECT 
                COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' THEN total ELSE 0 END), 0) as total_efectivo,
                COALESCE(SUM(CASE WHEN metodo_pago = 'tarjeta' THEN total ELSE 0 END), 0) as total_tarjeta,
                COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' THEN total ELSE 0 END), 0) as total_transferencia,
                COALESCE(SUM(total), 0) as gran_total
            FROM ventas 
            WHERE DATE(fecha) = ?
        `;
        
        // 2. Sumar gastos del día
        const queryGastos = `
            SELECT COALESCE(SUM(monto), 0) as total_gastos 
            FROM gastos 
            WHERE DATE(fecha) = ?
        `;

        const [ventas] = await db.execute(queryVentas, [fecha]);
        const [gastos] = await db.execute(queryGastos, [fecha]);

        return {
            ventas: ventas[0],
            gastos: gastos[0].total_gastos,
            // El dinero que DEBERÍA haber en el cajón (Solo efectivo importa aquí)
            dinero_en_caja: ventas[0].total_efectivo - gastos[0].total_gastos
        };
    },
    // (Aquí podríamos agregar reportes semanales, mensuales, etc.)
};

export default reporteService;