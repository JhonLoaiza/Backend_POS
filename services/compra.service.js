import db from '../config/db.js';

const compraService = {
    /**
     * Registra una compra, calcula costos/precios y actualiza el inventario.
     * @param {object} compraData 
     */
    registrarCompra: async (compraData) => {
        const { proveedor, nro_factura, fecha, items, usuario_id } = compraData;
        
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // 1. Calcular el Total Global
            let totalFactura = 0;
            for (const item of items) {
                totalFactura += (item.costo_neto_total * 1.19);
            }

            // 2. Insertar la Cabecera
            const [compraResult] = await connection.execute(
                'INSERT INTO compras (proveedor, nro_factura, fecha, total_compra, usuario_id) VALUES (?, ?, ?, ?, ?)',
                [proveedor, nro_factura, fecha, totalFactura, usuario_id]
            );
            const compraId = compraResult.insertId;

            // 3. Procesar cada Ítem
            for (const item of items) {
                // AQUI ES DONDE CAMBIAN LOS NOMBRES (Bultos en lugar de Packs)
                const { producto_id, cantidad_bultos, unidades_por_bulto, costo_neto_total, porcentaje_ganancia } = item;

                // --- MATEMÁTICA ---
                
                // A. Calcular Total Unidades
                const totalUnidades = cantidad_bultos * unidades_por_bulto; 

                // B. Calcular Costo Total con IVA
                const costoTotalConIva = costo_neto_total * 1.19;

                // C. Calcular Costo Unitario
                const costoUnitario = costoTotalConIva / totalUnidades;

                // D. Calcular Precio Venta Sugerido
                const margen = porcentaje_ganancia / 100; 
                const precioVentaNuevo = costoUnitario * (1 + margen);

                // --- ACTUALIZACIÓN DE BASE DE DATOS ---

                // E. Guardar el detalle (¡OJO AQUÍ! Usamos los nuevos nombres de columna)
                await connection.execute(
                    'INSERT INTO compra_detalles (compra_id, producto_id, cantidad_bultos, unidades_por_bulto, costo_neto_total, porcentaje_ganancia) VALUES (?, ?, ?, ?, ?, ?)',
                    [compraId, producto_id, cantidad_bultos, unidades_por_bulto, costo_neto_total, porcentaje_ganancia]
                );

                // F. Actualizar Producto
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

    /**
     * Obtiene el historial de todas las compras (Cabeceras)
     */
    obtenerTodas: async (fechaInicio, fechaFin) => {
        // SQL con filtro WHERE BETWEEN
        const query = `
            SELECT c.*, u.nombre as usuario_nombre 
            FROM compras c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.fecha BETWEEN ? AND ?
            ORDER BY c.fecha DESC, c.id DESC
        `;
        
        // Pasamos las fechas como parámetros para evitar inyección SQL
        const [rows] = await db.execute(query, [fechaInicio, fechaFin]);
        return rows;
    },

    /**
     * Obtiene el detalle de productos de una compra específica
     */
    obtenerDetalle: async (compraId) => {
        // JOIN: Unimos detalles con productos para saber el nombre del producto
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