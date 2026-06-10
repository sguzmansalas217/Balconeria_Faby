const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyFirebaseToken } = require("../middleware/auth");

// Función helper para convertir fechas
function parseDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === "string" && val.trim() !== "") return new Date(val);
  if (val.seconds) return new Date(val.seconds * 1000); // Timestamp Firebase
  return null;
}

// ===== REGISTRO (línea 1 y 2) =====

// GET /api/registro
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM registro ORDER BY fecha_registro DESC NULLS LAST"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener registros" });
  }
});

// POST /api/registro
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const {
      fecha_registro, nota, linea, certificado, certificado_ok,
      placa, combustible, uso, fecha_alta, no_alta, nombre_cliente,
      estatus_multa, multa, no_serie, costo, cantidad_credito,
      fecha_pago, referencia, referencia2, year, estado, usuario_actual,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO registro (
        fecha_registro, nota, linea, certificado, certificado_ok, placa, combustible,
        uso, fecha_alta, no_alta, nombre_cliente, estatus_multa, multa, no_serie,
        costo, cantidad_credito, fecha_pago, referencia, referencia2, year, estado, usuario_actual
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      RETURNING *`,
      [
        parseDate(fecha_registro), nota, linea, certificado, certificado_ok ?? false,
        placa, combustible, uso, parseDate(fecha_alta), no_alta, nombre_cliente,
        estatus_multa, multa, no_serie, costo, cantidad_credito,
        parseDate(fecha_pago), referencia, referencia2, year, estado, usuario_actual,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear registro" });
  }
});

// PUT /api/registro/:id - Actualizar registro con validación de folio
router.put("/:id", verifyFirebaseToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const data = req.body;
    const certificadoNum = data.certificado ? Number(data.certificado) : null;

    // Buscar el folio en línea 1 o 2
    let folioRow = null;
    let folioTable = null;
    let lineaEncontrada = null;

    if (certificadoNum) {
      const r1 = await client.query(
        "SELECT * FROM folios_linea1 WHERE numero_folio = $1",
        [certificadoNum]
      );
      if (r1.rows.length > 0) {
        folioRow = r1.rows[0];
        folioTable = "folios_linea1";
        lineaEncontrada = "Linea 1";
      } else {
        const r2 = await client.query(
          "SELECT * FROM folios_linea2 WHERE numero_folio = $1",
          [certificadoNum]
        );
        if (r2.rows.length > 0) {
          folioRow = r2.rows[0];
          folioTable = "folios_linea2";
          lineaEncontrada = "Linea 2";
        }
      }

      if (!folioRow) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "El folio no existe en ninguna colección" });
      }

      if (folioRow.utilizado === "SI" && folioRow.placa !== data.placa) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "El certificado ya está asignado a otra placa" });
      }

      // Marcar folio como utilizado
      await client.query(
        `UPDATE ${folioTable} SET
          utilizado = 'SI',
          cliente_asignado = $1,
          nombre_login = $2,
          placa = $3,
          estado = $4,
          year = $5,
          fecha_alta = $6,
          uso = $7,
          referencia = $8,
          referencia2 = $9,
          cantidad_credito = $10
        WHERE numero_folio = $11`,
        [
          data.nombre_cliente || null,
          req.user.email || null,
          data.placa || null,
          data.estado || null,
          data.year || null,
          parseDate(data.fecha_alta),
          data.uso || null,
          data.referencia || null,
          data.referencia2 || null,
          data.cantidad_credito || null,
          certificadoNum,
        ]
      );
    }

    // Actualizar registro
    const result = await client.query(
      `UPDATE registro SET
        fecha_registro = $1, nota = $2, linea = $3, certificado = $4, certificado_ok = $5,
        placa = $6, combustible = $7, uso = $8, fecha_alta = $9, no_alta = $10,
        nombre_cliente = $11, estatus_multa = $12, multa = $13, no_serie = $14,
        costo = $15, cantidad_credito = $16, fecha_pago = $17, referencia = $18,
        referencia2 = $19, year = $20, estado = $21, usuario_actual = $22
      WHERE id = $23
      RETURNING *`,
      [
        parseDate(data.fecha_registro), data.nota, lineaEncontrada || data.linea,
        data.certificado, data.certificado_ok ?? false, data.placa, data.combustible,
        data.uso, parseDate(data.fecha_alta), data.no_alta, data.nombre_cliente,
        data.estatus_multa, data.multa, data.no_serie, data.costo, data.cantidad_credito,
        parseDate(data.fecha_pago), data.referencia, data.referencia2, data.year,
        data.estado, data.usuario_actual, id,
      ]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Registro no encontrado" });
    }

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al actualizar registro" });
  } finally {
    client.release();
  }
});

// ===== REGISTRO FEDERAL =====

// GET /api/registro/federal
router.get("/federal/list", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM registro_federal ORDER BY fecha_registro DESC NULLS LAST"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener registros federales" });
  }
});

// PUT /api/registro/federal/:id
router.put("/federal/:id", verifyFirebaseToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { id } = req.params;
    const data = req.body;
    const certificadoNum = data.certificado ? Number(data.certificado) : null;

    let folioRow = null;
    let folioTable = null;
    let lineaEncontrada = null;

    if (certificadoNum) {
      const r1 = await client.query(
        "SELECT * FROM folios_linea1 WHERE numero_folio = $1",
        [certificadoNum]
      );
      if (r1.rows.length > 0) {
        folioRow = r1.rows[0];
        folioTable = "folios_linea1";
        lineaEncontrada = "Linea 1";
      } else {
        const r2 = await client.query(
          "SELECT * FROM folios_linea2 WHERE numero_folio = $1",
          [certificadoNum]
        );
        if (r2.rows.length > 0) {
          folioRow = r2.rows[0];
          folioTable = "folios_linea2";
          lineaEncontrada = "Linea 2";
        }
      }

      if (!folioRow) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "El folio no existe en ninguna colección" });
      }

      if (folioRow.utilizado === "SI" && folioRow.placa !== data.placa) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "El certificado ya está asignado a otra placa" });
      }

      await client.query(
        `UPDATE ${folioTable} SET
          utilizado = 'SI',
          cliente_asignado = $1,
          nombre_login = $2,
          placa = $3,
          estado = $4,
          year = $5,
          fecha_alta = $6,
          uso = $7,
          referencia = $8,
          referencia2 = $9,
          cantidad_credito = $10
        WHERE numero_folio = $11`,
        [
          data.nombre_cliente || null,
          req.user.email || null,
          data.placa || null,
          data.estado || null,
          data.year || null,
          parseDate(data.fecha_alta),
          data.uso || null,
          data.referencia || null,
          data.referencia2 || null,
          data.cantidad_credito || null,
          certificadoNum,
        ]
      );
    }

    const result = await client.query(
      `UPDATE registro_federal SET
        fecha_registro=$1, nota=$2, linea=$3, certificado=$4, certificado_ok=$5,
        placa=$6, combustible=$7, uso=$8, fecha_alta=$9, no_alta=$10,
        nombre_cliente=$11, estatus_multa=$12, multa=$13, no_serie=$14,
        costo=$15, cantidad_credito=$16, fecha_pago=$17, referencia=$18,
        referencia2=$19, year=$20, estado=$21, usuario_actual=$22
      WHERE id=$23 RETURNING *`,
      [
        parseDate(data.fecha_registro), data.nota, lineaEncontrada || data.linea, data.certificado,
        data.certificado_ok ?? false, data.placa, data.combustible, data.uso,
        parseDate(data.fecha_alta), data.no_alta, data.nombre_cliente, data.estatus_multa,
        data.multa, data.no_serie, data.costo, data.cantidad_credito,
        parseDate(data.fecha_pago), data.referencia, data.referencia2, data.year,
        data.estado, data.usuario_actual, id,
      ]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "No encontrado" });
    }

    await client.query("COMMIT");
    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al actualizar registro federal" });
  } finally {
    client.release();
  }
});

module.exports = router;
