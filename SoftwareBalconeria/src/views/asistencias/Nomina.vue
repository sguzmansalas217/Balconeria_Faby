<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Nómina Semanal</h2>
        <p class="page-sub">Calcula y cierra el pago por semana</p>
      </div>
    </div>

    <!-- Selector de semana + sueldos -->
    <div class="top-controls">
      <div class="field-group" style="min-width:200px">
        <label class="field-label">Semana (selecciona cualquier día)</label>
        <input type="date" v-model="fechaSeleccionada" class="field-input" @change="cargarNomina" />
      </div>
      <button class="erp-btn erp-btn-secondary" @click="mostrarSueldos = !mostrarSueldos">
        <i class="pi pi-cog"></i> Configurar Sueldos
      </button>
    </div>

    <!-- Panel de sueldos -->
    <div v-if="mostrarSueldos" class="table-card" style="margin-bottom:8px">
      <h3 class="section-title">Sueldos por Empleado</h3>
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr><th>Empleado</th><th>Email</th><th>Sueldo/Día</th><th>Activo</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="emp in empleados" :key="emp.id">
              <td class="font-medium">{{ emp.name || '—' }}</td>
              <td class="text-muted">{{ emp.email }}</td>
              <td><input v-model.number="emp.sueldo_dia" type="number" min="0" step="10" class="field-input cell-input cell-qty" /></td>
              <td>
                <span :class="emp.activo ? 'badge-success' : 'badge-danger'" class="cursor-pointer"
                  @click="emp.activo = !emp.activo" style="cursor:pointer">
                  {{ emp.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <button class="erp-btn erp-btn-primary" style="padding:5px 14px" @click="guardarSueldo(emp)">
                  <i class="pi pi-save"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Nómina de la semana -->
    <div v-if="nomina" class="table-card">
      <div class="nomina-header">
        <h3 class="section-title">
          Semana del {{ formatFecha(nomina.lunes) }} al {{ formatFecha(nomina.domingo) }}
        </h3>
        <button class="erp-btn erp-btn-primary" @click="cerrarNomina" :disabled="cerrando || nominaCerrada">
          <i :class="cerrando ? 'pi pi-spin pi-spinner' : 'pi pi-lock'"></i>
          {{ nominaCerrada ? 'Nómina Cerrada' : 'Cerrar y Pagar' }}
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Empleado</th>
              <th>Días</th>
              <th>Horas</th>
              <th>Sueldo/Día</th>
              <th>Subtotal</th>
              <th>Bono</th>
              <th>Total</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in nomina.nomina" :key="e.uid">
              <td class="font-medium">{{ e.name }}</td>
              <td class="text-muted">{{ e.dias_trabajados }}</td>
              <td class="text-muted">{{ Number(e.horas_totales).toFixed(1) }}h</td>
              <td class="text-muted">${{ Number(e.sueldo_dia).toFixed(2) }}</td>
              <td>${{ Number(e.subtotal).toFixed(2) }}</td>
              <td>
                <input v-model.number="e.bono" type="number" min="0" step="50"
                  class="field-input cell-input cell-qty"
                  :disabled="nominaCerrada"
                  @input="recalcular(e)" />
              </td>
              <td class="costo-cell">${{ calcTotal(e).toFixed(2) }}</td>
              <td>
                <input v-model="e.notas" class="field-input cell-input" placeholder="Nota..." :disabled="nominaCerrada" />
              </td>
            </tr>
            <tr class="total-row">
              <td colspan="6" style="text-align:right;font-weight:700">Total a pagar:</td>
              <td class="costo-cell" style="font-size:1rem">${{ totalSemana.toFixed(2) }}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Historial de nóminas -->
    <div class="table-card" style="margin-top:8px">
      <h3 class="section-title">Historial de Nóminas Pagadas</h3>
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr><th>Empleado</th><th>Semana</th><th>Días</th><th>Horas</th><th>Bono</th><th>Total</th><th>Notas</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in historial" :key="p.id">
              <td class="font-medium">{{ p.name }}</td>
              <td class="text-muted">{{ formatFecha(p.semana_inicio) }} – {{ formatFecha(p.semana_fin) }}</td>
              <td class="text-muted">{{ p.dias_trabajados }}</td>
              <td class="text-muted">{{ Number(p.horas_totales).toFixed(1) }}h</td>
              <td>${{ Number(p.bono).toFixed(2) }}</td>
              <td class="costo-cell">${{ Number(p.total).toFixed(2) }}</td>
              <td class="text-muted">{{ p.notas || '—' }}</td>
            </tr>
            <tr v-if="historial.length === 0">
              <td colspan="7" class="empty-row">Sin nóminas cerradas aún</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { asistenciasApi } from "@/service/api";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const fechaSeleccionada = ref(new Date().toISOString().split("T")[0]);
const nomina      = ref(null);
const empleados   = ref([]);
const historial   = ref([]);
const mostrarSueldos = ref(false);
const cerrando    = ref(false);
const nominaCerrada = ref(false);

const calcTotal = (e) => Number(e.subtotal || 0) + Number(e.bono || 0);

const totalSemana = computed(() =>
  (nomina.value?.nomina || []).reduce((s, e) => s + calcTotal(e), 0)
);

const cargarNomina = async () => {
  try {
    const { data } = await asistenciasApi.getNomina(fechaSeleccionada.value);
    nomina.value = data;
    nominaCerrada.value = data.nomina.every(e => e.pagado);
  } catch (e) {
    console.error(e);
  }
};

const cargarEmpleados = async () => {
  const { data } = await asistenciasApi.getEmpleados();
  empleados.value = data;
};

const cargarHistorial = async () => {
  const { data } = await asistenciasApi.getHistorialNomina();
  historial.value = data;
};

const guardarSueldo = async (emp) => {
  try {
    await asistenciasApi.updateSueldo(emp.id, { sueldo_dia: emp.sueldo_dia, activo: emp.activo });
    toast.add({ severity: "success", summary: "Guardado", detail: `Sueldo de ${emp.name} actualizado`, life: 2500 });
    await cargarNomina();
  } catch (e) {
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo guardar", life: 3000 });
  }
};

const cerrarNomina = async () => {
  cerrando.value = true;
  try {
    const empleadosPayload = nomina.value.nomina.map(e => ({
      uid: e.uid,
      dias_trabajados: e.dias_trabajados,
      horas_totales: e.horas_totales,
      sueldo_dia: e.sueldo_dia,
      subtotal: e.subtotal,
      bono: e.bono || 0,
      total: calcTotal(e),
      notas: e.notas || "",
    }));
    await asistenciasApi.cerrarNomina({
      semana_inicio: nomina.value.lunes,
      semana_fin: nomina.value.domingo,
      empleados: empleadosPayload,
    });
    toast.add({ severity: "success", summary: "Nómina cerrada", detail: `Total: $${totalSemana.value.toFixed(2)}`, life: 4000 });
    nominaCerrada.value = true;
    await cargarHistorial();
  } catch (e) {
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo cerrar la nómina", life: 3000 });
  } finally {
    cerrando.value = false;
  }
};

const formatFecha = (f) => f ? new Date(f + "T12:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "";

onMounted(() => {
  cargarNomina();
  cargarEmpleados();
  cargarHistorial();
});
</script>

<style scoped>
.top-controls {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.nomina-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
}
.section-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #002a5e;
  margin: 0 0 12px;
}
.costo-cell { font-weight: 700; color: #004AAD; }
.total-row td { background: #f0f7ff; border-top: 2px solid #c7d2e0; }
.cell-input { min-width: 80px; padding: 5px 8px; font-size: 0.82rem; }
.cell-qty   { width: 90px; min-width: 70px; }
.cursor-pointer { cursor: pointer; }
</style>
