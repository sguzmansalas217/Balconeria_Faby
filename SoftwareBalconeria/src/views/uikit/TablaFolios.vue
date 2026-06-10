<template>
  <div class="erp-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Folios — Línea 1</h2>
        <p class="page-sub">Consulta y filtra los folios de la línea 1</p>
      </div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <div class="badge-total">{{ foliosFiltrados.length }} registros</div>
        <button class="erp-btn erp-btn-secondary" style="font-size:0.78rem;padding:6px 14px" @click="mostrarFiltros = !mostrarFiltros">
          <i :class="mostrarFiltros ? 'pi pi-eye-slash' : 'pi pi-filter'"></i>
          {{ mostrarFiltros ? 'Ocultar filtros' : 'Mostrar filtros' }}
        </button>
      </div>
    </div>

    <div class="table-card">
      <div class="overflow-x-auto">
        <table class="erp-table">
          <thead>
            <tr>
              <th ref="numeroFolio">
                # Folio
                <input v-if="mostrarFiltros" v-model="filtros.numeroFolio" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="clienteAsignado">
                Cliente
                <input v-if="mostrarFiltros" v-model="filtros.clienteAsignado" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="referencia">
                Referencia 1
                <input v-if="mostrarFiltros" v-model="filtros.referencia" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="referencia2">
                Referencia 2
                <input v-if="mostrarFiltros" v-model="filtros.referencia2" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="cantidadCredito">
                Pago
                <input v-if="mostrarFiltros" v-model="filtros.cantidadCredito" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="uso">
                Uso
                <input v-if="mostrarFiltros" v-model="filtros.uso" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="year">
                Año
                <input v-if="mostrarFiltros" v-model="filtros.year" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="estado">
                Estado
                <input v-if="mostrarFiltros" v-model="filtros.estado" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="fechaAlta">
                Fecha Alta
                <input v-if="mostrarFiltros" v-model="filtros.fechaAlta" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="nombreLogin">
                Registró
                <input v-if="mostrarFiltros" v-model="filtros.nombreLogin" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="placaAsignada">
                Placa
                <input v-if="mostrarFiltros" v-model="filtros.placaAsignada" class="th-input" placeholder="Filtrar..." />
              </th>
              <th ref="utilizado">
                Utilizado
                <select v-if="mostrarFiltros" v-model="filtros.utilizado" class="th-input">
                  <option value="">Todos</option>
                  <option value="SI">Sí</option>
                  <option value="NO">No</option>
                </select>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="folio in foliosFiltrados" :key="folio.id">
              <td><span class="code-badge">{{ folio.numero_folio }}</span></td>
              <td class="font-medium">{{ folio.cliente_asignado }}</td>
              <td class="text-muted">{{ folio.referencia }}</td>
              <td class="text-muted">{{ folio.referencia2 }}</td>
              <td>{{ folio.cantidad_credito }}</td>
              <td>{{ folio.uso }}</td>
              <td>{{ folio.year }}</td>
              <td>{{ folio.estado }}</td>
              <td class="text-muted">{{ formatearFecha(folio.fecha_alta) }}</td>
              <td>{{ folio.nombre_login }}</td>
              <td><span class="code-badge">{{ folio.placa }}</span></td>
              <td>
                <span :class="folio.utilizado === 'SI' ? 'badge-danger' : 'badge-success'">
                  {{ folio.utilizado === 'SI' ? 'Usado' : 'Disponible' }}
                </span>
              </td>
            </tr>
            <tr v-if="foliosFiltrados.length === 0">
              <td colspan="12" class="empty-row">No se encontraron folios</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script>
import { foliosApi } from '@/service/api';

