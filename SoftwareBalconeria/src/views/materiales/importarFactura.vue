<script setup>
import { ref, computed } from "vue";
import { materialesApi } from "@/service/api";
import { useToast } from "primevue/usetoast";
import Dropdown from "primevue/dropdown";

const toast = useToast();

const paso = ref(1); // 1 = upload, 2 = confirmación
const archivoRef = ref(null);
const archivoNombre = ref("");
const cargando = ref(false);
const guardando = ref(false);

const unidadOpciones = [
  { label: "Kg",     value: "Kg" },
  { label: "Pieza",  value: "Pieza" },
  { label: "Tramo",  value: "Tramo" },
  { label: "Metro",  value: "Metro" },
  { label: "Litro",  value: "Litro" },
  { label: "Caja",   value: "Caja" },
];

const items = ref([]);

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  archivoRef.value = file;
  archivoNombre.value = file.name;
};

const onDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (!file || file.type !== "application/pdf") {
    toast.add({ severity: "warn", summary: "Formato inválido", detail: "Solo se aceptan archivos PDF", life: 3000 });
    return;
  }
  archivoRef.value = file;
  archivoNombre.value = file.name;
};

const abrirSelector = () => {
  document.getElementById("pdf-input").click();
};

const analizar = async () => {
  if (!archivoRef.value) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Selecciona un archivo PDF primero", life: 3000 });
    return;
  }
  cargando.value = true;
  try {
    const fd = new FormData();
    fd.append("factura", archivoRef.value);
    const { data } = await materialesApi.parseFactura(fd);
    items.value = data.map((it, i) => ({ ...it, _id: i }));
    paso.value = 2;
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "Error", detail: err.response?.data?.error || "No se pudo procesar el PDF", life: 4000 });
  } finally {
    cargando.value = false;
  }
};

const totalFactura = computed(() =>
  items.value.reduce((sum, it) => sum + (it.costo_unitario || 0) * (it.cantidad || 0), 0)
);

const agregarFila = () => {
  items.value.push({ _id: Date.now(), nombre: "", descripcion: "", unidad: "Pieza", cantidad: 1, costo_unitario: 0, disponible: true });
};

const eliminarFila = (id) => {
  items.value = items.value.filter(it => it._id !== id);
};

const darDeAlta = async () => {
  const invalidos = items.value.filter(it => !it.nombre || !it.unidad || it.cantidad < 1);
  if (invalidos.length) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Completa nombre, unidad y cantidad en todas las filas", life: 3000 });
    return;
  }
  guardando.value = true;
  let total = 0;
  try {
    for (const it of items.value) {
      await materialesApi.create({
        nombre: it.nombre,
        descripcion: it.descripcion,
        unidad: it.unidad,
        disponible: it.disponible ?? true,
        cantidad: it.cantidad,
        costo_unitario: it.costo_unitario || 0,
      });
      total += Number(it.cantidad);
    }
    toast.add({ severity: "success", summary: "Éxito", detail: `${total} material(es) dados de alta correctamente`, life: 4000 });
    resetear();
  } catch (err) {
    console.error(err);
    toast.add({ severity: "error", summary: "Error", detail: "Ocurrió un error al guardar los materiales", life: 4000 });
  } finally {
    guardando.value = false;
  }
};

