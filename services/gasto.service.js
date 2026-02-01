import db from '../config/db.js';

const gastoService = {
    crear: async (datos) => {
        const query = 'INSERT INTO gastos (monto, descripcion, fecha) VALUES (?, ?, NOW())';
        const [result] = await db.execute(query, [datos.monto, datos.descripcion]);
        return {
            id: result.insertId,
            monto: datos.monto,
            descripcion: datos.descripcion,
            fecha: new Date()
        };
    },
    registrar: async (monto, descripcion) => {
        const query = 'INSERT INTO gastos (monto, descripcion) VALUES (?, ?)';
        const [result] = await db.execute(query, [monto, descripcion]);
        return result.insertId;
    },
    obtenerHoy: async () => {
        // Trae los gastos hechos HOY
        const query = 'SELECT * FROM gastos WHERE DATE(fecha) = CURDATE() ORDER BY fecha DESC';
        const [rows] = await db.execute(query);
        return rows;
    }
};

export default gastoService;