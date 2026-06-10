<script>
import { registroApi, foliosApi } from '@/service/api';
import { useToast } from 'primevue/usetoast';
import { computed, onMounted, ref } from 'vue';

export default {
  setup() {
    const foliosDisponibles = ref([]);
    const datos = ref([]);
    const tipoUsuario = ref(null);
    const usuario = ref(null);
    const filters = ref({});
    const filteredData = ref([]);
    const toast = useToast();
    const certificadoSeleccionado = ref(null);

    const cargarFoliosDisponibles = async () => {
      try {
        const { data } = await foliosApi.getLinea1Disponibles();
        foliosDisponibles.value = data;
      } catch (error) {
        console.error("Error cargando folios disponibles:", error);
      }
    };

    function cancelarEdicion(row) {
      if (row.originalData) {
        Object.assign(row, row.originalData);
        delete row.originalData;
      }
      row.editMode = false;
    }

    function inicializarFiltros() {
      visibleHeaders.value.forEach(header => {
        if (['fecha_registro', 'fecha_alta', 'fecha_pago'].includes(header.key)) {
          filters.value[header.key] = { start: '', end: '' };
        } else {
          filters.value[header.key] = '';
        }
      });
    }

    function limpiarFiltros() {
      for (const key in filters.value) {
        if (
          ['fecha_registro', 'fecha_alta', 'fecha_pago'].includes(key) &&
          typeof filters.value[key] === 'object'
        ) {
          filters.value[key].start = '';
          filters.value[key].end = '';
        } else {
          filters.value[key] = '';
        }
      }
      applyFilters();
    }

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
      { label: 'Costo', key: 'costo' },
      { label: 'Cantidad Crédito', key: 'cantidad_credito' },
      { label: 'Fecha de Pago', key: 'fecha_pago' },
      { label: 'Referencia', key: 'referencia' },
      { label: 'Otra Referencia', key: 'referencia2' },
      { label: 'Año', key: 'year' },
      { label: 'Estado', key: 'estado' },
      { label: 'Quien Registro', key: 'usuario_actual' },
    ]);

    const visibleHeaders = computed(() => {
      return headers.value.filter(header => {
        return tipoUsuario.value === 'Admin' || ![
          'multa', 'costo', 'cantidad_credito', 'referencia', 'referencia2',
          'usuario_actual', 'estatus_multa', 'fecha_pago'
        ].includes(header.key);
      });
    });

    const obtenerDatos = async () => {
      try {
        const { data } = await registroApi.getFederal();
        datos.value = data.map(row => ({
          ...row,
          editMode: false,
          editData: {
            ...row,
            fecha_registro: row.fecha_registro ? row.fecha_registro.substring(0, 10) : '',
            fecha_alta: row.fecha_alta ? row.fecha_alta.substring(0, 10) : '',
            fecha_pago: row.fecha_pago ? row.fecha_pago.substring(0, 10) : '',
          }
        }));
        filteredData.value = [...datos.value];
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    const cargarUsuario = () => {
      try {
        const token = localStorage.getItem("jwt_token");
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        tipoUsuario.value = payload.tipo_usuario || 'User';
        usuario.value = { email: payload.email };
      } catch (e) {
        console.error("Error leyendo JWT:", e);
      }
    };

    function applyFilters() {
      filteredData.value = datos.value.filter(row => {
        return visibleHeaders.value.every(header => {
          const value = row[header.key];
          const filterValue = filters.value[header.key];

          if (
            (typeof filterValue === 'string' && filterValue.trim() === '') ||
            (typeof filterValue === 'object' && !filterValue.start && !filterValue.end)
          ) {
            return true;
          }

          if (
            ['fecha_registro', 'fecha_alta', 'fecha_pago'].includes(header.key) &&
            typeof filterValue === 'object'
          ) {
            if (!value) return false;
            const rowDate = new Date(value);
            const start = filterValue.start ? new Date(filterValue.start + 'T00:00:00') : null;
            const end = filterValue.end ? new Date(filterValue.end + 'T23:59:59') : null;
            if (start && rowDate < start) return false;
            if (end && rowDate > end) return false;
            return true;
          }

          const filterText = typeof filterValue === 'string' ? filterValue.toLowerCase() : '';
          if (typeof value === 'string') {
            return value.toLowerCase().includes(filterText);
          } else if (value != null) {
            return String(value).toLowerCase().includes(filterText);
          }
          return false;
        });
      });
    }

    const formatDate = (val) => {
      if (!val) return 'N/A';
      return new Date(val).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    const formatCurrency = (value) => {
      return value ? Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }) : 'N/A';
    };

    const guardarCambios = async (row) => {
      try {
        const editData = { ...row.editData };

        const { data } = await registroApi.updateFederal(row.id, editData);

        Object.assign(row, {
          ...data,
          editMode: false,
          editData: {
            ...data,
            fecha_registro: data.fecha_registro ? data.fecha_registro.substring(0, 10) : '',
            fecha_alta: data.fecha_alta ? data.fecha_alta.substring(0, 10) : '',
            fecha_pago: data.fecha_pago ? data.fecha_pago.substring(0, 10) : '',
          }
        });

        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Datos guardados correctamente.',
          life: 3000
        });
      } catch (error) {
        const msg = error.response?.data?.error || 'Ocurrió un error al guardar los cambios.';
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: msg,
          life: 5000
        });
        console.error("Error al guardar cambios:", error);
      }
    };

    onMounted(() => {
      cargarUsuario();
      obtenerDatos().then(() => {
        inicializarFiltros();
      });
      cargarFoliosDisponibles();
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
    };
  }
};
</script>

