import db from '../config/db.js';

const gastoService = {
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