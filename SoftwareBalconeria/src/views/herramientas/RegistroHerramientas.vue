<script setup>
import { ref, onMounted, computed } from "vue";
import { herramientasApi, usuariosApi } from "@/service/api";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import Dropdown from "primevue/dropdown";
import InputText from "primevue/inputtext";
import Dialog from "primevue/dialog";
import Calendar from "primevue/calendar";

const toast = useToast();

const herramientas = ref([]);
const herramientaSeleccionada = ref(null);
const dialogVisible = ref(false);
const usuarios = ref([]);

const filtros = ref({
  nombre: "",
  codigo: "",
  marca: "",
  descripcion: "",
  disponible: "",
  usuarioAsignado: ""
});

const hoy = () => new Date();

const cargarUsuarios = async () => {
  const { data } = await usuariosApi.getAll();
  usuarios.value = data;
};

const cargarHerramientas = async () => {
  try {
    const { data } = await herramientasApi.getAll(false);
    herramientas.value = data.map(h => ({
      ...h,
      fecha_asignacion: h.fecha_asignacion ? new Date(h.fecha_asignacion) : null,
      fecha_retorno: h.fecha_retorno ? new Date(h.fecha_retorno) : null,
    }));
  } catch (error) {
    console.error("Error al cargar herramientas:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo cargar herramientas", life: 3000 });
  }
};

const herramientasFiltradas = computed(() => {
  return herramientas.value.filter(h => {
    return (
      h.nombre.toLowerCase().includes(filtros.value.nombre.toLowerCase()) &&
      h.codigo.toLowerCase().includes(filtros.value.codigo.toLowerCase()) &&
      h.marca.toLowerCase().includes(filtros.value.marca.toLowerCase()) &&
      h.descripcion.toLowerCase().includes(filtros.value.descripcion.toLowerCase()) &&
      (h.usuario_asignado || "-").toLowerCase().includes(filtros.value.usuarioAsignado.toLowerCase()) &&
      (h.disponible ? "disponible" : "no disponible").includes(filtros.value.disponible.toLowerCase())
    );
  });
});

const abrirDialog = (herramienta) => {
  herramientaSeleccionada.value = {
    ...herramienta,
    fecha_asignacion: herramienta.fecha_asignacion ? new Date(herramienta.fecha_asignacion) : hoy(),
    fecha_retorno: herramienta.fecha_retorno ? new Date(herramienta.fecha_retorno) : null,
  };
  dialogVisible.value = true;
};

const guardarCambios = async () => {
  if (!herramientaSeleccionada.value) return;
  const h = herramientaSeleccionada.value;

  try {
    if (h.disponible) {
      if (!h.usuario_asignado || !h.fecha_asignacion) {
        toast.add({ severity: "warn", summary: "Atención", detail: "Selecciona usuario y fecha de asignación", life: 3000 });
        return;
      }
      await herramientasApi.asignar(h.id, {
        usuario_asignado: h.usuario_asignado,
        fecha_asignacion: h.fecha_asignacion,
      });
    } else {
      if (!h.fecha_retorno) {
        toast.add({ severity: "warn", summary: "Atención", detail: "Selecciona fecha de retorno", life: 3000 });
        return;
      }
      await herramientasApi.regresar(h.id, { fecha_retorno: h.fecha_retorno });
    }

    toast.add({ severity: "success", summary: "Éxito", detail: "Herramienta actualizada", life: 3000 });
    dialogVisible.value = false;
    cargarHerramientas();
  } catch (error) {
    const msg = error.response?.data?.error || "No se pudo actualizar herramienta";
    toast.add({ severity: "error", summary: "Error", detail: msg, life: 3000 });
  }
};

const regresarHerramienta = async (herramienta) => {
  try {
    await herramientasApi.regresar(herramienta.id, {});
    toast.add({ severity: "success", summary: "Éxito", detail: "Herramienta regresada correctamente", life: 3000 });
    cargarHerramientas();
  } catch (error) {
    const msg = error.response?.data?.error || "No se pudo regresar herramienta";
    toast.add({ severity: "error", summary: "Error", detail: msg, life: 3000 });
  }
};

