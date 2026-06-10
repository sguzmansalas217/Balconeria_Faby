const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const { JWT_SECRET, verifyFirebaseToken } = require("../middleware/auth");

/**
 * POST /api/auth/token
 * Llamado justo después del login Firebase.
 * Crea el usuario en PostgreSQL si no existe.
 * NO sobreescribe tipo_usuario si el usuario ya existe (así se preserva el rol Admin).
 */
router.post("/token", async (req, res) => {
  try {
    const { uid, email, name } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "uid y email son requeridos" });
    }

    // Upsert: crea el usuario con rol User por default.
    // Si ya existe, solo actualiza email y name — NO el tipo_usuario, para preservar el rol.
    const result = await pool.query(
      `INSERT INTO usuarios (id, email, name, tipo_usuario)
       VALUES ($1, $2, $3, 'User')
       ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email,
             name  = COALESCE(EXCLUDED.name, usuarios.name)
       RETURNING id, email, name, tipo_usuario`,
      [uid, email, name || null]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        uid:          user.id,
        email:        user.email,
        name:         user.name,
        tipo_usuario: user.tipo_usuario,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token, user });
  } catch (err) {
    console.error("Error en /api/auth/token:", err);
    res.status(500).json({ error: "Error al generar token" });
  }
});

/**
 * PUT /api/auth/role/:uid
 * Solo Admin puede cambiar el rol de otro usuario.
 */
router.put("/role/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== "Admin") {
      return res.status(403).json({ error: "Solo los administradores pueden cambiar roles" });
    }

    const { tipo_usuario } = req.body;
    if (!["Admin", "User"].includes(tipo_usuario)) {
      return res.status(400).json({ error: "tipo_usuario debe ser 'Admin' o 'User'" });
    }

    const result = await pool.query(
      `UPDATE usuarios SET tipo_usuario = $1 WHERE id = $2 RETURNING id, email, name, tipo_usuario`,
      [tipo_usuario, req.params.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error en PUT /api/auth/role:", err);
    res.status(500).json({ error: "Error al actualizar rol" });
  }
});

module.exports = router;
