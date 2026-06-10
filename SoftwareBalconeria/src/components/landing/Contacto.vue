<template>
  <div class="contacto-container">

    <!-- Encabezado -->
    <section class="page-header">
      <h2>Contáctanos</h2>
      <div class="title-bar"></div>
      <p class="sub">Estamos listos para atender tus dudas o solicitudes</p>
    </section>

    <!-- Contenido -->
    <section class="content-section">
      <div class="content-inner">

        <!-- Formulario -->
        <div class="form-card">
          <h3>Envíanos un mensaje</h3>

          <!-- Éxito -->
          <div v-if="enviado" class="msg-exito">
            <div class="exito-icon">✓</div>
            <p>¡Gracias, <strong>{{ form.nombre }}</strong>! Tu mensaje ha sido enviado. Te contactamos pronto.</p>
            <button class="btn-submit" @click="resetForm">Enviar otro mensaje</button>
          </div>

          <!-- Form -->
          <form v-else @submit.prevent="enviarMensaje" class="form-fields">
            <div class="form-group">
              <label>Nombre</label>
              <input type="text" v-model="form.nombre" placeholder="Tu nombre completo" required :disabled="enviando" />
            </div>
            <div class="form-group">
              <label>Correo electrónico</label>
              <input type="email" v-model="form.correo" placeholder="tu@correo.com" required :disabled="enviando" />
            </div>
            <div class="form-group">
              <label>Teléfono</label>
              <input type="tel" v-model="form.telefono" placeholder="449 000 0000" :disabled="enviando" />
            </div>
            <div class="form-group">
              <label>Mensaje</label>
              <textarea v-model="form.comentario" placeholder="¿En qué podemos ayudarte?" rows="5" required :disabled="enviando"></textarea>
            </div>

            <p v-if="errorMsg" class="msg-error">⚠ {{ errorMsg }}</p>

            <button type="submit" class="btn-submit" :disabled="enviando">
              {{ enviando ? 'Enviando...' : 'Enviar mensaje' }}
            </button>
          </form>
        </div>

        <!-- Info directa -->
        <div class="info-card">
          <h3>Contacto directo</h3>

          <div class="info-item">
            <div class="info-icon">📞</div>
            <div>
              <p class="info-label">Teléfono</p>
              <p class="info-value">449 180 17 69 &nbsp;/&nbsp; 449 197 11 54</p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">✉</div>
            <div>
              <p class="info-label">Email</p>
              <p class="info-value">herreriaguzsa@outlook.es</p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">📍</div>
            <div>
              <p class="info-label">Dirección</p>
              <p class="info-value">Parque Industrial Cobalto, Blvd. a Zacatecas Km. 9, Trojes de Alonso</p>
            </div>
          </div>

          <div class="info-item">
            <div class="info-icon">🕐</div>
            <div>
              <p class="info-label">Horario</p>
              <p class="info-value">Lunes a Viernes, 8:00 – 18:00</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- Footer -->
    <footer class="contacto-footer">
      <p>© 2025 MAGUZSA — Corporativo Maguzsa S.A de C.V. Todos los derechos reservados.</p>
    </footer>

  </div>
</template>

<script>
import { cotizacionApi } from '@/service/api';

export default {
  name: 'Contacto',
  data() {
    return {
      enviando: false,
      enviado: false,
      errorMsg: '',
      form: { nombre: '', correo: '', telefono: '', comentario: '' },
    };
  },
  methods: {
    async enviarMensaje() {
      this.enviando = true;
      this.errorMsg = '';
      try {
        await cotizacionApi.enviar(this.form);
        this.enviado = true;
      } catch (err) {
        this.errorMsg = err.response?.data?.error || 'Error al enviar. Intenta de nuevo o llámanos directamente.';
      } finally {
        this.enviando = false;
      }
    },
    resetForm() {
      this.enviado = false;
      this.errorMsg = '';
      this.form = { nombre: '', correo: '', telefono: '', comentario: '' };
    },
  },
};
</script>

<style scoped>
* { box-sizing: border-box; }

.contacto-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', system-ui, Arial, sans-serif;
}

/* ── ENCABEZADO ──────────────────────── */
.page-header {
  width: 100%;
  padding: 64px 24px 48px;
  text-align: center;
  background: #fff;
  border-bottom: 1px solid #e8edf2;
}

.page-header h2 {
  font-size: 2.2rem;
  font-weight: 800;
  color: #004AAD;
  margin: 0 0 12px;
}

.title-bar {
  width: 56px;
  height: 4px;
  background: #FBB034;
  border-radius: 2px;
  margin: 0 auto 20px;
}

.sub {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
}

/* ── CONTENIDO ───────────────────────── */
.content-section {
  width: 100%;
  padding: 72px 32px;
  background: #f7f9fc;
}

.content-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 40px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* Formulario */
.form-card {
  flex: 1 1 420px;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.07);
  padding: 40px 36px;
  border: 1.5px solid #e2e8f0;
}

.form-card h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #002a5e;
  margin: 0 0 24px;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #002a5e;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}

.form-group input,
.form-group textarea {
  padding: 10px 13px;
  border: 1.5px solid #dde3ec;
  border-radius: 7px;
  font-size: 0.93rem;
  color: #1a1a2e;
  font-family: inherit;
  background: #fafbff;
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: none;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #004AAD;
  box-shadow: 0 0 0 3px rgba(0,74,173,0.1);
  background: #fff;
}

.form-group input:disabled,
.form-group textarea:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-submit {
  padding: 12px 20px;
  border: none;
  border-radius: 7px;
  background: #004AAD;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
  font-family: inherit;
  margin-top: 4px;
}
.btn-submit:hover { background: #003a8c; transform: translateY(-1px); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.msg-error {
  color: #dc2626;
  font-size: 0.85rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 7px;
  padding: 10px 13px;
  margin: 0;
}

/* Éxito */
.msg-exito {
  text-align: center;
  padding: 24px 0;
}

.exito-icon {
  width: 56px;
  height: 56px;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 900;
  margin: 0 auto 16px;
}

.msg-exito p {
  font-size: 0.95rem;
  color: #475569;
  margin-bottom: 20px;
  line-height: 1.6;
}

/* Info card */
.info-card {
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.info-card h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #002a5e;
  margin: 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.info-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.info-icon {
  width: 42px;
  height: 42px;
  background: #004AAD;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
}

.info-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 0 0 4px;
}

.info-value {
  font-size: 0.93rem;
  color: #1e293b;
  margin: 0;
  line-height: 1.55;
}

/* ── FOOTER ──────────────────────────── */
.contacto-footer {
  width: 100%;
  background: #004AAD;
  padding: 24px;
  text-align: center;
}

.contacto-footer p {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.6);
  margin: 0;
}

/* ── RESPONSIVE ──────────────────────── */
@media (max-width: 768px) {
  .page-header { padding: 48px 16px 36px; }
  .page-header h2 { font-size: 1.7rem; }
  .content-section { padding: 48px 16px; }
  .content-inner { flex-direction: column; }
  .form-card { padding: 28px 20px; }
}
</style>
