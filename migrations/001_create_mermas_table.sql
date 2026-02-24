-- Migración: Crear tabla de mermas/pérdidas
-- Fecha: 2026-02-16
-- Descripción: Tabla para registrar productos perdidos, dañados o vencidos

CREATE TABLE IF NOT EXISTS mermas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    motivo ENUM('vencido', 'dañado', 'perdido', 'robo', 'otro') NOT NULL,
    descripcion TEXT NULL,
    costo_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
    usuario_id INT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE RESTRICT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Índices para mejorar performance
    INDEX idx_mermas_producto (producto_id),
    INDEX idx_mermas_fecha (fecha),
    INDEX idx_mermas_motivo (motivo),
    INDEX idx_mermas_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comentarios de la tabla
ALTER TABLE mermas COMMENT = 'Registro de mermas y pérdidas de productos';
