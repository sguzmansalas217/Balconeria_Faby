<script setup>
import { ref, onMounted } from "vue";
import { db } from "@/firebase";
import { collection, getDocs, Timestamp } from "firebase/firestore";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const materiales = ref([]);

const cargarMateriales = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "materiales"));
    materiales.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      FechaEntrada: doc.data().FechaEntrada?.toDate ? doc.data().FechaEntrada.toDate() : null,
      FechaSalida: doc.data().FechaSalida?.toDate ? doc.data().FechaSalida.toDate() : null
    }));
  } catch (error) {
    console.error("Error al cargar materiales:", error);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "❌ No se pudo cargar la lista de materiales",
      life: 3000
    });
  }
};

onMounted(() => {
  cargarMateriales();
});
</script>

<template>
  <div class="p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md">
    <h2 class="text-2xl font-bold mb-4">Lista de Materiales</h2>
    <table class="min-w-full border border-gray-300">
      <thead>
        <tr class="bg-gray-100 dark:bg-gray-800">
          <th class="border px-4 py-2">Nombre</th>
          <th class="border px-4 py-2">Cantidad</th>
          <th class="border px-4 py-2">Unidad</th>
          <th class="border px-4 py-2">Fecha Entrada</th>
          <th class="border px-4 py-2">Fecha Salida</th>
          <th class="border px-4 py-2">Usuario</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in materiales" :key="item.id" class="hover:bg-gray-100 dark:hover:bg-gray-800">
          <td class="border px-4 py-2">{{ item.NombreMaterial }}</td>
          <td class="border px-4 py-2">{{ item.Cantidad }}</td>
          <td class="border px-4 py-2">{{ item.Unidad }}</td>
          <td class="border px-4 py-2">{{ item.FechaEntrada ? item.FechaEntrada.toLocaleDateString() : "" }}</td>
          <td class="border px-4 py-2">{{ item.FechaSalida ? item.FechaSalida.toLocaleDateString() : "" }}</td>
          <td class="border px-4 py-2">{{ item.UsuarioActual }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
