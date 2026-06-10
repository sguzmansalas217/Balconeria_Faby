<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Historial de Herramientas</h2>
        <p class="page-sub">Registro completo de asignaciones y retornos</p>
      </div>
      <div class="badge-total">{{ logsFiltrados.length }} registros</div>
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Acción <input v-model="filtros.accion" placeholder="Filtrar..." class="th-input" /></th>
              <th>Código <input v-model="filtros.codigo" placeholder="Filtrar..." class="th-input" /></th>
              <th>Nombre <input v-model="filtros.nombre" placeholder="Filtrar..." class="th-input" /></th>
              <th>Descripción <input v-model="filtros.descripcion" placeholder="Filtrar..." class="th-input" /></th>
              <th>Marca <input v-model="filtros.marca" placeholder="Filtrar..." class="th-input" /></th>
              <th>Usuario Asignado <input v-model="filtros.usuarioAsignado" placeholder="Filtrar..." class="th-input" /></th>
              <th>Realizado Por <input v-model="filtros.realizadoPor" placeholder="Filtrar..." class="th-input" /></th>
              <th>Disponible <input v-model="filtros.disponible" placeholder="Filtrar..." class="th-input" /></th>
              <th>F. Asignación</th>
              <th>F. Retorno</th>
              <th>F. Regreso</th>
              <th>F. Log</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in logsFiltrados" :key="index">
              <td>
                <span :class="log.accion === 'asignacion' ? 'badge-success' : 'badge-warning'">
                  {{ log.accion || '—' }}
                </span>
              </td>
              <td><span class="code-badge">{{ log.codigo || '—' }}</span></td>
              <td class="font-medium">{{ log.nombre || '—' }}</td>
              <td class="text-muted">{{ log.descripcion || '—' }}</td>
              <td>{{ log.marca || '—' }}</td>
              <td>{{ log.usuario_asignado || '—' }}</td>
              <td>{{ log.realizado_por || '—' }}</td>
              <td>
                <span :class="log.disponible ? 'badge-success' : 'badge-danger'">
                  {{ log.disponible ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="text-muted">{{ formatearFecha(log.fecha_asignacion) }}</td>
              <td class="text-muted">{{ formatearFecha(log.fecha_retorno) }}</td>
              <td class="text-muted">{{ formatearFecha(log.fecha_regreso) }}</td>
              <td class="text-muted">{{ formatearFecha(log.fecha_log) }}</td>
            </tr>
            <tr v-if="logsFiltrados.length === 0">
              <td colspan="12" class="empty-row">No se encontraron registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { herramientasApi } from "@/service/api";
import InputText from "primevue/inputtext";

const logs = ref([]);

const filtros = ref({
  accion: "",
  codigo: "",
  nombre: "",
  descripcion: "",
  marca: "",
  usuarioAsignado: "",
  realizadoPor: "",
  disponible: "",
});

const cargarLogs = async () => {
  try {
    const { data } = await herramientasApi.getLogs();
    logs.value = data.map(log => ({
      ...log,
      fecha_asignacion: log.fecha_asignacion ? new Date(log.fecha_asignacion) : null,
      fecha_retorno: log.fecha_retorno ? new Date(log.fecha_retorno) : null,
      fecha_regreso: log.fecha_regreso ? new Date(log.fecha_regreso) : null,
      fecha_log: log.fecha_log ? new Date(log.fecha_log) : null,
      disponible: log.disponible ?? false,
    }));
  } catch (err) {
    console.error("Error al cargar historial de herramientas:", err);
  }
};

const logsFiltrados = computed(() => {
  return logs.value.filter(log => {
    const f = filtros.value;
    const match = (val, filtro) => {
      if (!filtro) return true;
      if (typeof val === "boolean") return (val ? "sí" : "no").includes(filtro.toLowerCase());
      return (val || "").toString().toLowerCase().includes(filtro.toLowerCase());
    };
    return (
      match(log.accion, f.accion) &&
      match(log.codigo, f.codigo) &&
      match(log.nombre, f.nombre) &&
      match(log.descripcion, f.descripcion) &&
      match(log.marca, f.marca) &&
      match(log.usuario_asignado, f.usuarioAsignado) &&
      match(log.realizado_por, f.realizadoPor) &&
      match(log.disponible, f.disponible)
    );
  });
});

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

onMounted(() => {
  cargarLogs();
});
</script>
