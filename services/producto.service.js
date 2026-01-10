import db from '../config/db.js';

const productoService = {
    crear: async (productoData) => {
        const { codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, imagen } = productoData;

        const [result] = await db.execute(
            'INSERT INTO productos (codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, imagen) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [codigo_barras || null, nombre, precio_costo, precio_venta, stock || 0, stock_minimo || 5, imagen || null]
        );
        return productoService.obtenerPorId(result.insertId);
    },

    actualizar: async (id, productoData) => {
        const { codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo, imagen } = productoData;
        
        // Construimos la query dinámicamente para manejar si viene imagen o no
        let query = 'UPDATE productos SET codigo_barras = ?, nombre = ?, precio_costo = ?, precio_venta = ?, stock = ?, stock_minimo = ?';
        let params = [codigo_barras, nombre, precio_costo, precio_venta, stock, stock_minimo];

        if (imagen) {
            query += ', imagen = ?';
            params.push(imagen);
        }

        query += ' WHERE id = ?';
        params.push(id);

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