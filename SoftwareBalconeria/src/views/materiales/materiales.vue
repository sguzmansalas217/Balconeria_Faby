<script setup>
import { ref, onMounted, computed } from "vue";
import { materialesApi, usuariosApi } from "@/service/api";
import { useToast } from "primevue/usetoast";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";

const toast = useToast();
const materiales = ref([]);
const usuarios = ref([]);
const usuarioSeleccionado = ref(null);
const fechaAccion = ref(null);
const modalVisible = ref(false);
const seleccionados = ref([]);
const materialIndividual = ref(null);

const hoy = () => {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const filtros = ref({
  nombre: '',
  descripcion: '',
  unidad: '',
  estado: '',
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

const cargarUsuarios = async () => {
  try {
    const { data } = await usuariosApi.getAll();
    usuarios.value = data;
  } catch (error) {
    toast.add({ severity: "error", summary: "Error", detail: "No se pudieron cargar usuarios", life: 3000 });
  }
};

const materialesFiltrados = computed(() => {
  return materiales.value.filter(m => {
    return (
      (m.nombre?.toLowerCase() || '').includes(filtros.value.nombre.toLowerCase()) &&
      (m.descripcion?.toLowerCase() || '').includes(filtros.value.descripcion.toLowerCase()) &&
      (filtros.value.estado === '' ||
       (filtros.value.estado === 'disponible' && m.disponible) ||
       (filtros.value.estado === 'consumido' && !m.disponible))
    );
  });
});

const abrirModalMultiple = () => {
  if (seleccionados.value.length === 0) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Selecciona al menos un material disponible", life: 3000 });
    return;
  }
  usuarioSeleccionado.value = null;
  fechaAccion.value = hoy();
  materialIndividual.value = null;
  modalVisible.value = true;
};

const abrirModalIndividual = (material) => {
  if (!material.disponible) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Este material ya fue dispuesto", life: 3000 });
    return;
  }
  materialIndividual.value = material;
  usuarioSeleccionado.value = null;
  fechaAccion.value = hoy();
  modalVisible.value = true;
};

const disponerSeleccionados = async () => {
  if (!usuarioSeleccionado.value || !fechaAccion.value) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Selecciona usuario y fecha", life: 3000 });
    return;
  }

  const lista = materialIndividual.value ? [materialIndividual.value.id] : seleccionados.value;

  try {
    const { data } = await materialesApi.disponer({
      ids: lista,
      usuario: usuarioSeleccionado.value,
      fecha: fechaAccion.value,
    });

    toast.add({ severity: "success", summary: "Actualizado", detail: `${data.total} material(es) dispuesto(s)`, life: 3000 });

    // Actualizar estado local
    for (const id of lista) {
      const mat = materiales.value.find(m => m.id === id);
      if (mat) {
        mat.disponible = false;
        mat.dispuesto_por = usuarioSeleccionado.value;
        mat.fecha_disposicion = fechaAccion.value;
      }
    }

    seleccionados.value = [];
    materialIndividual.value = null;
    modalVisible.value = false;
  } catch (error) {
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo disponer los materiales", life: 3000 });
  }
};

const toggleSeleccionTodos = (event) => {
  if (event.target.checked) {
    seleccionados.value = materialesFiltrados.value.filter(m => m.disponible).map(m => m.id);
  } else {
    seleccionados.value = [];
  }
};

onMounted(() => {
  cargarMateriales();
  cargarUsuarios();
  fechaAccion.value = hoy();
});
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Disponer Materiales</h2>
        <p class="page-sub">Selecciona y dispone materiales del inventario</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div class="badge-total">{{ materialesFiltrados.length }} registros</div>
        <button class="erp-btn erp-btn-primary" @click="abrirModalMultiple" :disabled="seleccionados.length === 0" style="font-size:0.82rem;padding:7px 16px">
          <i class="pi pi-check-circle"></i> Disponer seleccionados ({{ seleccionados.length }})
        </button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filtros-bar">
      <input type="text" v-model="filtros.nombre" placeholder="Nombre..." class="th-filter-input" />
      <input type="text" v-model="filtros.descripcion" placeholder="Descripción..." class="th-filter-input" />
      <Dropdown v-model="filtros.estado" :options="['','disponible','consumido']" placeholder="Estado" class="filtro-dropdown" />
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th style="width:40px">
                <input type="checkbox"
                  :checked="seleccionados.length === materialesFiltrados.filter(m => m.disponible).length && materialesFiltrados.filter(m => m.disponible).length > 0"
                  @change="toggleSeleccionTodos($event)" style="accent-color:#FBB034;cursor:pointer" />
              </th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Estado</th>
              <th>Fecha Disposición</th>
              <th>Dispuesto Por</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in materialesFiltrados" :key="m.id">
              <td style="text-align:center">
                <input type="checkbox" :value="m.id" v-model="seleccionados" :disabled="!m.disponible" style="accent-color:#004AAD;cursor:pointer" />
              </td>
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
              <td>
                <button class="erp-btn erp-btn-primary" style="font-size:0.75rem;padding:5px 12px" @click="abrirModalIndividual(m)" :disabled="!m.disponible">
                  Disponer
                </button>
              </td>
            </tr>
            <tr v-if="materialesFiltrados.length === 0">
              <td colspan="8" class="empty-row">No se encontraron materiales</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal disponer -->
    <transition name="fade">
      <div v-if="modalVisible" class="modal-overlay" @click.self="modalVisible = false">
        <div class="modal-card">
          <h3 class="modal-title">Disponer Materiales</h3>
          <div class="modal-fields">
            <div class="field-group">
              <label class="field-label">Usuario</label>
              <Dropdown v-model="usuarioSeleccionado" :options="usuarios" optionLabel="name" optionValue="name" placeholder="Seleccionar usuario" class="w-full" />
            </div>
            <div class="field-group">
              <label class="field-label">Fecha Disposición</label>
              <input type="date" v-model="fechaAccion" class="field-input" />
            </div>
          </div>
          <div class="modal-btns">
            <button class="erp-btn erp-btn-secondary" @click="modalVisible = false">Cancelar</button>
            <button class="erp-btn erp-btn-primary" @click="disponerSeleccionados">Guardar</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.filtros-bar { display:flex; flex-wrap:wrap; gap:10px; background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:14px 16px; }
.th-filter-input { flex:1 1 150px; padding:7px 11px; font-size:0.85rem; border:1.5px solid #dde3ec; border-radius:6px; outline:none; font-family:inherit; color:#1e293b; background:#fafbff; }
.th-filter-input:focus { border-color:#004AAD; box-shadow:0 0 0 3px rgba(0,74,173,0.1); }
.filtro-dropdown { flex:1 1 150px; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,20,60,0.5); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
.modal-card { background:#fff; border-radius:12px; padding:28px; width:100%; max-width:400px; box-shadow:0 16px 48px rgba(0,0,0,0.18); }
.modal-title { font-size:1.1rem; font-weight:800; color:#002a5e; margin:0 0 20px; }
.modal-fields { display:flex; flex-direction:column; gap:14px; }
.modal-btns { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
.fade-enter-active,.fade-leave-active { transition:opacity 0.2s; }
.fade-enter-from,.fade-leave-to { opacity:0; }
</style>
