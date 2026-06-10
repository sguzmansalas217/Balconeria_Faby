<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase";
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const herramientas = ref([]);
const herramientaSeleccionada = ref(null);
const dialogVisible = ref(false);

// Cargar todas las herramientas
const cargarHerramientas = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "herramientas"));
    herramientas.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error al cargar herramientas:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudieron cargar las herramientas", life: 3000 });
  }
};

// Abrir diálogo para editar herramienta
const abrirDialog = (herramienta) => {
  herramientaSeleccionada.value = { ...herramienta }; // clonar para edición
  dialogVisible.value = true;
};

// Guardar cambios
const guardarCambios = async () => {
  if (!herramientaSeleccionada.value) return;

  if (!herramientaSeleccionada.value.nombre || !herramientaSeleccionada.value.codigo || !herramientaSeleccionada.value.descripcion || !herramientaSeleccionada.value.marca) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Todos los campos son obligatorios", life: 3000 });
    return;
  }

  try {
    const refHerramienta = doc(db, "herramientas", herramientaSeleccionada.value.id);
    await updateDoc(refHerramienta, {
      nombre: herramientaSeleccionada.value.nombre,
      codigo: herramientaSeleccionada.value.codigo,
      marca: herramientaSeleccionada.value.marca,
      descripcion: herramientaSeleccionada.value.descripcion,
      dadaDeBaja: herramientaSeleccionada.value.dadaDeBaja || false,
      disponible: herramientaSeleccionada.value.disponible !== undefined ? herramientaSeleccionada.value.disponible : true,
      fechaRegistro: herramientaSeleccionada.value.fechaRegistro || serverTimestamp()
    });

    toast.add({ severity: "success", summary: "Éxito", detail: "Herramienta actualizada", life: 3000 });
    dialogVisible.value = false;
    cargarHerramientas();
  } catch (error) {
    console.error("Error al actualizar herramienta:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo actualizar la herramienta", life: 3000 });
  }
};

onMounted(() => {
  cargarHerramientas();
});
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Editar Herramientas</h2>
        <p class="page-sub">Haz clic en una fila para editar sus datos</p>
      </div>
      <div class="badge-total">{{ herramientas.length }} registros</div>
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Código</th>
              <th>Marca</th>
              <th>Descripción</th>
              <th>Disponible</th>
              <th>Baja</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="herramienta in herramientas" :key="herramienta.id"
                @click="abrirDialog(herramienta)" style="cursor:pointer">
              <td class="font-medium">{{ herramienta.nombre }}</td>
              <td><span class="code-badge">{{ herramienta.codigo }}</span></td>
              <td>{{ herramienta.marca }}</td>
              <td class="text-muted">{{ herramienta.descripcion }}</td>
              <td>
                <span :class="herramienta.disponible ? 'badge-success' : 'badge-danger'">
                  {{ herramienta.disponible ? 'Sí' : 'No' }}
                </span>
              </td>
              <td>
                <span :class="herramienta.dadaDeBaja ? 'badge-danger' : 'badge-info'">
                  {{ herramienta.dadaDeBaja ? 'Sí' : 'No' }}
                </span>
              </td>
            </tr>
            <tr v-if="herramientas.length === 0">
              <td colspan="6" class="empty-row">No hay herramientas registradas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Dialog v-model:visible="dialogVisible" header="Editar Herramienta" modal :style="{ width: '420px' }">
      <div v-if="herramientaSeleccionada" class="dialog-form">
        <div class="field-group">
          <label class="field-label">Nombre</label>
          <InputText v-model="herramientaSeleccionada.nombre" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Código</label>
          <InputText v-model="herramientaSeleccionada.codigo" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Marca</label>
          <InputText v-model="herramientaSeleccionada.marca" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Descripción</label>
          <InputText v-model="herramientaSeleccionada.descripcion" class="w-full" />
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:4px">
          <Checkbox v-model="herramientaSeleccionada.dadaDeBaja" inputId="dadaDeBajaDialog" />
          <label for="dadaDeBajaDialog" class="field-label" style="text-transform:none;font-size:0.88rem">Dada de Baja</label>
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="dialogVisible = false" />
        <Button label="Guardar" icon="pi pi-check" @click="guardarCambios" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.dialog-form { display:flex; flex-direction:column; gap:14px; padding:8px 0; }
</style>
