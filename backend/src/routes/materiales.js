const express = require("express");
const router = express.Router();
const pool = require("../db/pool");
const { verifyFirebaseToken } = require("../middleware/auth");
const https = require("https");
const multer = require("multer");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

async function extraerTextoPDF(buffer) {
  const uint8 = new Uint8Array(buffer);
  const doc = await pdfjsLib.getDocument({ data: uint8, useWorkerFetch: false, isEvalSupported: false, useSystemFonts: true }).promise;
  let texto = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    texto += content.items.map(i => i.str).join(" ") + "\n";
  }
  return texto;
}
const axios = require("axios");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/materiales
router.get("/", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM materiales ORDER BY nombre ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener materiales" });
  }
});

// POST /api/materiales - Alta de material (puede crear N registros con cantidad)
router.post("/", verifyFirebaseToken, async (req, res) => {
  try {
    const { nombre, descripcion, unidad, disponible, cantidad, costo_unitario } = req.body;
    const n = cantidad && cantidad > 0 ? cantidad : 1;
    const costo = parseFloat(costo_unitario) || 0;

    const insertados = [];
    for (let i = 0; i < n; i++) {
      const result = await pool.query(
        `INSERT INTO materiales (nombre, descripcion, unidad, disponible, costo_unitario)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [nombre, descripcion, unidad, disponible ?? true, costo]
      );
      insertados.push(result.rows[0]);
    }

    res.status(201).json(insertados);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear material" });
  }
});

// POST /api/materiales/parse-factura - Extraer items de un PDF usando Claude AI
router.post("/parse-factura", verifyFirebaseToken, upload.single("factura"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No se recibió ningún archivo" });

    const texto = await extraerTextoPDF(req.file.buffer);
    console.log("PDF texto extraído (primeros 500 chars):", texto.slice(0, 500));

    const response = await axios.post(
      "https://api.anthropic.com/v1/messages",
      {
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: `Analiza este texto de factura CFDI y extrae todos los artículos/materiales listados en las partidas.

REGLAS IMPORTANTES:
- "Cantidad" = peso total en Kg. NO la uses como cantidad de piezas.
- "Pz/Mt" o "Piezas" = unidades físicas reales. USA ESTE VALOR como "cantidad".
- Si no hay columna Pz/Mt, usa 1.
- "P. Unitario" o "Precio Unitario" = precio por Kg. Calcula el costo por pieza así: (Importe / Pz/Mt). Si no puedes calcular, usa el P.Unitario directamente.
- La unidad siempre es "Pieza" salvo que sea claramente "Metro" o "Litro".

Para cada artículo devuelve un objeto JSON con:
- nombre: nombre corto (máx 80 chars)
- descripcion: descripción completa tal como aparece
- unidad: "Pieza", "Metro" o "Litro"
- cantidad: número entero de la columna Pz/Mt
- costo_unitario: número decimal = Importe / Pz/Mt (precio por pieza). Si no hay datos, 0.
- disponible: true

Responde ÚNICAMENTE con un array JSON válido, sin markdown, sin bloques de código.
Ejemplo: "ANGULO 1/8... Cantidad:171 Pz/Mt:15 P.Unitario:20.18 Importe:3450.78"
→ cantidad=15, costo_unitario=3450.78/15=230.05
Respuesta: [{"nombre":"Angulo 1/8 x 1 1/2","descripcion":"ANGULO 1/8 X 1 1/2 IN. A572 G50 A 20 FT","unidad":"Pieza","cantidad":15,"costo_unitario":230.05,"disponible":true}]

Texto de la factura:
${texto}`
        }]
      },
      {
        headers: {
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json"
        },
        httpsAgent: new https.Agent({ rejectUnauthorized: false })
      }
    );

    let raw = response.data.content[0].text.trim();
    console.log("Respuesta Claude:", raw);

    // Eliminar bloques de markdown si Claude los incluye
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const items = JSON.parse(raw);
    res.json(items);
  } catch (err) {
    console.error("Error parse-factura:", err.response?.data || err.message);
    res.status(500).json({ error: "Error al procesar la factura: " + (err.response?.data?.error?.message || err.message) });
  }
});

// PUT /api/materiales/disponer - Marcar materiales como dispuestos (consumidos)
router.put("/disponer", verifyFirebaseToken, async (req, res) => {
  const { ids, usuario, fecha } = req.body;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const fechaDate = fecha ? new Date(fecha) : new Date();
    const procesados = [];

    for (const id of ids) {
      const found = await client.query("SELECT * FROM materiales WHERE id = $1", [id]);
      if (found.rows.length === 0) continue;

      const mat = found.rows[0];
      if (!mat.disponible) continue;

      await client.query(
        `UPDATE materiales
         SET disponible = FALSE, fecha_disposicion = $1, dispuesto_por = $2
         WHERE id = $3`,
        [fechaDate, usuario, id]
      );

      await client.query(
        `INSERT INTO logs_materiales (material_id, nombre, descripcion, unidad, fecha_disposicion, dispuesto_por, costo_unitario, costo_total, fecha_log)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [id, mat.nombre, mat.descripcion, mat.unidad, fechaDate, usuario,
         mat.costo_unitario || 0, mat.costo_unitario || 0]
      );

      procesados.push(id);
    }

    await client.query("COMMIT");
    res.json({ procesados, total: procesados.length });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al disponer materiales" });
  } finally {
    client.release();
  }
});

// GET /api/materiales/resumen-mensual - Total gastado por usuario por mes
router.get("/resumen-mensual", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        dispuesto_por,
        TO_CHAR(DATE_TRUNC('month', fecha_log), 'YYYY-MM') AS mes,
        COUNT(*)::int                                       AS piezas,
        COALESCE(SUM(costo_total), 0)::numeric              AS total
      FROM logs_materiales
      WHERE dispuesto_por IS NOT NULL
      GROUP BY dispuesto_por, DATE_TRUNC('month', fecha_log)
      ORDER BY DATE_TRUNC('month', fecha_log) DESC, total DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener resumen mensual" });
  }
});

// GET /api/materiales/logs - Historial de movimientos
router.get("/logs", verifyFirebaseToken, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM logs_materiales ORDER BY fecha_log DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener logs" });
  }
});

module.exports = router;
