<script setup>
import { ref } from "vue";
import { herramientasApi } from "@/service/api";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const herramienta = ref({
  nombre: "",
  codigo: "",
  marca: "",
  descripcion: "",
  disponible: true,
  dado_de_baja: false,
});

const mensaje = ref("");

const limpiarCampos = () => {
  herramienta.value = {
    nombre: "",
    codigo: "",
    marca: "",
    descripcion: "",
    disponible: true,
    dado_de_baja: false,
  };
  mensaje.value = "";
};

const guardarHerramienta = async () => {
  if (!herramienta.value.nombre || !herramienta.value.codigo || !herramienta.value.marca || !herramienta.value.descripcion) {
    mensaje.value = "Todos los campos son obligatorios";
    toast.add({ severity: "error", summary: "Error", detail: mensaje.value, life: 3000 });
    return;
  }

  try {
    await herramientasApi.create(herramienta.value);
    mensaje.value = "Herramienta registrada con éxito";
    toast.add({ severity: "success", summary: "Éxito", detail: mensaje.value, life: 3000 });
    limpiarCampos();
  } catch (error) {
    const msg = error.response?.data?.error || "Error al guardar la herramienta";
    mensaje.value = msg;
    toast.add({ severity: "error", summary: "Error", detail: msg, life: 3000 });
  }
};
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Alta de Herramienta</h2>
        <p class="page-sub">Registra una nueva herramienta en el sistema</p>
      </div>
    </div>

    <div class="form-card" style="max-width: 640px;">
      <div class="alta-grid">
        <div class="field-group">
          <label class="field-label">Nombre</label>
          <InputText v-model="herramienta.nombre" placeholder="Ej: Taladro" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Código</label>
          <InputText v-model="herramienta.codigo" placeholder="Ej: T-001" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Marca</label>
          <InputText v-model="herramienta.marca" placeholder="Ej: Bosch" class="w-full" />
        </div>
        <div class="field-group">
          <label class="field-label">Descripción</label>
          <InputText v-model="herramienta.descripcion" placeholder="Descripción de la herramienta" class="w-full" />
        </div>
      </div>

      <div class="btn-row">
        <button class="erp-btn erp-btn-primary" @click="guardarHerramienta">
          <i class="pi pi-check"></i> Guardar
        </button>
        <button class="erp-btn erp-btn-secondary" @click="limpiarCampos">
          <i class="pi pi-refresh"></i> Limpiar
        </button>
      </div>

      <div v-if="mensaje" class="msg-ok">
        <i class="pi pi-check-circle"></i> {{ mensaje }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.alta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.btn-row { display: flex; gap: 12px; margin-top: 24px; }
.msg-ok {
  margin-top: 16px;
  padding: 12px 16px;
  background: #dcfce7;
  color: #15803d;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
