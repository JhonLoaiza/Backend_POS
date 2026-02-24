-- Migración: Eliminar tenant_id de todas las tablas
-- Autor: Sistema
-- Fecha: 2026-02-21
-- Descripción: Elimina el concepto de multi-tenancy del sistema

-- Eliminar índices relacionados con tenant_id en mermas (si existen)
DROP INDEX IF EXISTS idx_mermas_tenant ON mermas;
DROP INDEX IF EXISTS idx_mermas_tenant_fecha ON mermas;

-- Eliminar foreign key constraint si existe
ALTER TABLE mermas DROP FOREIGN KEY IF EXISTS fk_mermas_tenant;

-- Eliminar columna tenant_id de mermas (si existe)
ALTER TABLE mermas DROP COLUMN IF EXISTS tenant_id;

-- Nota: Si otras tablas tienen tenant_id, agregar aquí las instrucciones correspondientes
-- Ejemplo:
-- DROP INDEX IF EXISTS idx_productos_tenant ON productos;
-- ALTER TABLE productos DROP COLUMN IF EXISTS tenant_id;