export default {
  name: 'TablaFolios',
  data() {
    return {
      folios: [],
      mostrarFiltros: false,
      filtros: {
        numeroFolio: '',
        clienteAsignado: '',
        referencia: '',
        referencia2: '',
        cantidadCredito: '',
        uso: '',
        year: '',
        estado: '',
        fechaAlta: '',
        nombreLogin: '',
        placaAsignada: '',
        utilizado: ''
      },
      columnWidths: {
        numeroFolio: 0,
        clienteAsignado: 0,
        referencia: 0,
        referencia2: 0,
        cantidadCredito: 0,
        uso: 0,
        year: 0,
        estado: 0,
        fechaAlta: 0,
        nombreLogin: 0,
        placaAsignada: 0,
        utilizado: 0
      }
    };
  },
  created() {
    this.obtenerFolios();
  },
  computed: {
    foliosFiltrados() {
      return this.folios.filter(folio => {
        return (
          (this.filtros.numeroFolio === '' || folio.numero_folio?.toString().includes(this.filtros.numeroFolio)) &&
          (this.filtros.clienteAsignado === '' || folio.cliente_asignado?.toLowerCase().includes(this.filtros.clienteAsignado.toLowerCase())) &&
          (this.filtros.referencia === '' || folio.referencia?.toLowerCase().includes(this.filtros.referencia.toLowerCase())) &&
          (this.filtros.referencia2 === '' || folio.referencia2?.toLowerCase().includes(this.filtros.referencia2.toLowerCase())) &&
          (this.filtros.cantidadCredito === '' || folio.cantidad_credito?.toLowerCase().includes(this.filtros.cantidadCredito.toLowerCase())) &&
          (this.filtros.uso === '' || folio.uso?.toLowerCase().includes(this.filtros.uso.toLowerCase())) &&
          (this.filtros.year === '' || folio.year?.toString().includes(this.filtros.year)) &&
          (this.filtros.estado === '' || folio.estado?.toLowerCase().includes(this.filtros.estado.toLowerCase())) &&
          (this.filtros.fechaAlta === '' || this.formatearFecha(folio.fecha_alta).toLowerCase().includes(this.filtros.fechaAlta.toLowerCase())) &&
          (this.filtros.nombreLogin === '' || folio.nombre_login?.toLowerCase().includes(this.filtros.nombreLogin.toLowerCase())) &&
          (this.filtros.placaAsignada === '' || folio.placa?.toLowerCase().includes(this.filtros.placaAsignada.toLowerCase())) &&
          (this.filtros.utilizado === '' || folio.utilizado === this.filtros.utilizado)
        );
      });
    }
  },
  methods: {
    async obtenerFolios() {
      try {
        const { data } = await foliosApi.getLinea1();
        this.folios = data;
        this.$nextTick(() => {
          this.calcularAnchosColumnas();
        });
      } catch (error) {
        console.error("Error al obtener los folios:", error);
      }
    },

    formatearFecha(val) {
      if (!val) return '';
      const fecha = new Date(val);
      if (isNaN(fecha.getTime())) return '';
      const dia = fecha.getDate();
      const mes = fecha.getMonth();
      const año = fecha.getFullYear();
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      return `${dia} de ${meses[mes]} de ${año}`;
    },

    calcularAnchosColumnas() {
      this.columnWidths.numeroFolio = this.$refs.numeroFolio.offsetWidth;
      this.columnWidths.clienteAsignado = this.$refs.clienteAsignado.offsetWidth;
      this.columnWidths.referencia = this.$refs.referencia.offsetWidth;
      this.columnWidths.referencia2 = this.$refs.referencia2.offsetWidth;
      this.columnWidths.cantidadCredito = this.$refs.cantidadCredito.offsetWidth;
      this.columnWidths.uso = this.$refs.uso.offsetWidth;
      this.columnWidths.year = this.$refs.year.offsetWidth;
      this.columnWidths.estado = this.$refs.estado.offsetWidth;
      this.columnWidths.fechaAlta = this.$refs.fechaAlta.offsetWidth;
      this.columnWidths.nombreLogin = this.$refs.nombreLogin.offsetWidth;
      this.columnWidths.placaAsignada = this.$refs.placaAsignada.offsetWidth;
      this.columnWidths.utilizado = this.$refs.utilizado.offsetWidth;
    }
  }
};
</script>
