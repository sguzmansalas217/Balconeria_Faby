<script setup>
import { ref, computed, onMounted } from "vue";
import { herramientasApi } from "@/service/api";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const herramientas = ref([]);
const filtros = ref({
  nombre: "",
  codigo: "",
  marca: "",
  descripcion: "",
  disponible: "",
  usuarioAsignado: ""
});

const cargarHerramientas = async () => {
  try {
    const { data } = await herramientasApi.getAll(true);
    herramientas.value = data.map(h => ({
      ...h,
      fecha_asignacion: h.fecha_asignacion ? new Date(h.fecha_asignacion) : null,
      fecha_retorno: h.fecha_retorno ? new Date(h.fecha_retorno) : null,
    }));
  } catch (error) {
    console.error("Error al cargar herramientas:", error);
    toast.add({ severity: "error", summary: "Error", detail: "No se pudieron cargar las herramientas", life: 3000 });
  }
};

const herramientasFiltradas = computed(() => {
  return herramientas.value.filter(h => {
    return (
      (h.nombre || "").toLowerCase().includes(filtros.value.nombre.toLowerCase()) &&
      (h.codigo || "").toLowerCase().includes(filtros.value.codigo.toLowerCase()) &&
      (h.marca || "").toLowerCase().includes(filtros.value.marca.toLowerCase()) &&
      (h.descripcion || "").toLowerCase().includes(filtros.value.descripcion.toLowerCase()) &&
      (filtros.value.disponible === "" || ((h.disponible ? "sí" : "no") || "").includes(filtros.value.disponible.toLowerCase())) &&
      ((h.usuario_asignado || "-") || "").toLowerCase().includes(filtros.value.usuarioAsignado.toLowerCase())
    );
  });
});

onMounted(() => {
  cargarHerramientas();
});
</script>

<template>
  <div class="erp-page">
    <!-- Encabezado de página -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Listado de Herramientas</h2>
        <p class="page-sub">Consulta el inventario completo de herramientas</p>
      </div>
      <div class="badge-total">{{ herramientasFiltradas.length }} registros</div>
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th>Nombre <input v-model="filtros.nombre" type="text" placeholder="Filtrar..." class="th-input" /></th>
              <th>Código <input v-model="filtros.codigo" type="text" placeholder="Filtrar..." class="th-input" /></th>
              <th>Marca <input v-model="filtros.marca" type="text" placeholder="Filtrar..." class="th-input" /></th>
              <th>Descripción <input v-model="filtros.descripcion" type="text" placeholder="Filtrar..." class="th-input" /></th>
              <th>Estado <input v-model="filtros.disponible" type="text" placeholder="Filtrar..." class="th-input" /></th>
              <th>Usuario Asignado <input v-model="filtros.usuarioAsignado" type="text" placeholder="Filtrar..." class="th-input" /></th>
              <th>Fecha Asignación</th>
              <th>Fecha Retorno</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="herramienta in herramientasFiltradas" :key="herramienta.id">
              <td class="font-medium">{{ herramienta.nombre }}</td>
              <td><span class="code-badge">{{ herramienta.codigo }}</span></td>
              <td>{{ herramienta.marca }}</td>
              <td class="text-muted">{{ herramienta.descripcion }}</td>
              <td>
                <span :class="herramienta.disponible ? 'badge-success' : 'badge-danger'">
                  {{ herramienta.disponible ? 'Disponible' : 'No disponible' }}
                </span>
              </td>
              <td>{{ herramienta.usuario_asignado || '—' }}</td>
              <td class="text-muted">{{ herramienta.fecha_asignacion ? herramienta.fecha_asignacion.toLocaleDateString('es-MX') : '—' }}</td>
              <td class="text-muted">{{ herramienta.fecha_retorno ? herramienta.fecha_retorno.toLocaleDateString('es-MX') : '—' }}</td>
            </tr>
            <tr v-if="herramientasFiltradas.length === 0">
              <td colspan="8" class="empty-row">No se encontraron herramientas</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
