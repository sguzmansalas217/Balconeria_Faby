const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyFirebaseToken } = require("../middleware/auth");

// GET /api/herramientas - Listar herramientas (excluyendo dadas de baja por defecto)
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const incluyeBaja = req.query.incluyeBaja === "true";
    const whereClause = incluyeBaja ? "" : "WHERE dado_de_baja = FALSE";
    const result = await pool.query(
      `SELECT * FROM herramientas ${whereClause} ORDER BY nombre ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener herramientas" });
  }
});

// GET /api/herramientas/logs - Historial de herramientas (DEBE ir antes de /:id)
router.get("/logs", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM logs_herramienta ORDER BY fecha_log DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener logs" });
  }
});

// GET /api/herramientas/:id
router.get("/:id", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM herramientas WHERE id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "No encontrada" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener herramienta" });
  }
});

// POST /api/herramientas - Crear herramienta (Alta)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { nombre, codigo, marca, descripcion, disponible, dado_de_baja } = req.body;
    const result = await pool.query(
      `INSERT INTO herramientas (nombre, codigo, marca, descripcion, disponible, dado_de_baja)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, codigo, marca, descripcion, disponible ?? true, dado_de_baja ?? false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(409).json({ error: "El código de herramienta ya existe" });
    }
    res.status(500).json({ error: "Error al crear herramienta" });
  }
});

// PUT /api/herramientas/:id/asignar - Asignar herramienta a usuario
router.put("/:id/asignar", verifyFirebaseToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { usuario_asignado, fecha_asignacion } = req.body;

    // Verificar que está disponible
    const check = await client.query("SELECT * FROM herramientas WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Herramienta no encontrada" });
    }
    const herramienta = check.rows[0];
    if (!herramienta.disponible) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Herramienta no disponible / ya asignada" });
    }

    const fechaDate = fecha_asignacion ? new Date(fecha_asignacion) : new Date();

    // Actualizar herramienta
    const updated = await client.query(
      `UPDATE herramientas
       SET usuario_asignado = $1, fecha_asignacion = $2, fecha_retorno = NULL, disponible = FALSE
       WHERE id = $3
       RETURNING *`,
      [usuario_asignado, fechaDate, id]
    );

    // Guardar log
    await client.query(
      `INSERT INTO logs_herramienta
         (herramienta_id, nombre, codigo, marca, descripcion, accion, disponible,
          usuario_asignado, realizado_por, fecha_asignacion, fecha_log)
       VALUES ($1,$2,$3,$4,$5,'asignacion',FALSE,$6,$7,$8,NOW())`,
      [
        id,
        herramienta.nombre,
        herramienta.codigo,
        herramienta.marca,
        herramienta.descripcion,
        usuario_asignado,
        req.user.email,
        fechaDate,
      ]
    );

    await client.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al asignar herramienta" });
  } finally {
    client.release();
  }
});

// PUT /api/herramientas/:id/regresar - Devolver herramienta
router.put("/:id/regresar", verifyFirebaseToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const { fecha_retorno } = req.body;

    const check = await client.query("SELECT * FROM herramientas WHERE id = $1", [id]);
    if (check.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Herramienta no encontrada" });
    }
    const herramienta = check.rows[0];
    if (herramienta.disponible) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Herramienta ya disponible / no asignada" });
    }

    const fechaDate = fecha_retorno ? new Date(fecha_retorno) : new Date();

    // Guardar log
    await client.query(
      `INSERT INTO logs_herramienta
         (herramienta_id, nombre, codigo, marca, descripcion, accion, disponible,
          usuario_asignado, realizado_por, fecha_asignacion, fecha_regreso, fecha_log)
       VALUES ($1,$2,$3,$4,$5,'retorno',TRUE,$6,$7,$8,$9,NOW())`,
      [
        id,
        herramienta.nombre,
        herramienta.codigo,
        herramienta.marca,
        herramienta.descripcion,
        herramienta.usuario_asignado,
        req.user.email,
        herramienta.fecha_asignacion,
        fechaDate,
      ]
    );

    // Limpiar herramienta
    const updated = await client.query(
      `UPDATE herramientas
       SET usuario_asignado = NULL, fecha_asignacion = NULL, fecha_retorno = $1, disponible = TRUE
       WHERE id = $2
       RETURNING *`,
      [fechaDate, id]
    );

    await client.query("COMMIT");
    res.json(updated.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al regresar herramienta" });
  } finally {
    client.release();
  }
});

// POST /api/herramientas/asignar-masivo - Asignar múltiples por código
router.post("/asignar-masivo", verifyFirebaseToken, async (req, res) => {
  const { codigos, usuario_asignado, fecha_asignacion, accion } = req.body;
  const errores = [];
  const exitosos = [];

  for (const codigo of codigos) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const found = await client.query("SELECT * FROM herramientas WHERE codigo = $1", [codigo]);

      if (found.rows.length === 0) {
        errores.push({ codigo, error: "No existe" });
        await client.query("ROLLBACK");
        continue;
      }

      const h = found.rows[0];

      if (accion === "asignar") {
        if (!h.disponible) {
          errores.push({ codigo, error: "No disponible / ya asignada" });
          await client.query("ROLLBACK");
          continue;
        }
        const fecha = fecha_asignacion ? new Date(fecha_asignacion) : new Date();
        await client.query(
          `UPDATE herramientas SET usuario_asignado=$1, fecha_asignacion=$2, fecha_retorno=NULL, disponible=FALSE WHERE id=$3`,
          [usuario_asignado, fecha, h.id]
        );
        await client.query(
          `INSERT INTO logs_herramienta (herramienta_id, nombre, codigo, marca, descripcion, accion, disponible, usuario_asignado, realizado_por, fecha_asignacion, fecha_log)
           VALUES ($1,$2,$3,$4,$5,'asignacion',FALSE,$6,$7,$8,NOW())`,
          [h.id, h.nombre, h.codigo, h.marca, h.descripcion, usuario_asignado, req.user.email, fecha]
        );
      } else {
        if (h.disponible) {
          errores.push({ codigo, error: "Ya disponible / no asignada" });
          await client.query("ROLLBACK");
          continue;
        }
        const fecha = fecha_asignacion ? new Date(fecha_asignacion) : new Date();
        await client.query(
          `INSERT INTO logs_herramienta (herramienta_id, nombre, codigo, marca, descripcion, accion, disponible, usuario_asignado, realizado_por, fecha_regreso, fecha_log)
           VALUES ($1,$2,$3,$4,$5,'retorno',TRUE,$6,$7,$8,NOW())`,
          [h.id, h.nombre, h.codigo, h.marca, h.descripcion, h.usuario_asignado, req.user.email, fecha]
        );
        await client.query(
          `UPDATE herramientas SET usuario_asignado=NULL, fecha_asignacion=NULL, fecha_retorno=$1, disponible=TRUE WHERE id=$2`,
          [fecha, h.id]
        );
      }

      await client.query("COMMIT");
      exitosos.push(codigo);
    } catch (err) {
      await client.query("ROLLBACK");
      errores.push({ codigo, error: "Error al actualizar" });
    } finally {
      client.release();
    }
  }

  res.json({ exitosos, errores });
});

module.exports = router;
