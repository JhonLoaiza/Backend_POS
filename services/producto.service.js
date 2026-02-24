import db from '../config/db.js';

const productoService = {
    crear: async (productoData) => {
        const { codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, imagen } = productoData;

        // Validar si el código de barras ya existe
        if (codigo_barras) {
            const [existente] = await db.execute(
                'SELECT id FROM productos WHERE codigo_barras = ? AND activo = 1',
                [codigo_barras]
            );
            if (existente.length > 0) {
                throw new Error(`Ya existe un producto con el código de barras ${codigo_barras}`);
            }
        }

        const [result] = await db.execute(
            'INSERT INTO productos (codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [codigo_barras || null, nombre, precio_costo, precio_venta, stock || 0, stock_minimo || 5, imagen || null]
        );
        return productoService.obtenerPorId(result.insertId);
    },

    actualizar: async (id, productoData) => {
        const { codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, imagen } = productoData;
        
        const query = imagen 
            ? 'UPDATE productos SET codigo_barras = ?, nombre = ?, precio_costo = ?, precio_venta = ?, stock = ?, stock_minimo = ?, imagen = ? WHERE id = ?'
            : 'UPDATE productos SET codigo_barras = ?, nombre = ?, precio_costo = ?, precio_venta = ?, stock = ?, stock_minimo = ? WHERE id = ?';
        
        const params = imagen 
            ? [codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, imagen, id]
            : [codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, id];

        await db.execute(query, params);
        return productoService.obtenerPorId(id);
    },

    obtenerTodos: async () => {
        const [rows] = await db.execute('SELECT * FROM productos WHERE activo = 1');
        return rows;
    },

    obtenerPorId: async (id) => {
        const [rows] = await db.execute('SELECT * FROM productos WHERE id = ?', [id]);
        return rows[0];
    },

    eliminar: async (id) => {
        const [result] = await db.execute('UPDATE productos SET activo = 0 WHERE id = ?', [id]);
        if (result.affectedRows === 0) throw new Error('Producto no encontrado.');
        return { message: 'Producto desactivado' };
    }
};

export default productoService;