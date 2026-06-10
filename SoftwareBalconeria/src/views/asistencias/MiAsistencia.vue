<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Mi Asistencia</h2>
        <p class="page-sub">Historial de entradas y salidas</p>
      </div>
      <div class="badge-total">{{ asistencias.length }} registros</div>
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Horas</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in asistencias" :key="a.id">
              <td class="font-medium">{{ formatFecha(a.fecha) }}</td>
              <td class="text-muted">{{ formatHora(a.hora_entrada) }}</td>
              <td class="text-muted">{{ formatHora(a.hora_salida) }}</td>
              <td>
                <span v-if="a.horas_trabajadas" class="code-badge">
                  {{ Number(a.horas_trabajadas).toFixed(1) }}h
                </span>
                <span v-else class="text-muted">—</span>
              </td>
              <td>
                <span v-if="!a.hora_entrada" class="badge-danger">Sin registro</span>
                <span v-else-if="!a.hora_salida" class="badge-warning">En turno</span>
                <span v-else class="badge-success">Completo</span>
              </td>
            </tr>
            <tr v-if="asistencias.length === 0">
              <td colspan="5" class="empty-row">Sin registros de asistencia</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Resumen del mes -->
    <div class="form-card" style="max-width:420px;margin-top:8px">
      <h3 style="font-size:0.95rem;font-weight:700;color:#002a5e;margin:0 0 14px">Resumen del mes actual</h3>
      <div class="resumen-grid">
        <div class="resumen-item">
          <span class="resumen-num">{{ diasMes }}</span>
          <span class="resumen-label">Días asistidos</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-num">{{ horasMes.toFixed(1) }}h</span>
          <span class="resumen-label">Horas trabajadas</span>
        </div>
        <div class="resumen-item">
          <span class="resumen-num">{{ promedio.toFixed(1) }}h</span>
          <span class="resumen-label">Promedio/día</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { asistenciasApi } from "@/service/api";

const asistencias = ref([]);

const cargar = async () => {
  try {
    const { data } = await asistenciasApi.getMis();
    asistencias.value = data;
  } catch (e) {
    console.error(e);
  }
};

const mesActual = new Date().getMonth();
const anioActual = new Date().getFullYear();

const delMes = computed(() =>
  asistencias.value.filter(a => {
    const d = new Date(a.fecha);
    return d.getMonth() === mesActual && d.getFullYear() === anioActual;
  })
);

const diasMes   = computed(() => delMes.value.filter(a => a.hora_salida).length);
const horasMes  = computed(() => delMes.value.reduce((s, a) => s + Number(a.horas_trabajadas || 0), 0));
const promedio  = computed(() => diasMes.value > 0 ? horasMes.value / diasMes.value : 0);

const formatFecha = (f) => f ? new Date(f + "T12:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" }) : "—";
const formatHora  = (ts) => ts ? new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—";

onMounted(cargar);
</script>

<style scoped>
.resumen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.resumen-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f0f7ff;
  border-radius: 10px;
  padding: 14px 8px;
}
.resumen-num   { font-size: 1.4rem; font-weight: 800; color: #004AAD; }
.resumen-label { font-size: 0.75rem; color: #64748b; margin-top: 4px; text-align: center; }
</style>
