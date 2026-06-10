<script setup>
import { ref } from "vue";
import { materialesApi } from "@/service/api";
import { useToast } from "primevue/usetoast";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";

const toast = useToast();
const nombre = ref("");
const descripcion = ref("");
const unidad = ref("");
const disponible = ref(true);
const cantidad = ref(1);

const unidadOpciones = [
  { label: "Tramo", value: "Tramo" },
  { label: "Pieza", value: "Pieza" },
  { label: "Kg", value: "Kg" }
];

const estadoOpciones = [
  { label: "Disponible", value: true },
  { label: "Consumido", value: false }
];

const guardarMaterial = async () => {
  if (!nombre.value || !descripcion.value || !unidad.value || cantidad.value < 1) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Completa todos los campos y asegúrate que la cantidad sea mayor a 0", life: 3000 });
    return;
  }

  try {
    await materialesApi.create({
      nombre: nombre.value,
      descripcion: descripcion.value,
      unidad: unidad.value,
      disponible: disponible.value,
      cantidad: cantidad.value,
    });

    toast.add({ severity: "success", summary: "Éxito", detail: `${cantidad.value} material(es) dado(s) de alta`, life: 3000 });

    nombre.value = "";
    descripcion.value = "";
    unidad.value = "";
    disponible.value = true;
    cantidad.value = 1;
  } catch (error) {
    console.error("Error al guardar material:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudo guardar el material", life: 3000 });
  }
};
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Alta de Materiales</h2>
        <p class="page-sub">Registra nuevos materiales en el inventario</p>
      </div>
    </div>

    <div class="form-card" style="max-width:580px">
      <div class="alta-grid">
        <div class="field-group">
          <label class="field-label">Nombre</label>
          <input v-model="nombre" type="text" class="field-input" placeholder="Ej: Varilla" />
        </div>
        <div class="field-group">
          <label class="field-label">Descripción</label>
          <input v-model="descripcion" type="text" class="field-input" placeholder="Descripción del material" />
        </div>
        <div class="field-group">
          <label class="field-label">Unidad</label>
          <Dropdown v-model="unidad" :options="unidadOpciones" optionLabel="label" optionValue="value" placeholder="Selecciona unidad" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Estado inicial</label>
          <Dropdown v-model="disponible" :options="estadoOpciones" optionLabel="label" optionValue="value" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Cantidad</label>
          <input v-model.number="cantidad" type="number" min="1" class="field-input" />
        </div>
      </div>

      <div style="margin-top:24px">
        <button class="erp-btn erp-btn-primary" style="width:100%;justify-content:center" @click="guardarMaterial">
          <i class="pi pi-check"></i> Guardar Material
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.alta-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
</style>
