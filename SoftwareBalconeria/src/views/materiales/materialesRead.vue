<script setup>
import { ref, onMounted, computed } from "vue";
import { materialesApi } from "@/service/api";
import { useToast } from "primevue/usetoast";
import Dropdown from "primevue/dropdown";

const toast = useToast();
const materiales = ref([]);

const filtros = ref({
  nombre: '',
  descripcion: '',
  unidad: '',
  estado: '',
  dispuestoPor: ''
});

const cargarMateriales = async () => {
  try {
    const { data } = await materialesApi.getAll();
    materiales.value = data;
  } catch (error) {
    console.error("Error al cargar materiales:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo cargar materiales", life: 3000 });
  }
};

const materialesFiltrados = computed(() => {
  return materiales.value.filter(m => {
    return (
      (m.nombre?.toLowerCase() || '').includes(filtros.value.nombre.toLowerCase()) &&
      (m.descripcion?.toLowerCase() || '').includes(filtros.value.descripcion.toLowerCase()) &&
      (m.unidad?.toLowerCase() || '').includes(filtros.value.unidad.toLowerCase()) &&
      (filtros.value.estado === '' ||
       (filtros.value.estado === 'disponible' && m.disponible) ||
       (filtros.value.estado === 'consumido' && !m.disponible)) &&
      (filtros.value.dispuestoPor === '' || (m.dispuesto_por || '').toLowerCase().includes(filtros.value.dispuestoPor.toLowerCase()))
    );
  });
});

onMounted(() => {
  cargarMateriales();
});
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Stock de Materiales</h2>
        <p class="page-sub">Consulta el inventario completo de materiales</p>
      </div>
      <div class="badge-total">{{ materialesFiltrados.length }} registros</div>
    </div>

    <!-- Filtros -->
    <div class="filtros-bar">
      <input type="text" v-model="filtros.nombre" placeholder="Nombre..." class="th-filter-input" />
      <input type="text" v-model="filtros.descripcion" placeholder="Descripción..." class="th-filter-input" />
      <input type="text" v-model="filtros.unidad" placeholder="Unidad..." class="th-filter-input" />
      <Dropdown v-model="filtros.estado" :options="['','disponible','consumido']" placeholder="Estado" class="filtro-dropdown" />
      <input type="text" v-model="filtros.dispuestoPor" placeholder="Dispuesto por..." class="th-filter-input" />
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Estado</th>
              <th>Fecha Disposición</th>
              <th>Dispuesto Por</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in materialesFiltrados" :key="m.id">
              <td class="font-medium">{{ m.nombre }}</td>
              <td class="text-muted">{{ m.descripcion }}</td>
              <td>{{ m.unidad }}</td>
              <td>
                <span :class="m.disponible ? 'badge-success' : 'badge-danger'">
                  {{ m.disponible ? 'Disponible' : 'Consumido' }}
                </span>
              </td>
              <td class="text-muted">{{ m.fecha_disposicion ? new Date(m.fecha_disposicion).toLocaleDateString('es-MX') : '—' }}</td>
              <td>{{ m.dispuesto_por || '—' }}</td>
            </tr>
            <tr v-if="materialesFiltrados.length === 0">
              <td colspan="6" class="empty-row">No se encontraron materiales</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filtros-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
}
.th-filter-input {
  flex: 1 1 150px;
  padding: 7px 11px;
  font-size: 0.85rem;
  border: 1.5px solid #dde3ec;
  border-radius: 6px;
  outline: none;
  font-family: inherit;
  color: #1e293b;
  background: #fafbff;
}
.th-filter-input:focus { border-color: #004AAD; box-shadow: 0 0 0 3px rgba(0,74,173,0.1); }
.filtro-dropdown { flex: 1 1 150px; }
</style>
