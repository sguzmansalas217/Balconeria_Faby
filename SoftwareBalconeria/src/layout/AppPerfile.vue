<template>
  <div class="p-4 bg-white rounded-xl shadow-md w-96 text-black">
    <h2 class="text-xl font-bold mb-4">Datos del Usuario</h2>
    <p><strong>Nombre:</strong> {{ userName }}</p>
    <p><strong>Correo:</strong> {{ userEmail }}</p>
    <p><strong>Rol:</strong> {{ role }}</p>
    <button @click="logout" class="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded">
      Cerrar sesión
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '@/composables/useAuth';

const auth = getAuth();
const router = useRouter();
const { userName, userEmail, role, refresh } = useAuth();

const logout = async () => {
  try {
    await signOut(auth);
    localStorage.removeItem('jwt_token');
    refresh();
    router.replace({ name: 'login' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};
</script>
