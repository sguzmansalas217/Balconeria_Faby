<script setup>
import { ref, onMounted } from "vue";
import { herramientasApi, usuariosApi } from "@/service/api";
import { useToast } from "primevue/usetoast";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";

const toast = useToast();
const usuarios = ref([]);
const codigosInput = ref("");
const fechaAsignacion = ref(null);
const fechaRetorno = ref(null);
const usuarioAsignado = ref(null);
const errores = ref([]);

const cargarUsuarios = async () => {
  const { data } = await usuariosApi.getAll();
  usuarios.value = data;
};

const procesarHerramientas = async (asignar = true) => {
  errores.value = [];

  if (asignar && (!fechaAsignacion.value || !usuarioAsignado.value)) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Selecciona fecha de asignación y usuario", life: 3000 });
    return;
  }
  if (!asignar && !fechaRetorno.value) {
    toast.add({ severity: "warn", summary: "Atención", detail: "Selecciona fecha de retorno", life: 3000 });
    return;
  }

  const codigos = codigosInput.value.split("\n").map(c => c.trim()).filter(c => c !== "");

  try {
    const { data } = await herramientasApi.asignarMasivo({
      codigos,
      usuario_asignado: usuarioAsignado.value,
      fecha_asignacion: asignar ? fechaAsignacion.value : fechaRetorno.value,
      accion: asignar ? "asignar" : "desasignar",
    });

    errores.value = data.errores || [];
    toast.add({
      severity: "success",
      summary: "Proceso finalizado",
      detail: asignar ? "Asignaciones completadas" : "Desasignaciones completadas",
      life: 3000,
    });
  } catch (error) {
    toast.add({ severity: "error", summary: "Error", detail: "Error al procesar herramientas", life: 3000 });
  }

  codigosInput.value = "";
  fechaAsignacion.value = null;
  fechaRetorno.value = null;
  usuarioAsignado.value = null;
};

onMounted(() => {
  cargarUsuarios();
});
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Asignación Rápida</h2>
        <p class="page-sub">Asigna o desasigna múltiples herramientas por código</p>
      </div>
    </div>

    <div class="form-card" style="max-width: 700px;">
      <div class="form-grid">
        <div class="field-group" style="grid-column: 1 / -1">
          <label class="field-label">Códigos (uno por línea)</label>
          <textarea v-model="codigosInput" rows="6" class="field-textarea" placeholder="Escribe los códigos separados por enter"></textarea>
        </div>

        <div class="field-group">
          <label class="field-label">Usuario Asignado</label>
          <Dropdown v-model="usuarioAsignado" :options="usuarios" optionLabel="name" optionValue="name" placeholder="Seleccionar usuario" class="w-full" />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha de Asignación</label>
          <input type="date" v-model="fechaAsignacion" class="field-input" />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha de Retorno</label>
          <input type="date" v-model="fechaRetorno" class="field-input" />
        </div>
      </div>

      <div class="btn-row">
        <button class="erp-btn erp-btn-success" @click="procesarHerramientas(true)">
          <i class="pi pi-user-plus"></i> Asignar
        </button>
        <button class="erp-btn erp-btn-danger" @click="procesarHerramientas(false)">
          <i class="pi pi-user-minus"></i> Desasignar
        </button>
      </div>
    </div>

    <div v-if="errores.length > 0" class="error-card">
      <h3><i class="pi pi-exclamation-triangle" style="margin-right:6px"></i>Errores en el proceso</h3>
      <table class="erp-table" style="margin-top:8px">
        <thead>
          <tr><th>Código</th><th>Motivo</th></tr>
        </thead>
        <tbody>
          <tr v-for="(e, i) in errores" :key="i">
            <td><span class="code-badge">{{ e.codigo }}</span></td>
            <td class="text-muted">{{ e.error }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.btn-row { display: flex; gap: 12px; margin-top: 24px; }
</style>
