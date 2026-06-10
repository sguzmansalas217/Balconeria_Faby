<script>
import { registroApi, foliosApi, usuariosApi } from '@/service/api';
import { auth } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

export default {
  setup() {
    const datos = ref([]);
    const filteredData = ref([]);
    const foliosDisponibles = ref([]);
    const tipoUsuario = ref(null);
    const usuario = ref(null);
    const filters = ref({});
    const toast = useToast();
    const certificadoSeleccionado = ref(null);

    const estadosMexico = ["Aguascalientes", "Foraneos", "Extranjeros"];
    const opcionesCombustible = ['Gasolina', 'Diesel', 'Gas'];
    const listCantidadCredito = ['Efectivo', 'Credito', 'Transferencia', 'Tarjeta'];
    const listMulta = ['Pago Pendiente', 'Pagada', 'N/A'];
    const listUso = ['Anual', 'Semestral', 'Cuatrimestral'];
    const listLinea = ['Linea 1', 'Linea 2'];

    const headers = ref([
      { label: 'Fecha de Registro', key: 'fecha_registro' },
      { label: 'Nota', key: 'nota' },
      { label: 'Linea', key: 'linea' },
      { label: 'Certificado', key: 'certificado' },
      { label: 'Por Hacer', key: 'certificado_ok' },
      { label: 'Placa', key: 'placa' },
      { label: 'Combustible', key: 'combustible' },
      { label: 'Uso', key: 'uso' },
      { label: 'Fecha de Alta', key: 'fecha_alta' },
      { label: 'Numero de Alta', key: 'no_alta' },
      { label: 'Nombre Cliente', key: 'nombre_cliente' },
      { label: 'Estatus de Multa', key: 'estatus_multa' },
      { label: 'Multa', key: 'multa' },
      { label: 'Numero Serie', key: 'no_serie' },
      { label: 'Costo', key: 'costo' },
      { label: 'Cantidad Crédito', key: 'cantidad_credito' },
      { label: 'Fecha de Pago', key: 'fecha_pago' },
      { label: 'Referencia', key: 'referencia' },
      { label: 'Otra Referencia', key: 'referencia2' },
      { label: 'Año', key: 'year' },
      { label: 'Estado', key: 'estado' },
      { label: 'Quien Registro', key: 'usuario_actual' },
    ]);

    const camposFecha = ['fecha_registro', 'fecha_alta', 'fecha_pago'];
    const camposAdmin = ['multa', 'costo', 'cantidad_credito', 'referencia', 'referencia2', 'usuario_actual', 'estatus_multa', 'fecha_pago'];

    const visibleHeaders = computed(() => {
      return headers.value.filter(h => {
        return tipoUsuario.value === 'Admin' || !camposAdmin.includes(h.key);
      });
    });

    function inicializarFiltros() {
      visibleHeaders.value.forEach(h => {
        if (camposFecha.includes(h.key)) {
          filters.value[h.key] = { start: '', end: '' };
        } else {
          filters.value[h.key] = '';
        }
      });
    }

    function limpiarFiltros() {
      for (const key in filters.value) {
        if (camposFecha.includes(key) && typeof filters.value[key] === 'object') {
          filters.value[key].start = '';
          filters.value[key].end = '';
        } else {
          filters.value[key] = '';
        }
      }
      applyFilters();
    }

    function cancelarEdicion(row) {
      if (row.originalData) {
        Object.assign(row, row.originalData);
        delete row.originalData;
      }
      row.editMode = false;
    }

    const convertirFechaInput = (val) => {
      if (!val) return '';
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().substring(0, 10);
    };

    const obtenerDatos = async () => {
      try {
        const { data } = await registroApi.getAll();
        datos.value = data.map(row => ({
          ...row,
          editMode: false,
          editData: {
            ...row,
            fecha_registro: convertirFechaInput(row.fecha_registro),
            fecha_alta: convertirFechaInput(row.fecha_alta),
            fecha_pago: convertirFechaInput(row.fecha_pago),
          }
        }));
        filteredData.value = [...datos.value];
      } catch (error) {
        console.error("Error al obtener registros:", error);
      }
    };

    const cargarFoliosDisponibles = async () => {
      try {
        const { data } = await foliosApi.getLinea1Disponibles();
        foliosDisponibles.value = data;
      } catch (error) {
        console.error("Error cargando folios:", error);
      }
    };

    const obtenerDatosUsuario = async (uid) => {
      try {
        const { data } = await usuariosApi.getById(uid);
        usuario.value = data;
        tipoUsuario.value = data.tipo_usuario || 'User';
      } catch (error) {
        console.error("Error obteniendo usuario:", error);
      }
    };

    function applyFilters() {
      filteredData.value = datos.value.filter(row => {
        return visibleHeaders.value.every(header => {
          const value = row[header.key];
          const filterValue = filters.value[header.key];

          if (
            (typeof filterValue === 'string' && filterValue.trim() === '') ||
            (typeof filterValue === 'object' && !filterValue?.start && !filterValue?.end)
          ) return true;

          if (camposFecha.includes(header.key) && typeof filterValue === 'object') {
            if (!value || value === 'N/A') return false;
            const rowDate = new Date(value);
            const start = filterValue.start ? new Date(filterValue.start + 'T00:00:00') : null;
            const end = filterValue.end ? new Date(filterValue.end + 'T23:59:59') : null;
            if (start && rowDate < start) return false;
            if (end && rowDate > end) return false;
            return true;
          }

          const filterText = typeof filterValue === 'string' ? filterValue.toLowerCase() : '';
          if (typeof value === 'string') return value.toLowerCase().includes(filterText);
          if (value != null) return String(value).toLowerCase().includes(filterText);
          return false;
        });
      });
    }

    const formatDate = (val) => {
      if (!val) return 'N/A';
      const d = new Date(val);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatCurrency = (value) => {
      return value ? Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : 'N/A';
    };

    const guardarCambios = async (row) => {
      try {
        const { data } = await registroApi.update(row.id, row.editData);

        Object.assign(row, {
          ...data,
          editMode: false,
          editData: {
            ...data,
            fecha_registro: convertirFechaInput(data.fecha_registro),
            fecha_alta: convertirFechaInput(data.fecha_alta),
            fecha_pago: convertirFechaInput(data.fecha_pago),
          }
        });

        toast.add({ severity: 'success', summary: 'Éxito', detail: 'Datos guardados correctamente.', life: 3000 });
        cargarFoliosDisponibles();
      } catch (error) {
        const msg = error.response?.data?.error || 'Error al guardar los cambios';
        toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 });
      }
    };

    onMounted(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          obtenerDatosUsuario(user.uid);
          obtenerDatos().then(() => {
            inicializarFiltros();
          });
          cargarFoliosDisponibles();
        } else {
          tipoUsuario.value = null;
          datos.value = [];
        }
      });
    });

    return {
      headers,
      visibleHeaders,
      filters,
      filteredData,
      applyFilters,
      formatDate,
      formatCurrency,
      tipoUsuario,
      guardarCambios,
      opcionesCombustible,
      estadosMexico,
      listMulta,
      listCantidadCredito,
      listUso,
      listLinea,
      foliosDisponibles,
      certificadoSeleccionado,
      cargarFoliosDisponibles,
      limpiarFiltros,
      cancelarEdicion,
      camposFecha,
    };
  }
};
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Registro Línea 1</h2>
        <p class="page-sub">Consulta y edita los registros de verificación Línea 1</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center">
        <div class="badge-total">{{ filteredData.length }} registros</div>
        <button class="erp-btn erp-btn-secondary" style="font-size:0.8rem;padding:6px 14px" @click="limpiarFiltros">
          <i class="pi pi-filter-slash"></i> Limpiar filtros
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table doc-table">
          <thead>
            <tr>
              <th v-for="header in visibleHeaders" :key="header.key">
                {{ header.label }}
                <template v-if="camposFecha.includes(header.key)">
                  <input type="date" :value="filters[header.key]?.start || ''"
                    @input="filters[header.key] = { ...(filters[header.key] || {}), start: $event.target.value }; applyFilters()"
                    class="th-input" placeholder="Desde" style="margin-bottom:4px" />
                  <input type="date" :value="filters[header.key]?.end || ''"
                    @input="filters[header.key] = { ...(filters[header.key] || {}), end: $event.target.value }; applyFilters()"
                    class="th-input" placeholder="Hasta" />
                </template>
                <template v-else>
                  <input v-model="filters[header.key]" @input="applyFilters" placeholder="Filtrar..." class="th-input" />
                </template>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="row in filteredData" :key="row.id">
              <tr>
                <td v-for="header in visibleHeaders" :key="header.key">
                  <template v-if="row.editMode">
                    <div class="edit-original">
                      <span v-if="camposFecha.includes(header.key)">{{ formatDate(row[header.key]) }}</span>
                      <span v-else>{{ row[header.key] }}</span>
                    </div>
                    <input v-if="['nombre_cliente','no_serie','linea','nota','placa','no_alta','referencia','referencia2'].includes(header.key)"
                      v-model="row.editData[header.key]" class="edit-input" />
                    <input v-else-if="camposFecha.includes(header.key)"
                      type="date" v-model="row.editData[header.key]" class="edit-input" />
                    <select v-else-if="header.key === 'combustible'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="op in opcionesCombustible" :key="op" :value="op">{{ op }}</option>
                    </select>
                    <select v-else-if="header.key === 'uso'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="u in listUso" :key="u" :value="u">{{ u }}</option>
                    </select>
                    <select v-else-if="header.key === 'estado'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="e in estadosMexico" :key="e" :value="e">{{ e }}</option>
                    </select>
                    <select v-else-if="header.key === 'cantidad_credito'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="c in listCantidadCredito" :key="c" :value="c">{{ c }}</option>
                    </select>
                    <select v-else-if="header.key === 'estatus_multa'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="m in listMulta" :key="m" :value="m">{{ m }}</option>
                    </select>
                    <input v-else-if="['multa','costo','year','certificado'].includes(header.key)"
                      type="number" v-model.number="row.editData[header.key]" class="edit-input" />
                    <input v-else-if="header.key === 'certificado_ok'"
                      type="checkbox" v-model="row.editData[header.key]" style="margin-top:4px;accent-color:#004AAD" />
                    <span v-else>{{ row[header.key] }}</span>
                  </template>

                  <template v-else>
                    <span v-if="camposFecha.includes(header.key)" class="text-muted">{{ formatDate(row[header.key]) }}</span>
                    <span v-else-if="header.key === 'certificado_ok'">
                      <span :class="row[header.key] ? 'badge-success' : 'badge-danger'">{{ row[header.key] ? 'SI' : 'NO' }}</span>
                    </span>
                    <span v-else-if="['multa','costo'].includes(header.key)">{{ formatCurrency(row[header.key]) }}</span>
                    <span v-else>{{ row[header.key] }}</span>
                  </template>
                </td>
                <td style="white-space:nowrap">
                  <template v-if="row.editMode">
                    <button class="erp-btn erp-btn-success" style="font-size:0.75rem;padding:5px 11px;margin-right:4px" @click="guardarCambios(row)">Guardar</button>
                    <button class="erp-btn erp-btn-danger" style="font-size:0.75rem;padding:5px 11px" @click="cancelarEdicion(row)">Cancelar</button>
                  </template>
                  <button v-else class="erp-btn erp-btn-primary" style="font-size:0.75rem;padding:5px 11px" @click="row.editMode = true">
                    <i class="pi pi-pencil"></i> Editar
                  </button>
                </td>
              </tr>
            </template>
            <tr v-if="filteredData.length === 0">
              <td :colspan="visibleHeaders.length + 1" class="empty-row">No se encontraron registros</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.doc-table th, .doc-table td { min-width: 140px; }
.doc-table th:has([placeholder="Filtrar..."]) { min-width: 160px; }
.edit-input { width:100%; padding:4px 6px; font-size:0.82rem; border:1.5px solid #dde3ec; border-radius:5px; background:#fafbff; color:#1e293b; font-family:inherit; box-sizing:border-box; }
.edit-input:focus { outline:none; border-color:#004AAD; }
.edit-original { font-size:0.72rem; color:#94a3b8; margin-bottom:3px; }
</style>
