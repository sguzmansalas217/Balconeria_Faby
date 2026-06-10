/**
 * Servicio centralizado de API.
 * Usa JWT propio del backend (no Firebase Admin).
 *
 * Flujo de auth:
 * 1. Usuario hace login con Firebase Auth (email/password)
 * 2. El frontend llama a POST /api/auth/token con uid + email
 * 3. El backend guarda el usuario en PostgreSQL y devuelve un JWT propio
 * 4. Ese JWT se guarda en localStorage y se adjunta a todas las requests
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Adjunta el JWT en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Si el JWT expiró (401), limpia sesión
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt_token");
    }
    return Promise.reject(error);
  }
);

// ──────────────────────────────────────────────
// Cotizaciones — ruta pública, no requiere JWT
// ──────────────────────────────────────────────
export const cotizacionApi = {
  enviar: (data) => api.post("/api/cotizacion", data),
};

// ──────────────────────────────────────────────
// Auth — obtener JWT del backend tras login Firebase
// ──────────────────────────────────────────────
export const authApi = {
  getToken: (uid, email, name) =>
    api.post("/api/auth/token", { uid, email, name }),
  setRole: (uid, tipo_usuario) =>
    api.put(`/api/auth/role/${uid}`, { tipo_usuario }),
};

// ──────────────────────────────────────────────
// Usuarios
// ──────────────────────────────────────────────
export const usuariosApi = {
  getAll: () => api.get("/api/usuarios"),
  getById: (uid) => api.get(`/api/usuarios/${uid}`),
};

// ──────────────────────────────────────────────
// Herramientas
// ──────────────────────────────────────────────
export const herramientasApi = {
  getAll: (incluyeBaja = false) =>
    api.get("/api/herramientas", { params: { incluyeBaja } }),
  create: (data) => api.post("/api/herramientas", data),
  asignar: (id, data) => api.put(`/api/herramientas/${id}/asignar`, data),
  regresar: (id, data) => api.put(`/api/herramientas/${id}/regresar`, data),
  asignarMasivo: (data) => api.post("/api/herramientas/asignar-masivo", data),
  getLogs: () => api.get("/api/herramientas/logs"),
};

// ──────────────────────────────────────────────
// Materiales
// ──────────────────────────────────────────────
export const materialesApi = {
  getAll: () => api.get("/api/materiales"),
  create: (data) => api.post("/api/materiales", data),
  disponer: (data) => api.put("/api/materiales/disponer", data),
  getLogs: () => api.get("/api/materiales/logs"),
  getResumenMensual: () => api.get("/api/materiales/resumen-mensual"),
  parseFactura: (formData) =>
    api.post("/api/materiales/parse-factura", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    }),
};

// ──────────────────────────────────────────────
// Registro
// ──────────────────────────────────────────────
export const registroApi = {
  getAll: () => api.get("/api/registro"),
  create: (data) => api.post("/api/registro", data),
  update: (id, data) => api.put(`/api/registro/${id}`, data),
  getFederal: () => api.get("/api/registro/federal/list"),
  updateFederal: (id, data) => api.put(`/api/registro/federal/${id}`, data),
};

// ──────────────────────────────────────────────
// Folios
// ──────────────────────────────────────────────
export const foliosApi = {
  getLinea1Disponibles: () => api.get("/api/folios/linea1/disponibles"),
  getLinea2Disponibles: () => api.get("/api/folios/linea2/disponibles"),
  getLinea1: () => api.get("/api/folios/linea1"),
  getLinea2: () => api.get("/api/folios/linea2"),
};

// ──────────────────────────────────────────────
// Configuraciones
// ──────────────────────────────────────────────
export const configuracionesApi = {
  get: () => api.get("/api/configuraciones"),
  update: (data) => api.put("/api/configuraciones", data),
};

// ──────────────────────────────────────────────
// Asistencias / Nómina
// ──────────────────────────────────────────────
export const asistenciasApi = {
  // Kiosco (sin auth)
  getKiosco:       () => api.get("/api/asistencias/kiosco"),
  registrarEntrada:(uid) => api.post("/api/asistencias/entrada", { uid }),
  registrarSalida: (uid) => api.post("/api/asistencias/salida",  { uid }),

  // Empleados / sueldos (Admin)
  getEmpleados:    () => api.get("/api/asistencias/empleados"),
  updateSueldo:    (uid, data) => api.put(`/api/asistencias/empleados/${uid}`, data),

  // Historial
  getMis:          () => api.get("/api/asistencias/mis"),
  getTodas:        (desde, hasta) => api.get("/api/asistencias/todas", { params: { desde, hasta } }),

  // Nómina
  getNomina:       (semana) => api.get("/api/asistencias/nomina", { params: { semana } }),
  cerrarNomina:    (data)   => api.post("/api/asistencias/nomina/cerrar", data),
  getHistorialNomina: ()    => api.get("/api/asistencias/nomina/historial"),
};

export default api;
