<script setup>
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';

const toast = useToast();
const mostrarQR = ref(false);
const qrSrc = ref('');  
const numeroRestante = ref('');  // <-- aquí el usuario ingresa el resto del número
const mensaje = ref('');
const sendingMessage = ref(false);

const abrirQR = () => {
  qrSrc.value = `http://34.44.122.144:3000/qr?ts=${new Date().getTime()}`;
  mostrarQR.value = true;

  toast.add({ 
    severity: 'info', 
    summary: 'QR disponible', 
    detail: 'Escanea el QR con WhatsApp', 
    life: 3000 
  });
};

const ajustarAltoIframe = (event) => {
  try {
    const iframe = event.target;
    // Solo funciona si la página es del mismo dominio
    iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
  } catch (e) {
    // Si la página es de otro dominio, no se puede acceder
    console.warn('No se puede ajustar el alto del iframe por CORS');
  }
};


const enviarMensaje = async () => {
  if (!numeroRestante.value || !mensaje.value) {
    toast.add({ 
      severity: 'warn', 
      summary: 'Campos incompletos', 
      detail: 'Número y mensaje son requeridos', 
      life: 3000 
    });
    return;
  }

  sendingMessage.value = true;
  try {
    const res = await fetch('http://34.44.122.144:3000/WhatsApp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ number: `521${numeroRestante.value}`, message: mensaje.value })
    });

    if (!res.ok) throw new Error('Error al enviar el mensaje');

    toast.add({ 
      severity: 'success', 
      summary: 'Mensaje enviado', 
      detail: `Mensaje enviado a 521${numeroRestante.value}`, 
      life: 3000 
    });
    mensaje.value = '';
  } catch (err) {
    toast.add({ 
      severity: 'error', 
      summary: 'Error', 
      detail: err.message || 'No se pudo enviar el mensaje', 
      life: 3000 
    });
  } finally {
    sendingMessage.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md space-y-6">
    <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">WhatsApp Manager</h2>

    <!-- Sección QR -->
    <div class="space-y-4">
      <Button label="Mostrar QR" icon="pi pi-qrcode" class="w-full" @click="abrirQR" />
      <div v-if="mostrarQR" class="flex justify-center">
        <iframe 
          :src="qrSrc"
          class="w-full border rounded" 
          style="height: auto; min-height: 400px;" 
          frameborder="0"
          @load="ajustarAltoIframe($event)"
        ></iframe>
      </div>
    </div>

    <!-- Sección enviar mensaje -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Enviar mensaje</h3>
      
      <!-- Input con lada fija 521 -->
      <div class="flex border rounded overflow-hidden">
        <span class="px-2 bg-gray-200 dark:bg-gray-700 text-gray-500 flex items-center select-none">521</span>
        <input type="text" v-model="numeroRestante" placeholder="Número" class="flex-1 p-2 border-none outline-none dark:bg-gray-800 dark:text-gray-200" />
      </div>

      <textarea v-model="mensaje" placeholder="Escribe tu mensaje" class="w-full p-2 border rounded dark:bg-gray-700 dark:text-gray-200"></textarea>
      <Button label="Enviar Mensaje" icon="pi pi-send" class="w-full" :loading="sendingMessage" @click="enviarMensaje" />
    </div>
  </div>
</template>