<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Registro Federal</h2>
        <p class="page-sub">Consulta y edita los registros de verificación Federal</p>
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
                <template v-if="['fecha_registro', 'fecha_alta', 'fecha_pago'].includes(header.key)">
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
                      <span v-if="['fecha_registro', 'fecha_alta', 'fecha_pago'].includes(header.key)">{{ formatDate(row[header.key]) }}</span>
                      <span v-else>{{ row[header.key] }}</span>
                    </div>
                    <input v-if="['nombre_cliente','linea','nota','placa','no_alta','referencia','referencia2'].includes(header.key)"
                      v-model="row.editData[header.key]" class="edit-input" />
                    <input v-else-if="['fecha_registro','fecha_alta','fecha_pago'].includes(header.key)"
                      type="date" v-model="row.editData[header.key]" class="edit-input" />
                    <select v-else-if="header.key === 'combustible'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="opcion in opcionesCombustible" :key="opcion" :value="opcion">{{ opcion }}</option>
                    </select>
                    <select v-else-if="header.key === 'uso'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="uso in listUso" :key="uso" :value="uso">{{ uso }}</option>
                    </select>
                    <select v-else-if="header.key === 'estado'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="estado in estadosMexico" :key="estado" :value="estado">{{ estado }}</option>
                    </select>
                    <select v-else-if="header.key === 'cantidad_credito'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="cc in listCantidadCredito" :key="cc" :value="cc">{{ cc }}</option>
                    </select>
                    <select v-else-if="header.key === 'estatus_multa'" v-model="row.editData[header.key]" class="edit-input">
                      <option v-for="em in listMulta" :key="em" :value="em">{{ em }}</option>
                    </select>
                    <input v-else-if="['multa','costo','year','certificado'].includes(header.key)"
                      type="number" v-model.number="row.editData[header.key]" class="edit-input" />
                    <input v-else-if="header.key === 'certificado_ok'"
                      type="checkbox" v-model="row.editData[header.key]" style="margin-top:4px;accent-color:#004AAD" />
                    <span v-else>{{ row[header.key] }}</span>
                  </template>

                  <template v-else>
                    <span v-if="['fecha_registro','fecha_alta','fecha_pago'].includes(header.key)" class="text-muted">{{ formatDate(row[header.key]) }}</span>
                    <span v-else-if="header.key === 'certificado_ok'">
                      <span :class="row[header.key] ? 'badge-success' : 'badge-danger'">{{ row[header.key] ? 'SI' : 'NO' }}</span>
                    </span>
                    <span v-else-if="['multa','costo','cantidad_credito'].includes(header.key)">{{ formatCurrency(row[header.key]) }}</span>
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
.edit-input { width:100%; padding:4px 6px; font-size:0.82rem; border:1.5px solid #dde3ec; border-radius:5px; background:#fafbff; color:#1e293b; font-family:inherit; box-sizing:border-box; }
.edit-input:focus { outline:none; border-color:#004AAD; }
.edit-original { font-size:0.72rem; color:#94a3b8; margin-bottom:3px; }
</style>
