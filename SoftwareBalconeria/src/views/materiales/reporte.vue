<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Logs de Materiales</h2>
        <p class="page-sub">Historial completo de movimientos de material</p>
      </div>
      <div class="badge-total">{{ logsFiltrados.length }} registros</div>
    </div>

    <!-- Resumen mensual por usuario -->
    <div class="table-card" style="margin-bottom:8px">
      <div class="resumen-header">
        <h3 class="resumen-title">Gasto Mensual por Usuario</h3>
        <select v-model="mesSeleccionado" class="field-input" style="width:auto;min-width:160px">
          <option value="">Todos los meses</option>
          <option v-for="m in mesesDisponibles" :key="m" :value="m">{{ formatearMes(m) }}</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Mes</th>
              <th>Piezas</th>
              <th>Total Gastado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in resumenFiltrado" :key="i">
              <td class="font-medium">{{ r.dispuesto_por }}</td>
              <td class="text-muted">{{ formatearMes(r.mes) }}</td>
              <td><span class="code-badge">{{ r.piezas }}</span></td>
              <td class="costo-cell">${{ Number(r.total).toFixed(2) }}</td>
            </tr>
            <tr v-if="resumenFiltrado.length === 0">
              <td colspan="4" class="empty-row">Sin movimientos con costo registrado</td>
            </tr>
            <tr v-if="resumenFiltrado.length > 0" class="total-row">
              <td colspan="3" style="text-align:right;font-weight:700">Total del período:</td>
              <td class="costo-cell" style="font-size:1rem">${{ totalPeriodo.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Log detallado -->
    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Material <input v-model="filtros.nombre" placeholder="Filtrar..." class="th-input" /></th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Dispuesto Por <input v-model="filtros.dispuestoPor" placeholder="Filtrar..." class="th-input" /></th>
              <th>Fecha Disposición</th>
              <th>Costo/Pieza</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(log, index) in logsFiltrados" :key="index">
              <td class="text-muted">{{ formatearFecha(log.fecha_log) }}</td>
              <td class="font-medium">{{ log.nombre || '—' }}</td>
              <td class="text-muted">{{ log.descripcion || '—' }}</td>
              <td><span class="code-badge">{{ log.unidad || '—' }}</span></td>
              <td>{{ log.dispuesto_por || '—' }}</td>
              <td class="text-muted">{{ formatearFecha(log.fecha_disposicion) }}</td>
              <td class="text-muted">${{ Number(log.costo_unitario || 0).toFixed(2) }}</td>
              <td class="costo-cell">${{ Number(log.costo_total || 0).toFixed(2) }}</td>
            </tr>
            <tr v-if="logsFiltrados.length === 0">
              <td colspan="8" class="empty-row">No hay movimientos registrados</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { materialesApi } from "@/service/api";

const logs = ref([]);
const resumen = ref([]);
const mesSeleccionado = ref("");

const filtros = ref({
  nombre: "",
  dispuestoPor: "",
});

const cargarDatos = async () => {
  try {
    const [logsRes, resumenRes] = await Promise.all([
      materialesApi.getLogs(),
      materialesApi.getResumenMensual(),
    ]);
    logs.value = logsRes.data;
    resumen.value = resumenRes.data;
  } catch (err) {
    console.error("Error al cargar logs de materiales:", err);
  }
};

const mesesDisponibles = computed(() => {
  const set = new Set(resumen.value.map(r => r.mes));
  return [...set].sort((a, b) => b.localeCompare(a));
});

const resumenFiltrado = computed(() => {
  if (!mesSeleccionado.value) return resumen.value;
  return resumen.value.filter(r => r.mes === mesSeleccionado.value);
});

const totalPeriodo = computed(() =>
  resumenFiltrado.value.reduce((sum, r) => sum + Number(r.total || 0), 0)
);

const logsFiltrados = computed(() => {
  return logs.value.filter(log => {
    const f = filtros.value;
    const match = (val, filtro) => !filtro || (val || "").toString().toLowerCase().includes(filtro.toLowerCase());
    return match(log.nombre, f.nombre) && match(log.dispuesto_por, f.dispuestoPor);
  });
});

const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  return new Date(fecha).toLocaleString("es-MX", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const formatearMes = (mes) => {
  if (!mes) return "";
  const [year, month] = mes.split("-");
  const nombres = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  return `${nombres[parseInt(month) - 1]} ${year}`;
};

onMounted(() => {
  cargarDatos();
});
</script>

<style scoped>
.resumen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.resumen-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #002a5e;
  margin: 0;
}
.costo-cell {
  font-weight: 600;
  color: #004AAD;
}
.total-row td {
  background: #f0f7ff;
  border-top: 2px solid #c7d2e0;
}
</style>
