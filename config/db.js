// backend/config/db.js
import mysql from 'mysql2';
import dotenv from 'dotenv';

// Carga las variables de entorno si existen
dotenv.config();

const pool = mysql.createPool({
    // Aquí le decimos: "Usa la variable de Render, O SI NO, usa 'localhost'"
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'chugiri12', // Tu contraseña local como respaldo
    database: process.env.DB_NAME || 'tienda_pos_db',
    port: process.env.DB_PORT || 3306, // TiDB usa 4000, local usa 3306
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // CONFIGURACIÓN CLAVE PARA TIDB (SSL)
    // Solo activamos SSL si estamos usando un host que no sea localhost
    ssl: process.env.DB_HOST ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    } : undefined
});

// Verificación de conexión (opcional, solo para debug)
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Error conectando a la BD:', err.message);
    } else {
        console.log('✅ Conectado a la Base de Datos');
        connection.release();
    }
});

export default pool.promise();