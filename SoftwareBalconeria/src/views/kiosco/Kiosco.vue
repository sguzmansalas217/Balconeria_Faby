<template>
  <div class="kiosco-wrap">
    <div class="kiosco-header">
      <img src="@/assets/logo.png" alt="MAGUZSA" class="kiosco-logo" />
      <div class="kiosco-fecha">{{ fechaHoy }} · {{ horaActual }}</div>
    </div>

    <!-- Mensaje de confirmación -->
    <transition name="fade">
      <div v-if="mensaje" :class="['kiosco-toast', mensaje.tipo]">
        <i :class="mensaje.tipo === 'success' ? 'pi pi-check-circle' : 'pi pi-times-circle'"></i>
        {{ mensaje.texto }}
      </div>
    </transition>

    <h2 class="kiosco-title">Registro de Asistencia</h2>
    <p class="kiosco-sub">Selecciona tu nombre y registra tu entrada o salida</p>

    <div v-if="cargando" class="kiosco-loading">
      <i class="pi pi-spin pi-spinner"></i> Cargando...
    </div>

    <div v-else class="kiosco-grid">
      <div
        v-for="emp in empleados"
        :key="emp.id"
        class="emp-card"
        :class="{ 'emp-card--entrada': emp.hora_entrada && !emp.hora_salida, 'emp-card--completo': emp.hora_salida }"
      >
        <div class="emp-avatar">{{ iniciales(emp.name || emp.email) }}</div>
        <div class="emp-nombre">{{ emp.name || emp.email }}</div>

        <div class="emp-status">
          <span v-if="!emp.hora_entrada" class="status-badge status-pendiente">Sin registro</span>
          <span v-else-if="!emp.hora_salida" class="status-badge status-dentro">
            Entró {{ formatHora(emp.hora_entrada) }}
          </span>
          <span v-else class="status-badge status-salio">
            {{ formatHora(emp.hora_entrada) }} – {{ formatHora(emp.hora_salida) }}
            ({{ emp.horas_trabajadas }}h)
          </span>
        </div>

        <div class="emp-btns">
          <button
            v-if="!emp.hora_entrada"
            class="kiosco-btn btn-entrada"
            @click="registrar(emp, 'entrada')"
            :disabled="procesando === emp.id"
          >
            <i class="pi pi-sign-in"></i> Entrada
          </button>
          <button
            v-else-if="!emp.hora_salida"
            class="kiosco-btn btn-salida"
            @click="registrar(emp, 'salida')"
            :disabled="procesando === emp.id"
          >
            <i class="pi pi-sign-out"></i> Salida
          </button>
          <span v-else class="kiosco-btn btn-done">
            <i class="pi pi-check"></i> Completo
          </span>
        </div>
      </div>

      <div v-if="empleados.length === 0" class="kiosco-empty">
        No hay empleados activos configurados
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { asistenciasApi } from "@/service/api";

const empleados  = ref([]);
const cargando   = ref(true);
const procesando = ref(null);
const mensaje    = ref(null);
const horaActual = ref("");
const fechaHoy   = ref("");

let reloj = null;
let msgTimer = null;

const cargar = async () => {
  try {
    const { data } = await asistenciasApi.getKiosco();
    empleados.value = data;
  } catch (e) {
    console.error(e);
  } finally {
    cargando.value = false;
  }
};

const registrar = async (emp, tipo) => {
  procesando.value = emp.id;
  try {
    const fn = tipo === "entrada" ? asistenciasApi.registrarEntrada : asistenciasApi.registrarSalida;
    const { data } = await fn(emp.id);
    mostrarMensaje(`${data.nombre}: ${tipo === "entrada" ? "✓ Entrada registrada" : "✓ Salida registrada"}`, "success");
    await cargar();
  } catch (err) {
    mostrarMensaje(err.response?.data?.error || "Error al registrar", "error");
  } finally {
    procesando.value = null;
  }
};

const mostrarMensaje = (texto, tipo) => {
  clearTimeout(msgTimer);
  mensaje.value = { texto, tipo };
  msgTimer = setTimeout(() => { mensaje.value = null; }, 3500);
};

const iniciales = (nombre) => nombre.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
const formatHora = (ts) => ts ? new Date(ts).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "";

const actualizarReloj = () => {
  const ahora = new Date();
  horaActual.value = ahora.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  fechaHoy.value   = ahora.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
};

onMounted(() => {
  cargar();
  actualizarReloj();
  reloj = setInterval(actualizarReloj, 1000);
});

onUnmounted(() => {
  clearInterval(reloj);
  clearTimeout(msgTimer);
});
</script>

<style scoped>
.kiosco-wrap {
  min-height: 100vh;
  background: linear-gradient(135deg, #001f4d 0%, #004AAD 100%);
  padding: 24px 20px 40px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.kiosco-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}

.kiosco-logo {
  height: 48px;
  filter: brightness(0) invert(1);
}

.kiosco-fecha {
  color: rgba(255,255,255,0.75);
  font-size: 0.9rem;
  text-transform: capitalize;
}

.kiosco-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 1rem;
}
.kiosco-toast.success { background: #dcfce7; color: #166534; }
.kiosco-toast.error   { background: #fee2e2; color: #991b1b; }

.kiosco-title {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 6px;
  text-align: center;
}

.kiosco-sub {
  color: rgba(255,255,255,0.65);
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 32px;
}

.kiosco-loading {
  color: #fff;
  text-align: center;
  font-size: 1.1rem;
  padding: 60px;
}

.kiosco-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 18px;
  max-width: 1100px;
  margin: 0 auto;
}

.emp-card {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 16px;
  padding: 24px 16px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: background 0.2s;
}
.emp-card--entrada { background: rgba(251,191,36,0.12); border-color: rgba(251,191,36,0.4); }
.emp-card--completo { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); }

.emp-avatar {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #FBB034, #ff7c00);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
}

.emp-nombre {
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
}

.emp-status { width: 100%; text-align: center; }

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 600;
}
.status-pendiente { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.6); }
.status-dentro    { background: rgba(251,191,36,0.2);  color: #fbbf24; }
.status-salio     { background: rgba(34,197,94,0.2);   color: #4ade80; }

.emp-btns { width: 100%; }

.kiosco-btn {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: opacity 0.2s;
}
.kiosco-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-entrada { background: #FBB034; color: #002a5e; }
.btn-entrada:hover:not(:disabled) { background: #ffc72c; }
.btn-salida  { background: #ef4444; color: #fff; }
.btn-salida:hover:not(:disabled)  { background: #dc2626; }
.btn-done    { background: rgba(34,197,94,0.2); color: #4ade80; cursor: default; }

.kiosco-empty {
  color: rgba(255,255,255,0.5);
  text-align: center;
  padding: 60px;
  grid-column: 1/-1;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
