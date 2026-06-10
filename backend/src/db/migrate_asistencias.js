require("dotenv").config();
const pool = require("./pool");

const SQL = `
-- Configuración de sueldo por empleado (usa uid de usuarios)
CREATE TABLE IF NOT EXISTS empleados_config (
  uid          VARCHAR(128) PRIMARY KEY REFERENCES usuarios(id) ON DELETE CASCADE,
  sueldo_dia   NUMERIC(10,2) NOT NULL DEFAULT 0,
  activo       BOOLEAN DEFAULT TRUE,
  creado_en    TIMESTAMPTZ DEFAULT NOW()
);

-- Registro de asistencias (una fila por día por empleado)
CREATE TABLE IF NOT EXISTS asistencias (
  id            SERIAL PRIMARY KEY,
  uid           VARCHAR(128) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  fecha         DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada  TIMESTAMPTZ,
  hora_salida   TIMESTAMPTZ,
  horas_trabajadas NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN hora_salida IS NOT NULL AND hora_entrada IS NOT NULL
         THEN ROUND(EXTRACT(EPOCH FROM (hora_salida - hora_entrada)) / 3600.0, 2)
         ELSE NULL
    END
  ) STORED,
  creado_en     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(uid, fecha)
);

-- Nómina semanal cerrada por el Admin
CREATE TABLE IF NOT EXISTS pagos_semana (
  id             SERIAL PRIMARY KEY,
  uid            VARCHAR(128) NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  semana_inicio  DATE NOT NULL,
  semana_fin     DATE NOT NULL,
  dias_trabajados INT DEFAULT 0,
  horas_totales  NUMERIC(6,2) DEFAULT 0,
  sueldo_dia     NUMERIC(10,2) DEFAULT 0,
  subtotal       NUMERIC(10,2) DEFAULT 0,
  bono           NUMERIC(10,2) DEFAULT 0,
  total          NUMERIC(10,2) DEFAULT 0,
  pagado         BOOLEAN DEFAULT FALSE,
  notas          TEXT,
  creado_en      TIMESTAMPTZ DEFAULT NOW()
);
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Creando tablas de asistencias...");
    await client.query(SQL);
    console.log("✅ Tablas de asistencias creadas.");
  } catch (err) {
    console.error("❌ Error:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
