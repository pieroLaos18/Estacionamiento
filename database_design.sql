-- Diseño de Base de Datos para Sistema de Estacionamiento Inteligente
-- Nombre de Base de Datos: parking_system

CREATE DATABASE IF NOT EXISTS parking_system;
USE parking_system;

-- 1. Tabla de Usuarios (Para acceso de Admin/Operador)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Almacenar contraseñas hasheadas (ej. bcrypt)
    role ENUM('admin', 'operator') DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Tabla de Plazas de Estacionamiento (Configuración física)
CREATE TABLE parking_spots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    spot_number INT NOT NULL UNIQUE, -- ej. 1, 2, 3
    is_occupied BOOLEAN DEFAULT FALSE,
    current_vehicle_plate VARCHAR(20) NULL, -- Referencia al vehículo actual si está ocupado
    last_status_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sensor_distance_cm FLOAT NULL -- Última lectura del sensor
);

-- 3. Tabla de Tarifas (Configuración de precios)
-- Solo debería existir una fila activa, o lógica para seleccionar la última
CREATE TABLE rates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    base_cost DECIMAL(10, 2) NOT NULL DEFAULT 5.00, -- Costo por la primera hora
    minute_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.10, -- Costo por minuto adicional
    currency VARCHAR(10) DEFAULT 'PEN',
    active_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Tabla de Sesiones de Estacionamiento (Historial de todos los eventos)
-- Esto reemplaza los arrays "activeVehicles" y "history" del frontend
CREATE TABLE parking_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(20) NOT NULL,
    spot_id INT NOT NULL,
    entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    exit_time TIMESTAMP NULL,
    total_time_minutes INT NULL,
    total_cost DECIMAL(10, 2) NULL,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    FOREIGN KEY (spot_id) REFERENCES parking_spots(id)
);

-- 5. Tabla de Cola de Entrada (Vehículos esperando plaza)
CREATE TABLE entry_queue (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate VARCHAR(20) NOT NULL,
    arrival_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('waiting', 'assigned', 'removed') DEFAULT 'waiting'
);

-- 6. Logs del Sistema (Opcional, para depuración o auditoría)
CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL, -- ej. 'BARRERA_ABIERTA', 'WIFI_CONFIG_ACTUALIZADA'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para rendimiento
CREATE INDEX idx_parking_sessions_plate ON parking_sessions(plate);
CREATE INDEX idx_parking_sessions_status ON parking_sessions(status);
CREATE INDEX idx_parking_sessions_entry ON parking_sessions(entry_time);
