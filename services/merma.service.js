import db from '../config/db.js';
import logger from '../utils/logger.js';

/**
 * Service para gestión de mermas/pérdidas
 * Maneja el registro de productos perdidos, dañados o vencidos
 */
const mermaService = {
    /**
     * Registra una merma y ajusta el stock del producto
     * @param {Object} mermaData - Datos de la merma
     * @returns {Object} Merma registrada
     */
    registrar: async (mermaData) => {
        const { producto_id, cantidad, motivo, descripcion, usuario_id } = mermaData;
        
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // Verificar que el producto existe y tiene stock suficiente
            const [producto] = await connection.query(
                'SELECT id, nombre, stock, precio_costo FROM productos WHERE id = ? AND activo = 1',
                [producto_id]
            );
            
            if (!producto || producto.length === 0) {
                throw new Error('Producto no encontrado');
            }
            
            if (producto[0].stock < cantidad) {
                throw new Error(`Stock insuficiente. Stock actual: ${producto[0].stock}`);
            }
            
            // Calcular costo de la merma
            const costo_total = producto[0].precio_costo * cantidad;
            
            // Registrar la merma
            const [result] = await connection.query(
                `INSERT INTO mermas (producto_id, cantidad, motivo, descripcion, costo_total, usuario_id, fecha) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW())`,
                [producto_id, cantidad, motivo, descripcion || null, costo_total, usuario_id || null]
            );
            
            // Descontar del stock
            await connection.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ?',
                [cantidad, producto_id]
            );
            
            await connection.commit();
            
            logger.info('Merma registrada', {
                mermaId: result.insertId,
                productoId: producto_id,
                cantidad,
                motivo,
                costoTotal: costo_total
            });
            
            return {
                id: result.insertId,
                producto_id,
                producto_nombre: producto[0].nombre,
                cantidad,
                motivo,
                descripcion,
                costo_total,
                fecha: new Date()
            };
            
        } catch (error) {
            await connection.rollback();
            logger.error('Error al registrar merma', error, { mermaData });
            throw error;
        } finally {
            connection.release();
        }
    },
    
    /**
     * Obtiene todas las mermas
     * @returns {Array} Lista de mermas
     */
    obtenerTodas: async () => {
        const [rows] = await db.query(`
            SELECT 
                m.*,
                p.nombre as producto_nombre,
                p.codigo_barras,
                u.nombre as usuario_nombre
            FROM mermas m
            INNER JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            ORDER BY m.fecha DESC
        `);
        return rows;
    },
    
    /**
     * Obtiene mermas de hoy
     * @returns {Array} Mermas del día actual
     */
    obtenerHoy: async () => {
        const [rows] = await db.query(`
            SELECT 
                m.*,
                p.nombre as producto_nombre,
                p.codigo_barras,
                u.nombre as usuario_nombre
            FROM mermas m
            INNER JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            WHERE DATE(m.fecha) = CURDATE()
            ORDER BY m.fecha DESC
        `);
        return rows;
    },
    
    /**
     * Obtiene mermas por rango de fechas
     * @param {string} fechaInicio - Fecha inicio (YYYY-MM-DD)
     * @param {string} fechaFin - Fecha fin (YYYY-MM-DD)
     * @returns {Array} Mermas en el rango
     */
    obtenerPorRango: async (fechaInicio, fechaFin) => {
        const [rows] = await db.query(`
            SELECT 
                m.*,
                p.nombre as producto_nombre,
                p.codigo_barras,
                u.nombre as usuario_nombre
            FROM mermas m
            INNER JOIN productos p ON m.producto_id = p.id
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            WHERE DATE(m.fecha) BETWEEN ? AND ?
            ORDER BY m.fecha DESC
        `, [fechaInicio, fechaFin]);
        return rows;
    },
    
    /**
     * Obtiene estadísticas de mermas
     * @returns {Object} Estadísticas
     */
    obtenerEstadisticas: async () => {
        const [stats] = await db.query(`
            SELECT 
                COUNT(*) as total_mermas,
                SUM(cantidad) as total_unidades,
                SUM(costo_total) as costo_total,
                COUNT(DISTINCT producto_id) as productos_afectados
            FROM mermas
            WHERE MONTH(fecha) = MONTH(CURRENT_DATE())
            AND YEAR(fecha) = YEAR(CURRENT_DATE())
        `);
        
        const [porMotivo] = await db.query(`
            SELECT 
                motivo,
                COUNT(*) as cantidad,
                SUM(costo_total) as costo
            FROM mermas
            WHERE MONTH(fecha) = MONTH(CURRENT_DATE())
            AND YEAR(fecha) = YEAR(CURRENT_DATE())
            GROUP BY motivo
        `);
        
        return {
            resumen: stats[0],
            por_motivo: porMotivo
        };
    },
    
    /**
     * Obtiene productos con más mermas
     * @param {number} limit - Cantidad de productos
     * @returns {Array} Productos con más mermas
     */
    obtenerProductosConMasMermas: async (limit = 10) => {
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.nombre,
                p.codigo_barras,
                COUNT(m.id) as total_mermas,
                SUM(m.cantidad) as total_unidades,
                SUM(m.costo_total) as costo_total
            FROM productos p
            INNER JOIN mermas m ON p.id = m.producto_id
            WHERE MONTH(m.fecha) = MONTH(CURRENT_DATE())
            AND YEAR(m.fecha) = YEAR(CURRENT_DATE())
            GROUP BY p.id, p.nombre, p.codigo_barras
            ORDER BY total_unidades DESC
            LIMIT ?
        `, [limit]);
        return rows;
    }
};

export default mermaService;
