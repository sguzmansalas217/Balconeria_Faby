require("dotenv").config();
const pool = require("./pool");

const SQL = `
ALTER TABLE materiales
  ADD COLUMN IF NOT EXISTS costo_unitario NUMERIC(12,2) DEFAULT 0;

ALTER TABLE logs_materiales
  ADD COLUMN IF NOT EXISTS costo_unitario NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS costo_total    NUMERIC(12,2) DEFAULT 0;
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log("Agregando columnas de costo...");
    await client.query(SQL);
    console.log("✅ Columnas de costo agregadas correctamente.");
  } catch (err) {
    console.error("❌ Error en migración:", err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