onMounted(() => {
  cargarHerramientas();
  cargarUsuarios();
});
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Asignación de Herramientas</h2>
        <p class="page-sub">Asigna o regresa herramientas a los trabajadores</p>
      </div>
      <div class="badge-total">{{ herramientasFiltradas.length }} registros</div>
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nombre <input v-model="filtros.nombre" placeholder="Filtrar..." class="th-input" /></th>
              <th>Código <input v-model="filtros.codigo" placeholder="Filtrar..." class="th-input" /></th>
              <th>Marca <input v-model="filtros.marca" placeholder="Filtrar..." class="th-input" /></th>
              <th>Descripción <input v-model="filtros.descripcion" placeholder="Filtrar..." class="th-input" /></th>
              <th>Estado <input v-model="filtros.disponible" placeholder="Filtrar..." class="th-input" /></th>
              <th>Usuario Asignado <input v-model="filtros.usuarioAsignado" placeholder="Filtrar..." class="th-input" /></th>
              <th>Fecha Asignación</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in herramientasFiltradas" :key="item.id">
              <td class="font-medium">{{ item.nombre }}</td>
              <td><span class="code-badge">{{ item.codigo }}</span></td>
              <td>{{ item.marca }}</td>
              <td class="text-muted">{{ item.descripcion }}</td>
              <td>
                <span :class="item.disponible ? 'badge-success' : 'badge-danger'">
                  {{ item.disponible ? 'Disponible' : 'No disponible' }}
                </span>
              </td>
              <td>{{ item.usuario_asignado || '—' }}</td>
              <td class="text-muted">{{ item.fecha_asignacion ? item.fecha_asignacion.toLocaleDateString('es-MX') : '—' }}</td>
              <td>
                <button v-if="item.disponible" class="erp-btn erp-btn-success" style="font-size:0.78rem;padding:6px 14px" @click="abrirDialog(item)">
                  <i class="pi pi-user-plus"></i> Asignar
                </button>
                <button v-else class="erp-btn erp-btn-danger" style="font-size:0.78rem;padding:6px 14px" @click="regresarHerramienta(item)">
                  <i class="pi pi-reply"></i> Regresar
                </button>
              </td>
            </tr>
            <tr v-if="herramientasFiltradas.length === 0">
              <td colspan="8" class="empty-row">No se encontraron herramientas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog v-model:visible="dialogVisible" header="Editar Herramienta" modal :style="{ width: '420px' }" :focusOnShow="false">
      <div v-if="herramientaSeleccionada" class="dialog-form">
        <div class="field-group">
          <label class="field-label">Nombre</label>
          <InputText v-model="herramientaSeleccionada.nombre" class="w-full" disabled />
        </div>
        <div class="field-group">
          <label class="field-label">Código</label>
          <InputText v-model="herramientaSeleccionada.codigo" class="w-full" disabled />
        </div>
        <template v-if="herramientaSeleccionada.disponible">
          <div class="field-group">
            <label class="field-label">Usuario Asignado</label>
            <Dropdown v-model="herramientaSeleccionada.usuario_asignado" :options="usuarios" optionLabel="name" optionValue="name" placeholder="Seleccionar usuario" class="w-full" />
          </div>
          <div class="field-group">
            <label class="field-label">Fecha de Asignación</label>
            <Calendar v-model="herramientaSeleccionada.fecha_asignacion" class="w-full" dateFormat="yy-mm-dd" :showTime="false" />
          </div>
        </template>
        <template v-else>
          <div class="field-group">
            <label class="field-label">Fecha de Retorno</label>
            <Calendar v-model="herramientaSeleccionada.fecha_retorno" class="w-full" dateFormat="yy-mm-dd" :showTime="false" />
          </div>
        </template>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" @click="guardarCambios" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.dialog-form { display: flex; flex-direction: column; gap: 16px; padding: 8px 0; }
</style>
