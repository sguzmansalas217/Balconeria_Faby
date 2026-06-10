require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");
const cotizacionRouter = require("./routes/cotizacion");
const usuariosRouter = require("./routes/usuarios");
const herramientasRouter = require("./routes/herramientas");
const materialesRouter = require("./routes/materiales");
const registroRouter = require("./routes/registro");
const foliosRouter = require("./routes/folios");
const configuracionesRouter = require("./routes/configuraciones");
const asistenciasRouter    = require("./routes/asistencias");

const app = express();
const PORT = process.env.PORT || 3001;

// ──────────────────────────────────────────────
// Middleware global
// ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:5174", "http://localhost"],
  credentials: true,
}));
app.use(express.json());

// ──────────────────────────────────────────────
// Rutas públicas (sin JWT)
// ──────────────────────────────────────────────
app.use("/api/auth", authRouter);
app.use("/api/cotizacion", cotizacionRouter);

// ──────────────────────────────────────────────
// Rutas protegidas (requieren JWT)
// ──────────────────────────────────────────────
app.use("/api/usuarios", usuariosRouter);
app.use("/api/herramientas", herramientasRouter);
app.use("/api/materiales", materialesRouter);
app.use("/api/registro", registroRouter);
app.use("/api/folios", foliosRouter);
app.use("/api/configuraciones", configuracionesRouter);
app.use("/api/asistencias",    asistenciasRouter);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
  console.log(`   Sin dependencias de Firebase. Solo PostgreSQL + JWT.`);
});
