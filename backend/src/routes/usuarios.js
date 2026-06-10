const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyFirebaseToken } = require("../middleware/auth");

// GET /api/usuarios
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, tipo_usuario, creado_en FROM usuarios ORDER BY creado_en DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// GET /api/usuarios/:uid
router.get("/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, tipo_usuario, creado_en FROM usuarios WHERE id = $1",
      [req.params.uid]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

module.exports = router;
