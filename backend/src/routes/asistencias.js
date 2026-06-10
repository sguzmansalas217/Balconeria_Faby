const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyFirebaseToken } = require("../middleware/auth");

// ─── HELPERS ────────────────────────────────────────────────────────────────

function getLunesDe(fechaStr) {
  const d = fechaStr ? new Date(fechaStr) : new Date();
  const day = d.getDay(); // 0=dom,1=lun,...,6=sab
  const diff = (day === 0) ? -6 : 1 - day;
  const lunes = new Date(d);
  lunes.setDate(d.getDate() + diff);
  return lunes.toISOString().split("T")[0];
}

function getDomingoDe(lunesStr) {
  const d = new Date(lunesStr);
  d.setDate(d.getDate() + 6);
  return d.toISOString().split("T")[0];
}

// ─── EMPLEADOS CONFIG ────────────────────────────────────────────────────────

// GET /api/asistencias/empleados — lista todos los usuarios con su sueldo
router.get("/empleados", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.name, u.tipo_usuario,
             COALESCE(ec.sueldo_dia, 0) AS sueldo_dia,
             COALESCE(ec.activo, TRUE)  AS activo
      FROM usuarios u
      LEFT JOIN empleados_config ec ON ec.uid = u.id
      ORDER BY u.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

// PUT /api/asistencias/empleados/:uid — actualiza sueldo (Admin)
router.put("/empleados/:uid", verifyFirebaseToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== "Admin")
      return res.status(403).json({ error: "Solo Admin" });

    const { sueldo_dia, activo } = req.body;
    await pool.query(`
      INSERT INTO empleados_config (uid, sueldo_dia, activo)
      VALUES ($1, $2, $3)
      ON CONFLICT (uid) DO UPDATE
        SET sueldo_dia = EXCLUDED.sueldo_dia,
            activo     = EXCLUDED.activo
    `, [req.params.uid, sueldo_dia, activo ?? true]);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al actualizar sueldo" });
  }
});

// ─── CHECK-IN / CHECK-OUT (público — solo requiere uid válido) ───────────────

// GET /api/asistencias/kiosco — lista empleados activos para el kiosco (sin auth)
router.get("/kiosco", async (req, res) => {
  try {
    const hoy = new Date().toISOString().split("T")[0];
    const result = await pool.query(`
      SELECT u.id, u.name, u.email,
             a.hora_entrada, a.hora_salida, a.horas_trabajadas
      FROM usuarios u
      INNER JOIN empleados_config ec ON ec.uid = u.id AND ec.activo = TRUE
      LEFT JOIN asistencias a ON a.uid = u.id AND a.fecha = $1
      ORDER BY u.name ASC
    `, [hoy]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener empleados" });
  }
});

// POST /api/asistencias/entrada — registra entrada (sin auth, solo uid)
router.post("/entrada", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "uid requerido" });

    const hoy = new Date().toISOString().split("T")[0];

    // Verificar que el empleado existe y está activo
    const emp = await pool.query(
      "SELECT u.name FROM usuarios u INNER JOIN empleados_config ec ON ec.uid=u.id WHERE u.id=$1 AND ec.activo=TRUE",
      [uid]
    );
    if (emp.rows.length === 0)
      return res.status(404).json({ error: "Empleado no encontrado o inactivo" });

    // Upsert — solo registra entrada si no existe hoy
    const result = await pool.query(`
      INSERT INTO asistencias (uid, fecha, hora_entrada)
      VALUES ($1, $2, NOW())
      ON CONFLICT (uid, fecha) DO UPDATE
        SET hora_entrada = CASE
          WHEN asistencias.hora_entrada IS NULL THEN NOW()
          ELSE asistencias.hora_entrada
        END
      RETURNING *
    `, [uid, hoy]);

    res.json({ ok: true, asistencia: result.rows[0], nombre: emp.rows[0].name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar entrada" });
  }
});

