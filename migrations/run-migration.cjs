// Script para ejecutar migraciones SQL
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('Conectado a la base de datos...');
        
        const sqlFile = path.join(__dirname, '001_create_mermas_table.sql');
        const sql = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('Ejecutando migración 001_create_mermas_table.sql...');
        await connection.query(sql);
        
        console.log('✅ Migración ejecutada exitosamente');
    } catch (error) {
        console.error('❌ Error al ejecutar migración:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigration();
