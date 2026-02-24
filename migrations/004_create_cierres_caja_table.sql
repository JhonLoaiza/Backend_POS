-- Tabla para registrar los cierres de caja
CREATE TABLE IF NOT EXISTS cierres_caja (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha DATE NOT NULL,
    hora_cierre DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Montos esperados (según sistema)
    efectivo_esperado DECIMAL(10,2) NOT NULL DEFAULT 0,
    tarjeta_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    transferencia_total DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_ventas DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_gastos DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Conteo físico
    efectivo_real DECIMAL(10,2) NOT NULL,
    diferencia DECIMAL(10,2) NOT NULL,
    
    -- Observaciones
    observaciones TEXT,
    
    -- Auditoría
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_fecha (fecha),
    INDEX idx_usuario (usuario_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
