import db from '../config/db.js';

const mermaService = {
    /**
     * Registrar una nueva merma (con transacción para descontar stock)
     */
    registrar: async (dataMerma) => {
        const { producto_id, cantidad, motivo, observaciones, usuario_id } = dataMerma;
        
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            // Verificar que el producto existe y tiene stock suficiente
            const [productos] = await connection.execute(
                'SELECT * FROM productos WHERE id = ? FOR UPDATE',
                [producto_id]
            );

            if (productos.length === 0) {
                throw new Error('Producto no encontrado');
            }

            const producto = productos[0];

            if (producto.stock < cantidad) {
                throw new Error(`Stock insuficiente. Disponible: ${producto.stock}`);
            }

            // Registrar la merma
            const [result] = await connection.execute(
                'INSERT INTO mermas (producto_id, cantidad, motivo, observaciones, usuario_id) VALUES (?, ?, ?, ?, ?)',
                [producto_id, cantidad, motivo, observaciones || null, usuario_id]
            );

            // Descontar stock del producto
            await connection.execute(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [cantidad, producto_id]
            );

            await connection.commit();

            return {
                id: result.insertId,
                message: 'Merma registrada y stock actualizado'
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    /**
     * Obtener todas las mermas
     */
    obtenerTodas: async () => {
        const query = `
            SELECT 
                m.id,
                m.cantidad,
                m.motivo,
                m.observaciones,
                m.fecha,
                p.nombre as producto,
                p.precio_costo,
                u.nombre as usuario,
                (m.cantidad * p.precio_costo) as valor_perdido
            FROM mermas m
            LEFT JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha DESC
        `;

        const [rows] = await db.execute(query);
        return rows;
    },

    /**
     * Obtener mermas del día actual
     */
    obtenerHoy: async () => {
        const query = `
            SELECT 
                m.id,
                m.cantidad,
                m.motivo,
                m.observaciones,
                m.fecha,
                p.nombre as producto,
                p.precio_costo,
                u.nombre as usuario,
                (m.cantidad * p.precio_costo) as valor_perdido
            FROM mermas m
            LEFT JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            WHERE DATE(m.fecha) = CURDATE()
            ORDER BY m.fecha DESC
        `;

        const [rows] = await db.execute(query);
        return rows;
    },

    /**
     * Obtener mermas por rango de fechas
     */
    obtenerPorRango: async (fechaInicio, fechaFin) => {
        const query = `
            SELECT 
                m.id,
                m.cantidad,
                m.motivo,
                m.observaciones,
                m.fecha,
                p.nombre as producto,
                p.precio_costo,
                u.nombre as usuario,
                (m.cantidad * p.precio_costo) as valor_perdido
            FROM mermas m
            LEFT JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            WHERE DATE(m.fecha) BETWEEN ? AND ?
            ORDER BY m.fecha DESC
        `;

        const [rows] = await db.execute(query, [fechaInicio, fechaFin]);
        return rows;
    },

    /**
     * Obtener estadísticas de mermas
     */
    obtenerEstadisticas: async () => {
        const query = `
            SELECT 
                COUNT(*) as total_mermas,
                SUM(m.cantidad) as total_unidades,
                SUM(m.cantidad * p.precio_costo) as valor_total_perdido,
                AVG(m.cantidad * p.precio_costo) as promedio_valor_merma
            FROM mermas m
            LEFT JOIN productos p ON m.producto_id = p.id
        `;

        const [rows] = await db.execute(query);
        return rows[0];
    },

    /**
     * Obtener productos con más mermas
     */
    obtenerProductosConMasMermas: async (limit = 10) => {
        const query = `
            SELECT 
                p.id,
                p.nombre,
                COUNT(m.id) as cantidad_mermas,
                SUM(m.cantidad) as total_unidades_perdidas,
                SUM(m.cantidad * p.precio_costo) as valor_total_perdido
            FROM mermas m
            LEFT JOIN productos p ON m.producto_id = p.id
            GROUP BY p.id, p.nombre
            ORDER BY total_unidades_perdidas DESC
            LIMIT ?
        `;

        const [rows] = await db.execute(query, [parseInt(limit)]);
        return rows;
    }
};

export default mermaService;
