const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyFirebaseToken } = require("../middleware/auth");

// GET /api/configuraciones
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM configuraciones WHERE clave = 'principal' LIMIT 1"
    );
    if (result.rows.length === 0) {
      return res.json({});
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener configuraciones" });
  }
});

// PUT /api/configuraciones - Actualizar configuraciones
router.put("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { owner_gmail, time_cobro, time_verificacion } = req.body;
    const result = await pool.query(
      `UPDATE configuraciones
       SET owner_gmail = COALESCE($1, owner_gmail),
           time_cobro = COALESCE($2, time_cobro),
           time_verificacion = COALESCE($3, time_verificacion),
           actualizado_en = NOW()
       WHERE clave = 'principal'
       RETURNING *`,
      [owner_gmail || null, time_cobro || null, time_verificacion || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar configuraciones" });
  }
});

module.exports = router;
