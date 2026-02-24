import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno desde Backend_Tienda/.env
dotenv.config({ path: join(__dirname, '..', '.env') });

async function removeTenantId() {
    let connection;
    
    try {
        console.log('🔄 Conectando a la base de datos...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        
        console.log('✅ Conexión establecida');
        
        // Verificar si la columna tenant_id existe en mermas
        console.log('\n📋 Verificando columna tenant_id en tabla mermas...');
        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'mermas' AND COLUMN_NAME = 'tenant_id'
        `, [process.env.DB_NAME]);
        
        if (columns.length === 0) {
            console.log('ℹ️  La columna tenant_id no existe en la tabla mermas');
            await connection.end();
            return;
        }
        
        console.log('🗑️  Eliminando índices relacionados con tenant_id...');
        
        // Eliminar índice idx_mermas_tenant si existe
        try {
            await connection.query('DROP INDEX idx_mermas_tenant ON mermas');
            console.log('✅ Índice idx_mermas_tenant eliminado');
        } catch (error) {
            if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('ℹ️  Índice idx_mermas_tenant no existe');
            } else {
                throw error;
            }
        }
        
        // Eliminar índice idx_mermas_tenant_fecha si existe
        try {
            await connection.query('DROP INDEX idx_mermas_tenant_fecha ON mermas');
            console.log('✅ Índice idx_mermas_tenant_fecha eliminado');
        } catch (error) {
            if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('ℹ️  Índice idx_mermas_tenant_fecha no existe');
            } else {
                throw error;
            }
        }
        
        // Eliminar foreign key si existe
        console.log('\n🔗 Eliminando foreign key constraint...');
        try {
            await connection.query('ALTER TABLE mermas DROP FOREIGN KEY fk_mermas_tenant');
            console.log('✅ Foreign key fk_mermas_tenant eliminado');
        } catch (error) {
            if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
                console.log('ℹ️  Foreign key fk_mermas_tenant no existe');
            } else {
                throw error;
            }
        }
        
        // Eliminar columna tenant_id
        console.log('\n🗑️  Eliminando columna tenant_id...');
        await connection.query('ALTER TABLE mermas DROP COLUMN tenant_id');
        console.log('✅ Columna tenant_id eliminada de tabla mermas');
        
        console.log('\n✅ Migración completada exitosamente');
        console.log('📝 El sistema ahora es single-tenant (sin multi-tenancy)');
        
    } catch (error) {
        console.error('\n❌ Error durante la migración:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar migración
removeTenantId();
