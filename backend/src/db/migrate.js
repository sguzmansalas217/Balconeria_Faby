/**
 * Script de migración: crea todas las tablas en PostgreSQL
 * Ejecutar con: npm run migrate
 */
require("dotenv").config();
const pool = require("./pool");

const SQL = `
-- =============================================
-- TABLA: usuarios
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id           VARCHAR(128) PRIMARY KEY,   -- uid de Firebase Auth
  email        VARCHAR(255) NOT NULL,
  name         VARCHAR(255),
  tipo_usuario VARCHAR(50) DEFAULT 'User',
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: herramientas
-- =============================================
CREATE TABLE IF NOT EXISTS herramientas (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,      -- para migración
  nombre          VARCHAR(255) NOT NULL,
  codigo          VARCHAR(100) NOT NULL UNIQUE,
  marca           VARCHAR(255),
  descripcion     TEXT,
  disponible      BOOLEAN DEFAULT TRUE,
  dado_de_baja    BOOLEAN DEFAULT FALSE,
  usuario_asignado VARCHAR(255),
  fecha_asignacion TIMESTAMPTZ,
  fecha_retorno    TIMESTAMPTZ,
  fecha_registro   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: logs_herramienta
-- =============================================
CREATE TABLE IF NOT EXISTS logs_herramienta (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,
  herramienta_id  INT REFERENCES herramientas(id) ON DELETE SET NULL,
  nombre          VARCHAR(255),
  codigo          VARCHAR(100),
  marca           VARCHAR(255),
  descripcion     TEXT,
  accion          VARCHAR(50),              -- 'asignacion' | 'retorno'
  disponible      BOOLEAN,
  usuario_asignado VARCHAR(255),
  realizado_por   VARCHAR(255),
  fecha_asignacion TIMESTAMPTZ,
  fecha_retorno    TIMESTAMPTZ,
  fecha_regreso    TIMESTAMPTZ,
  fecha_registro   TIMESTAMPTZ,
  fecha_log        TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: materiales
-- =============================================
CREATE TABLE IF NOT EXISTS materiales (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,
  nombre          VARCHAR(255) NOT NULL,
  descripcion     TEXT,
  unidad          VARCHAR(100),
  disponible      BOOLEAN DEFAULT TRUE,
  fecha_disposicion TIMESTAMPTZ,
  dispuesto_por   VARCHAR(255),
  fecha_consumo   TIMESTAMPTZ,
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: logs_materiales
-- =============================================
CREATE TABLE IF NOT EXISTS logs_materiales (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,
  material_id     INT REFERENCES materiales(id) ON DELETE SET NULL,
  nombre          VARCHAR(255),
  descripcion     TEXT,
  unidad          VARCHAR(100),
  fecha_disposicion TIMESTAMPTZ,
  dispuesto_por   VARCHAR(255),
  fecha_log       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: folios_linea1
-- =============================================
CREATE TABLE IF NOT EXISTS folios_linea1 (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,
  numero_folio    INT NOT NULL UNIQUE,
  utilizado       VARCHAR(10) DEFAULT 'NO', -- 'SI' | 'NO'
  cliente_asignado VARCHAR(255),
  nombre_login    VARCHAR(255),
  placa           VARCHAR(100),
  estado          VARCHAR(100),
  year            INT,
  fecha_alta      TIMESTAMPTZ,
  uso             VARCHAR(100),
  referencia      VARCHAR(255),
  referencia2     VARCHAR(255),
  cantidad_credito VARCHAR(100)
);

-- =============================================
-- TABLA: folios_linea2
-- =============================================
CREATE TABLE IF NOT EXISTS folios_linea2 (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,
  numero_folio    INT NOT NULL UNIQUE,
  utilizado       VARCHAR(10) DEFAULT 'NO',
  cliente_asignado VARCHAR(255),
  nombre_login    VARCHAR(255),
  placa           VARCHAR(100),
  estado          VARCHAR(100),
  year            INT,
  fecha_alta      TIMESTAMPTZ,
  uso             VARCHAR(100),
  referencia      VARCHAR(255),
  referencia2     VARCHAR(255),
  cantidad_credito VARCHAR(100)
);

-- =============================================
-- TABLA: registro (REGISTRO)
-- =============================================
CREATE TABLE IF NOT EXISTS registro (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,
  fecha_registro  TIMESTAMPTZ,
  nota            TEXT,
  linea           VARCHAR(50),
  certificado     NUMERIC,
  certificado_ok  BOOLEAN DEFAULT FALSE,
  placa           VARCHAR(100),
  combustible     VARCHAR(100),
  uso             VARCHAR(100),
  fecha_alta      TIMESTAMPTZ,
  no_alta         VARCHAR(100),
  nombre_cliente  VARCHAR(255),
  estatus_multa   VARCHAR(100),
  multa           NUMERIC,
  no_serie        VARCHAR(255),
  costo           NUMERIC,
  cantidad_credito VARCHAR(100),
  fecha_pago      TIMESTAMPTZ,
  referencia      VARCHAR(255),
  referencia2     VARCHAR(255),
  year            INT,
  estado          VARCHAR(100),
  usuario_actual  VARCHAR(255),
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: registro_federal (RegistroFederal)
-- =============================================
CREATE TABLE IF NOT EXISTS registro_federal (
  id              SERIAL PRIMARY KEY,
  firebase_id     VARCHAR(128) UNIQUE,
  fecha_registro  TIMESTAMPTZ,
  nota            TEXT,
  linea           VARCHAR(50),
  certificado     NUMERIC,
  certificado_ok  BOOLEAN DEFAULT FALSE,
  placa           VARCHAR(100),
  combustible     VARCHAR(100),
  uso             VARCHAR(100),
  fecha_alta      TIMESTAMPTZ,
  no_alta         VARCHAR(100),
  nombre_cliente  VARCHAR(255),
  estatus_multa   VARCHAR(100),
  multa           NUMERIC,
  no_serie        VARCHAR(255),
  costo           NUMERIC,
  cantidad_credito VARCHAR(100),
  fecha_pago      TIMESTAMPTZ,
  referencia      VARCHAR(255),
  referencia2     VARCHAR(255),
  year            INT,
  estado          VARCHAR(100),
  usuario_actual  VARCHAR(255),
  creado_en       TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TABLA: configuraciones
-- =============================================
CREATE TABLE IF NOT EXISTS configuraciones (
  id              SERIAL PRIMARY KEY,
  clave           VARCHAR(100) UNIQUE NOT NULL,
  owner_gmail     VARCHAR(255),
  time_cobro      INT,
  time_verificacion INT,
  actualizado_en  TIMESTAMPTZ DEFAULT NOW()
);

-- Registro inicial de configuración si no existe
INSERT INTO configuraciones (clave) VALUES ('principal')
ON CONFLICT (clave) DO NOTHING;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Iniciando migración de tablas...");
    await client.query(SQL);
    console.log("✅ Todas las tablas creadas correctamente.");
  } catch (err) {
    console.error("❌ Error en migración:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
