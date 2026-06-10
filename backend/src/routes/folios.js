const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyFirebaseToken } = require("../middleware/auth");

// GET /api/folios/linea1/disponibles - Folios disponibles (no utilizados) de línea 1
router.get("/linea1/disponibles", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT numero_folio FROM folios_linea1 WHERE utilizado = 'NO' ORDER BY numero_folio ASC"
    );
    res.json(result.rows.map((r) => r.numero_folio));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener folios línea 1" });
  }
});

// GET /api/folios/linea2/disponibles
router.get("/linea2/disponibles", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT numero_folio FROM folios_linea2 WHERE utilizado = 'NO' ORDER BY numero_folio ASC"
    );
    res.json(result.rows.map((r) => r.numero_folio));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener folios línea 2" });
  }
});

// GET /api/folios/linea1 - Todos los folios línea 1
router.get("/linea1", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM folios_linea1 ORDER BY numero_folio ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener folios" });
  }
});

// GET /api/folios/linea2 - Todos los folios línea 2
router.get("/linea2", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM folios_linea2 ORDER BY numero_folio ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener folios" });
  }
});

module.exports = router;
