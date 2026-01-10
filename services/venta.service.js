import db from '../config/db.js';

const ventaService = {
    /**
     * R-2.1: Registra una nueva venta (¡con transacción!)
     * @param {object} ventaData - { metodo_pago, usuario_id, carrito }
     * "carrito" es un array: [ { producto_id, cantidad }, ... ]
     */
    crearVenta: async (ventaData) => {
        const { metodo_pago, usuario_id, carrito } = ventaData;
        
        // ¡Iniciamos la conexión para la transacción!
        const connection = await db.getConnection();

        try {
            // 1. Iniciar la Transacción
            await connection.beginTransaction();

            // 2. Verificar stock y calcular total
            let totalVenta = 0;
            const productosParaActualizar = [];

            for (const item of carrito) {
                // Obtenemos el producto DENTRO de la transacción
                const [rows] = await connection.execute(
                    'SELECT * FROM productos WHERE id = ? FOR UPDATE', // "FOR UPDATE" bloquea la fila
                    [item.producto_id]
                );
                
                if (rows.length === 0) {
                    throw new Error(`Producto con id ${item.producto_id} no encontrado.`);
                }

                const producto = rows[0];

                // (R-1.4) Verificación de stock
                if (producto.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${producto.nombre}.`);
                }

                totalVenta += producto.precio_venta * item.cantidad;
                
                // Guardamos los datos para los pasos 4 y 5
                productosParaActualizar.push({
                    id: producto.id,
                    nuevoStock: producto.stock - item.cantidad,
                    cantidadVendida: item.cantidad,
                    precio_unitario: producto.precio_venta,
                    costo_unitario: producto.precio_costo
                });
            }

            // 3. Insertar en la tabla `ventas` (R-2.1)
            const [ventaResult] = await connection.execute(
                'INSERT INTO ventas (total, metodo_pago, usuario_id) VALUES (?, ?, ?)',
                [totalVenta, metodo_pago, usuario_id]
            );
            const nuevaVentaId = ventaResult.insertId;

            // 4. Insertar en `venta_detalles`
            for (const prod of productosParaActualizar) {
                await connection.execute(
                    'INSERT INTO venta_detalles (venta_id, producto_id, cantidad, precio_unitario, costo_unitario) VALUES (?, ?, ?, ?, ?)',
                    [nuevaVentaId, prod.id, prod.cantidadVendida, prod.precio_unitario, prod.costo_unitario]
                );
            }

            // 5. (R-1.4) Actualizar (descontar) el stock en `productos`
            for (const prod of productosParaActualizar) {
                await connection.execute(
                    'UPDATE productos SET stock = ? WHERE id = ?',
                    [prod.nuevoStock, prod.id]
                );
            }

            // 6. ¡Todo salió bien! Confirmar la transacción
            await connection.commit();

            return { id: nuevaVentaId, total: totalVenta, message: 'Venta registrada exitosamente' };

        } catch (error) {
            // 7. ¡Algo falló! Revertir todo
            await connection.rollback();
            console.error("Error en la transacción de venta:", error);
            // Re-lanzamos el error para que el controlador lo atrape
            throw new Error(error.message || 'Error al procesar la venta');
        } finally {
            // 8. Siempre liberar la conexión
            connection.release();
        }

        
    },

    // ... (código anterior de crearVenta)

    // 1. Ver todas las ventas (para el historial)
    obtenerHistorial: async () => {
        const query = `
            SELECT v.id, v.fecha, v.total, v.metodo_pago, 
                   COUNT(vi.id) as cantidad_items 
            FROM ventas v
            LEFT JOIN ventas_items vi ON v.id = vi.venta_id
            GROUP BY v.id
            ORDER BY v.fecha DESC
            LIMIT 50
        `;
        const [rows] = await db.execute(query);
        return rows;
    },

    // 2. Anular Venta (Devolver Stock y Borrar)
    anularVenta: async (ventaId) => {
        // A. Obtener qué productos tenía esa venta
        const [items] = await db.execute('SELECT producto_id, cantidad FROM ventas_items WHERE venta_id = ?', [ventaId]);

        // B. Devolver el stock de cada producto
        for (const item of items) {
            await db.execute('UPDATE productos SET stock = stock + ? WHERE id = ?', [item.cantidad, item.producto_id]);
        }

        // C. Borrar los detalles y la venta
        await db.execute('DELETE FROM ventas_items WHERE venta_id = ?', [ventaId]);
        await db.execute('DELETE FROM ventas WHERE id = ?', [ventaId]);

        return { message: "Venta anulada y stock restaurado" };
    },
    // (Aquí irán los servicios de reportes más adelante)
};

export default ventaService;