import db from '../config/db.js';

const ventaService = {
    /**
     * 1. CREAR VENTA (Con Transacción Robusta)
     */
    crearVenta: async (ventaData) => {
        const { metodo_pago, usuario_id, carrito } = ventaData;
        
        // Iniciamos conexión para la transacción
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // A. Verificar stock y calcular total real
            let totalVenta = 0;
            const productosParaProcesar = [];

            for (const item of carrito) {
                // Bloqueamos la fila del producto para evitar condiciones de carrera (FOR UPDATE)
                const [rows] = await connection.execute(
                    'SELECT * FROM productos WHERE id = ? FOR UPDATE',
                    [item.producto_id]
                );
                
                if (rows.length === 0) {
                    throw new Error(`Producto ID ${item.producto_id} no encontrado.`);
                }

                const producto = rows[0];

                if (producto.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
                }

                // Calculamos subtotal
                const subtotal = producto.precio_venta * item.cantidad;
                totalVenta += subtotal;
                
                productosParaProcesar.push({
                    id: producto.id,
                    cantidad: item.cantidad,
                    precio: producto.precio_venta,
                    subtotal: subtotal,
                    nuevoStock: producto.stock - item.cantidad
                });
            }

            // B. Insertar la Venta
            const [ventaResult] = await connection.execute(
                'INSERT INTO ventas (total, metodo_pago, usuario_id) VALUES (?, ?, ?)',
                [totalVenta, metodo_pago, usuario_id]
            );
            const nuevaVentaId = ventaResult.insertId;

            // C. Insertar Detalles y Actualizar Stock
            for (const prod of productosParaProcesar) {
                // Insertar en 'detalles_venta'
                await connection.execute(
                    'INSERT INTO detalles_venta (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
                    [nuevaVentaId, prod.id, prod.cantidad, prod.precio, prod.subtotal]
                );

                // Descontar stock en 'productos'
                await connection.execute(
                    'UPDATE productos SET stock = ? WHERE id = ?',
                    [prod.nuevoStock, prod.id]
                );
            }

            await connection.commit();
            return { id: nuevaVentaId, total: totalVenta, message: 'Venta registrada exitosamente' };

        } catch (error) {
            await connection.rollback();
            console.error("Error en transacción crearVenta:", error);
            throw error; 
        } finally {
            connection.release();
        }
    },

    /**
     * 2. OBTENER HISTORIAL (getVentas)
     */
    /**
     * 2. OBTENER HISTORIAL CON PAGINACIÓN
     * @param {number} page - Número de página actual (empieza en 1)
     * @param {number} limit - Cuántos items por página
     */
    getVentas: async (page = 1, limit = 10) => {
        const offset = (page - 1) * limit;

        // A. Obtener las ventas de la página actual
        const queryData = `
            SELECT 
                v.id, 
                v.fecha, 
                v.total, 
                v.metodo_pago, 
                u.nombre as vendedor,
                (SELECT COUNT(*) FROM detalles_venta WHERE venta_id = v.id) as cantidad_items 
            FROM ventas v
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.fecha DESC
            LIMIT ? OFFSET ?
        `;
        
        // B. Contar el total de ventas (para saber cuántas páginas hay)
        const queryCount = `SELECT COUNT(*) as total FROM ventas`;

        // Ejecutamos ambas consultas
        const [ventas] = await db.query(queryData, [parseInt(limit), parseInt(offset)]);
        const [totalResult] = await db.query(queryCount);

        const totalVentas = totalResult[0].total;
        const totalPages = Math.ceil(totalVentas / limit);

        return {
            data: ventas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                totalVentas,
                totalPages
            }
        };
    },

    /**
     * 3. ANULAR VENTA (Con Transacción)
     */
    anularVenta: async (ventaId) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // A. Obtener qué productos tenía esa venta para devolver stock
            const [detalles] = await connection.execute(
                'SELECT producto_id, cantidad FROM detalles_venta WHERE venta_id = ?', 
                [ventaId]
            );

            if (detalles.length === 0) {
                // Si no hay detalles, quizás la venta ya se borró o está corrupta, pero borramos la cabecera por si acaso
                await connection.execute('DELETE FROM ventas WHERE id = ?', [ventaId]);
                await connection.commit();
                return { message: "Venta eliminada (no tenía productos asociados)" };
            }

            // B. Devolver el stock a cada producto
            for (const item of detalles) {
                await connection.execute(
                    'UPDATE productos SET stock = stock + ? WHERE id = ?', 
                    [item.cantidad, item.producto_id]
                );
            }

            // C. Borrar los detalles y la venta principal
            await connection.execute('DELETE FROM detalles_venta WHERE venta_id = ?', [ventaId]);
            await connection.execute('DELETE FROM ventas WHERE id = ?', [ventaId]);

            await connection.commit();
            return { message: "Venta anulada y stock restaurado correctamente" };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
};

export default ventaService;