const resetear = () => {
  paso.value = 1;
  archivoRef.value = null;
  archivoNombre.value = "";
  items.value = [];
};
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Importar desde Factura</h2>
        <p class="page-sub">Sube una nota o factura PDF y la IA extrae los materiales automáticamente</p>
      </div>
      <div v-if="paso === 2" class="badge-total">{{ items.length }} artículo(s)</div>
    </div>

    <!-- PASO 1: UPLOAD -->
    <div v-if="paso === 1" class="form-card" style="max-width:560px">
      <input id="pdf-input" type="file" accept=".pdf" style="display:none" @change="onFileChange" />

      <div
        class="drop-zone"
        @click="abrirSelector"
        @dragover.prevent
        @drop.prevent="onDrop"
        :class="{ 'drop-zone--active': archivoNombre }"
      >
        <i class="pi pi-file-pdf drop-icon"></i>
        <p class="drop-title">{{ archivoNombre || 'Arrastra tu PDF aquí o haz clic para seleccionar' }}</p>
        <p class="drop-sub">Solo archivos .pdf · Máx 10 MB</p>
      </div>

      <button
        class="erp-btn erp-btn-primary"
        style="width:100%;justify-content:center;margin-top:20px"
        @click="analizar"
        :disabled="cargando"
      >
        <i :class="cargando ? 'pi pi-spin pi-spinner' : 'pi pi-search'"></i>
        {{ cargando ? 'Analizando con IA...' : 'Analizar Factura' }}
      </button>
    </div>

    <!-- PASO 2: TABLA CONFIRMACIÓN -->
    <div v-if="paso === 2">
      <div class="table-actions">
        <button class="erp-btn erp-btn-secondary" @click="resetear">
          <i class="pi pi-arrow-left"></i> Volver
        </button>
        <button class="erp-btn erp-btn-secondary" @click="agregarFila">
          <i class="pi pi-plus"></i> Agregar fila
        </button>
        <button
          class="erp-btn erp-btn-primary"
          @click="darDeAlta"
          :disabled="guardando || items.length === 0"
        >
          <i :class="guardando ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
          {{ guardando ? 'Guardando...' : 'Dar de Alta' }}
        </button>
      </div>

      <div class="table-card">
        <div class="overflow-x-auto">
          <table class="erp-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Unidad</th>
                <th>Cantidad</th>
                <th>Costo/Pieza</th>
                <th>Total</th>
                <th>Disponible</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="it in items" :key="it._id">
                <td>
                  <input v-model="it.nombre" class="field-input cell-input" placeholder="Nombre" />
                </td>
                <td>
                  <input v-model="it.descripcion" class="field-input cell-input" placeholder="Descripción" />
                </td>
                <td style="min-width:130px">
                  <Dropdown
                    v-model="it.unidad"
                    :options="unidadOpciones"
                    optionLabel="label"
                    optionValue="value"
                    class="w-full"
                  />
                </td>
                <td>
                  <input v-model.number="it.cantidad" type="number" min="1" class="field-input cell-input cell-qty" />
                </td>
                <td>
                  <input v-model.number="it.costo_unitario" type="number" min="0" step="0.01" class="field-input cell-input cell-qty" placeholder="0.00" />
                </td>
                <td class="text-muted" style="white-space:nowrap">
                  ${{ ((it.costo_unitario || 0) * (it.cantidad || 0)).toFixed(2) }}
                </td>
                <td>
                  <span
                    class="badge-toggle"
                    :class="it.disponible ? 'badge-success' : 'badge-danger'"
                    @click="it.disponible = !it.disponible"
                    style="cursor:pointer"
                  >
                    {{ it.disponible ? 'Disponible' : 'Consumido' }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon-danger" @click="eliminarFila(it._id)" title="Eliminar">
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
              <tr v-if="items.length === 0">
                <td colspan="8" class="empty-row">No hay artículos. Agrega una fila manualmente.</td>
              </tr>
              <tr v-if="items.length > 0" class="total-row">
                <td colspan="5" style="text-align:right;font-weight:700;padding-right:12px">Total factura:</td>
                <td style="font-weight:700;color:#004AAD">${{ totalFactura.toFixed(2) }}</td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed #c7d2e0;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  background: #f8fafc;
}
.drop-zone:hover,
.drop-zone--active {
  border-color: #004AAD;
  background: #eef4ff;
}
.drop-icon {
  font-size: 2.4rem;
  color: #004AAD;
  margin-bottom: 12px;
}
.drop-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px;
  word-break: break-all;
}
.drop-sub {
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.cell-input {
  min-width: 120px;
  padding: 5px 8px;
  font-size: 0.82rem;
}
.cell-qty {
  width: 80px;
  min-width: 60px;
}

.badge-toggle {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  user-select: none;
}

.btn-icon-danger {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.15s;
}
.btn-icon-danger:hover {
  background: #fee2e2;
}
</style>
