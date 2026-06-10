<script setup>
import { configuracionesApi } from '@/service/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';

const ownerGmail = ref('');
const timeCobro = ref('');
const timeVerificacion = ref('');
const currentData = ref(null);
const toast = useToast();

const fetchConfigData = async () => {
  try {
    const { data } = await configuracionesApi.get();
    currentData.value = data;
    ownerGmail.value = data.owner_gmail || '';
    timeCobro.value = data.time_cobro || '';
    timeVerificacion.value = data.time_verificacion || '';
  } catch (error) {
    console.error('Error al cargar configuraciones:', error);
  }
};

const saveField = async (field) => {
  const payload = {};
  if (field === 'ownerGmail') payload.owner_gmail = ownerGmail.value;
  if (field === 'timeCobro') payload.time_cobro = Number(timeCobro.value);
  if (field === 'timeVerificacion') payload.time_verificacion = Number(timeVerificacion.value);

  try {
    await configuracionesApi.update(payload);
    toast.add({ severity: 'success', summary: 'Guardado', detail: 'Configuración actualizada', life: 3000 });
    fetchConfigData();
  } catch (error) {
    toast.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar', life: 3000 });
  }
};

onMounted(() => {
  fetchConfigData();
});
</script>

<template>
  <div class="p-6 space-y-8 bg-white dark:bg-gray-900 rounded-xl shadow-md">
    <div class="space-y-4">
      <h2 class="text-2xl font-bold mb-4">Configuración de Alertas</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium mb-1">Correo actual</label>
          <input :value="currentData?.owner_gmail" type="email" class="w-full border border-gray-300 rounded-lg p-2" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Nuevo correo de alertas</label>
          <input v-model="ownerGmail" type="email" class="w-full border border-gray-300 rounded-lg p-2" placeholder="Nuevo Owner Gmail" />
        </div>
        <div class="col-span-full">
          <Button label="Guardar Nuevo Correo" icon="pi pi-save" severity="primary" @click="saveField('ownerGmail')" class="p-button-rounded w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium mb-1">Tiempo actual de alerta de cobro (días)</label>
          <input :value="currentData?.time_cobro" type="number" class="w-full border border-gray-300 rounded-lg p-2" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Nuevo tiempo de alerta de cobro</label>
          <input v-model="timeCobro" type="number" class="w-full border border-gray-300 rounded-lg p-2" />
        </div>
        <div class="col-span-full">
          <Button label="Guardar Tiempo" icon="pi pi-save" severity="primary" @click="saveField('timeCobro')" class="p-button-rounded w-full" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-medium mb-1">Tiempo actual de verificación (días)</label>
          <input :value="currentData?.time_verificacion" type="number" class="w-full border border-gray-300 rounded-lg p-2" readonly />
        </div>
        <div>
          <label class="block font-medium mb-1">Nuevo tiempo de verificación</label>
          <input v-model="timeVerificacion" type="number" class="w-full border border-gray-300 rounded-lg p-2" />
        </div>
        <div class="col-span-full">
          <Button label="Guardar Tiempo" icon="pi pi-save" severity="primary" @click="saveField('timeVerificacion')" class="p-button-rounded w-full" />
        </div>
      </div>
    </div>
  </div>
</template>