// POST /api/asistencias/salida — registra salida (sin auth, solo uid)
router.post("/salida", async (req, res) => {
  try {
    const { uid } = req.body;
    if (!uid) return res.status(400).json({ error: "uid requerido" });

    const hoy = new Date().toISOString().split("T")[0];

    const result = await pool.query(`
      UPDATE asistencias
      SET hora_salida = NOW()
      WHERE uid = $1 AND fecha = $2 AND hora_entrada IS NOT NULL
      RETURNING *
    `, [uid, hoy]);

    if (result.rows.length === 0)
      return res.status(400).json({ error: "No hay entrada registrada hoy" });

    const nombre = await pool.query("SELECT name FROM usuarios WHERE id=$1", [uid]);
    res.json({ ok: true, asistencia: result.rows[0], nombre: nombre.rows[0]?.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar salida" });
  }
});

// ─── HISTORIAL ───────────────────────────────────────────────────────────────

// GET /api/asistencias/mis — historial del usuario autenticado
router.get("/mis", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT * FROM asistencias
      WHERE uid = $1
      ORDER BY fecha DESC
      LIMIT 60
    `, [req.user.uid]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener asistencias" });
  }
});

// GET /api/asistencias/todas — todas las asistencias (Admin)
router.get("/todas", verifyFirebaseToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== "Admin")
      return res.status(403).json({ error: "Solo Admin" });

    const { desde, hasta } = req.query;
    const result = await pool.query(`
      SELECT a.*, u.name, u.email
      FROM asistencias a
      JOIN usuarios u ON u.id = a.uid
      WHERE ($1::date IS NULL OR a.fecha >= $1::date)
        AND ($2::date IS NULL OR a.fecha <= $2::date)
      ORDER BY a.fecha DESC, u.name ASC
    `, [desde || null, hasta || null]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener asistencias" });
  }
});

// ─── NÓMINA SEMANAL ──────────────────────────────────────────────────────────

// GET /api/asistencias/nomina?semana=2026-06-09 — calcula nómina de la semana
router.get("/nomina", verifyFirebaseToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== "Admin")
      return res.status(403).json({ error: "Solo Admin" });

    const lunes   = getLunesDe(req.query.semana);
    const domingo = getDomingoDe(lunes);

    const result = await pool.query(`
      SELECT
        u.id AS uid, u.name, u.email,
        COALESCE(ec.sueldo_dia, 0)                        AS sueldo_dia,
        COUNT(a.id)::int                                  AS dias_trabajados,
        COALESCE(SUM(a.horas_trabajadas), 0)::numeric     AS horas_totales,
        COALESCE(SUM(a.horas_trabajadas), 0) / 8.0
          * COALESCE(ec.sueldo_dia, 0)                    AS subtotal
      FROM usuarios u
      INNER JOIN empleados_config ec ON ec.uid = u.id AND ec.activo = TRUE
      LEFT JOIN asistencias a
        ON a.uid = u.id AND a.fecha BETWEEN $1 AND $2
           AND a.hora_salida IS NOT NULL
      GROUP BY u.id, u.name, u.email, ec.sueldo_dia
      ORDER BY u.name ASC
    `, [lunes, domingo]);

    // Buscar si ya existe pago cerrado para esa semana
    const pagos = await pool.query(
      "SELECT * FROM pagos_semana WHERE semana_inicio = $1", [lunes]
    );
    const pagosPorUid = {};
    pagos.rows.forEach(p => { pagosPorUid[p.uid] = p; });

    const nomina = result.rows.map(r => ({
      ...r,
      bono:  pagosPorUid[r.uid]?.bono  || 0,
      total: pagosPorUid[r.uid]?.total || (parseFloat(r.subtotal) || 0),
      pagado: pagosPorUid[r.uid]?.pagado || false,
      notas: pagosPorUid[r.uid]?.notas || "",
      semana_inicio: lunes,
      semana_fin: domingo,
    }));

    res.json({ lunes, domingo, nomina });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al calcular nómina" });
  }
});

// POST /api/asistencias/nomina/cerrar — guarda/cierra la nómina semanal
router.post("/nomina/cerrar", verifyFirebaseToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== "Admin")
      return res.status(403).json({ error: "Solo Admin" });

    const { semana_inicio, semana_fin, empleados } = req.body;
    // empleados: [{uid, dias_trabajados, horas_totales, sueldo_dia, subtotal, bono, total, notas}]

    for (const e of empleados) {
      await pool.query(`
        INSERT INTO pagos_semana
          (uid, semana_inicio, semana_fin, dias_trabajados, horas_totales, sueldo_dia, subtotal, bono, total, pagado, notas)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,TRUE,$10)
        ON CONFLICT DO NOTHING
      `, [e.uid, semana_inicio, semana_fin,
          e.dias_trabajados, e.horas_totales, e.sueldo_dia,
          e.subtotal, e.bono || 0, e.total, e.notas || ""]);
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al cerrar nómina" });
  }
});

// GET /api/asistencias/nomina/historial — historial de nóminas pagadas
router.get("/nomina/historial", verifyFirebaseToken, async (req, res) => {
  try {
    if (req.user.tipo_usuario !== "Admin")
      return res.status(403).json({ error: "Solo Admin" });

    const result = await pool.query(`
      SELECT p.*, u.name, u.email
      FROM pagos_semana p
      JOIN usuarios u ON u.id = p.uid
      ORDER BY p.semana_inicio DESC, u.name ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener historial" });
  }
});

module.exports = router;
