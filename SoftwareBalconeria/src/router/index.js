import { createRouter, createWebHistory } from "vue-router";

import AppLayout from "@/layout/AppLayout.vue";
import Dashboard from "@/views/Dashboard.vue";
import Landing from "@/views/Landing.vue";
import Login from "@/views/pages/auth/Login.vue";

function getRole() {
  try {
    const token = localStorage.getItem("jwt_token");
    if (!token) return null;
    return JSON.parse(atob(token.split(".")[1])).tipo_usuario || "User";
  } catch {
    return null;
  }
}

const routes = [
  {
    path: "/",
    name: "landing",
    component: Landing,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/kiosco",
    name: "kiosco",
    component: () => import("@/views/kiosco/Kiosco.vue"),
  },
  {
    path: "/sistema/",
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "", name: "dashboard", component: Dashboard },
      { path: "uikit/input", name: "input", component: () => import("@/views/uikit/InputDoc.vue") },

      // ── Materiales: Usuario solo ve el stock ──
      { path: "materiales/materialesRead", name: "materialesRead", component: () => import("@/views/materiales/materialesRead.vue") },

      // ── Materiales: solo Admin ──
      { path: "materiales/materiales",   name: "materiales",  meta: { requiresAdmin: true }, component: () => import("@/views/materiales/materiales.vue") },
      { path: "materiales/movimientos",  name: "movimientos", meta: { requiresAdmin: true }, component: () => import("@/views/materiales/movimientos.vue") },
      { path: "materiales/reporte",        name: "reporte",        meta: { requiresAdmin: true }, component: () => import("@/views/materiales/reporte.vue") },
      { path: "materiales/importarFactura", name: "importarFactura", meta: { requiresAdmin: true }, component: () => import("@/views/materiales/importarFactura.vue") },

      // ── Herramientas: Usuario solo ve la tabla ──
      { path: "herramientas/TablaHerramienta", name: "TablaHerramienta", component: () => import("@/views/herramientas/TablaHerramienta.vue") },

      // ── Herramientas: solo Admin ──
      { path: "herramientas/AsignarAllHerramienta", name: "AsignarAllHerramienta", meta: { requiresAdmin: true }, component: () => import("@/views/herramientas/AsignarAllHerramienta.vue") },
      { path: "herramientas/RegistroHerramientas",  name: "RegistroHerramientas",  meta: { requiresAdmin: true }, component: () => import("@/views/herramientas/RegistroHerramientas.vue") },
      { path: "herramientas/logsHerramientas",      name: "logsHerramientas",      meta: { requiresAdmin: true }, component: () => import("@/views/herramientas/logsHerramientas.vue") },

      // ── Tablas y Folios: solo Admin ──
      { path: "uikit/table",        name: "table",        meta: { requiresAdmin: true }, component: () => import("@/views/uikit/TableDoc.vue") },
      { path: "uikit/tableFed",     name: "tableFed",     meta: { requiresAdmin: true }, component: () => import("@/views/uikit/TableDocFed.vue") },
      { path: "uikit/TablaFolios",  name: "TablaFolios",  meta: { requiresAdmin: true }, component: () => import("@/views/uikit/TablaFolios.vue") },
      { path: "uikit/TablaFoliosL2",name: "TablaFoliosL2",meta: { requiresAdmin: true }, component: () => import("@/views/uikit/TablaFoliosL2.vue") },

      // ── Configuraciones: solo Admin ──
      { path: "Configuraciones/AlertasConfig",  name: "AlertasConfig",  meta: { requiresAdmin: true }, component: () => import("@/views/Configuraciones/AlertasConfig.vue") },
      { path: "Configuraciones/Herramientas",   name: "Herramientas",   meta: { requiresAdmin: true }, component: () => import("@/views/Configuraciones/Herramientas.vue") },
      { path: "Configuraciones/AltaHerramienta",name: "AltaHerramienta",meta: { requiresAdmin: true }, component: () => import("@/views/Configuraciones/AltaHerramienta.vue") },
      { path: "Configuraciones/RegistroUsuario",name: "RegistroUsuario",meta: { requiresAdmin: true }, component: () => import("@/views/Configuraciones/RegistroUsuario.vue") },
      { path: "Configuraciones/Whatsapp",       name: "Whatsapp",       meta: { requiresAdmin: true }, component: () => import("@/views/Configuraciones/Whatsapp.vue") },

      // ── Asistencias ──
      { path: "asistencias/mi-asistencia", name: "miAsistencia", component: () => import("@/views/asistencias/MiAsistencia.vue") },
      { path: "asistencias/nomina",        name: "nomina",        meta: { requiresAdmin: true }, component: () => import("@/views/asistencias/Nomina.vue") },
    ],
  },
  {
    path: "/:catchAll(.*)",
    name: "notfound",
    component: () => import("@/views/pages/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory("/"),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("jwt_token");
  const isAuthenticated = !!token;

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }

  if (to.meta.requiresAdmin && getRole() !== "Admin") {
    return next({ name: "dashboard" });
  }

  return next();
});

export default router;
