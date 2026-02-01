import db from '../config/db.js';

const compraService = {
    // CREAR COMPRA SIMPLE (con repartidor)
    crearCompra: async (datos) => {
        const query = `
            INSERT INTO compras 
            (proveedor, nro_factura, nombre_repartidor, fecha, total_compra, usuario_id, creado_en) 
            VALUES (?, ?, ?, ?, ?, ?, NOW())
        `;
        const params = [
            datos.proveedor,
            datos.nro_factura,
            datos.nombre_repartidor || null,
            datos.fecha,
            datos.total_compra,
            datos.usuario_id
        ];
        const [result] = await db.execute(query, params);
        return result.insertId;
    },

    // REGISTRAR COMPRA COMPLETA (con items e inventario)
    registrarCompra: async (compraData) => {
        const { proveedor, nro_factura, fecha, items, usuario_id, nombre_repartidor } = compraData;
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            let totalFactura = 0;
            for (const item of items) {
                totalFactura += (item.costo_neto_total * 1.19);
            }

            const [compraResult] = await connection.execute(
                'INSERT INTO compras (proveedor, nro_factura, fecha, total_compra, usuario_id, nombre_repartidor) VALUES (?, ?, ?, ?, ?, ?)',
                [proveedor, nro_factura, fecha, totalFactura, usuario_id, nombre_repartidor || null]
            );
            const compraId = compraResult.insertId;

            for (const item of items) {
                const { producto_id, cantidad_bultos, unidades_por_bulto, costo_neto_total, porcentaje_ganancia } = item;
                const totalUnidades = cantidad_bultos * unidades_por_bulto;
                const costoTotalConIva = costo_neto_total * 1.19;
                const costoUnitario = costoTotalConIva / totalUnidades;
                const margen = porcentaje_ganancia / 100;
                const precioVentaNuevo = costoUnitario * (1 + margen);

                await connection.execute(
                    'INSERT INTO compra_detalles (compra_id, producto_id, cantidad_bultos, unidades_por_bulto, costo_neto_total, porcentaje_ganancia) VALUES (?, ?, ?, ?, ?, ?)',
                    [compraId, producto_id, cantidad_bultos, unidades_por_bulto, costo_neto_total, porcentaje_ganancia]
                );

                const [prodRows] = await connection.execute('SELECT stock FROM productos WHERE id = ?', [producto_id]);
                const stockActual = prodRows[0].stock;
                const nuevoStock = stockActual + totalUnidades;

                await connection.execute(
                    'UPDATE productos SET stock = ?, precio_costo = ?, precio_venta = ? WHERE id = ?',
                    [nuevoStock, costoUnitario, precioVentaNuevo, producto_id]
                );
            }

            await connection.commit();
            return { message: 'Compra registrada y precios actualizados correctamente', compraId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    // OBTENER HISTORIAL SIMPLE
    getHistorial: async () => {
        const query = `
            SELECT 
                c.id, 
                c.fecha, 
                c.proveedor, 
                c.nro_factura, 
                c.nombre_repartidor,
                c.total_compra,
                u.nombre as registrado_por
            FROM compras c
            LEFT JOIN usuarios u ON c.usuario_id = u.id
            ORDER BY c.fecha DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // OBTENER TODAS (con filtro de fechas)
    obtenerTodas: async (fechaInicio, fechaFin) => {
        const query = `
            SELECT c.*, u.nombre as usuario_nombre 
            FROM compras c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.fecha BETWEEN ? AND ?
            ORDER BY c.fecha DESC, c.id DESC
        `;
        const [rows] = await db.execute(query, [fechaInicio, fechaFin]);
        return rows;
    },

    // OBTENER DETALLE DE COMPRA
    obtenerDetalle: async (compraId) => {
        const query = `
            SELECT cd.*, p.nombre as producto_nombre, p.codigo_barras
            FROM compra_detalles cd
            JOIN productos p ON cd.producto_id = p.id
            WHERE cd.compra_id = ?
        `;
        const [rows] = await db.execute(query, [compraId]);
        return rows;
    }
};

export default compraService;