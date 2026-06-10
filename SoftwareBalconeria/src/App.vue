<script setup>
import Toast from 'primevue/toast'; // Importa el componente Toast
</script>

<template>
    <router-view />
    <Toast />  <!-- Agrega el componente Toast -->
</template>

<style scoped>
/* Si tienes algún estilo personalizado para el Toast, puedes agregarlo aquí */
</style>
